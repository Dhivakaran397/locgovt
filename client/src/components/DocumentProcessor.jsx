import React, { useState, useCallback, useRef } from 'react';
import { useToast } from '../context/ToastContext';

// ── Constants ───────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ── Helper: human-readable file size ────────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ── Compress a single image File using HTML5 Canvas ─────────────────────────
// Iteratively reduces JPEG quality until the output is below maxSizeBytes.
// Returns: { dataUrl: string, sizeBytes: number, width: number, height: number }
const compressImageOnCanvas = (file, maxSizeBytes = 100 * 1024) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let { naturalWidth: width, naturalHeight: height } = img;

      // Scale down if very large (max 2048px on either dimension)
      const MAX_DIM = 2048;
      if (width > MAX_DIM || height > MAX_DIM) {
        const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Binary-search-like quality reduction loop
      let quality = 0.85;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let base64Data = dataUrl.split(',')[1];
      let sizeBytes = Math.ceil((base64Data.length * 3) / 4);

      // Reduce quality until under maxSizeBytes or quality hits floor
      while (sizeBytes > maxSizeBytes && quality > 0.15) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL('image/jpeg', Math.max(quality, 0.1));
        base64Data = dataUrl.split(',')[1];
        sizeBytes = Math.ceil((base64Data.length * 3) / 4);
      }

      resolve({ dataUrl, sizeBytes, width, height, quality: Math.round(quality * 100) });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = objectUrl;
  });

// ── Compile compressed images into a single PDF using jsPDF ─────────────────
const buildPdf = async (processedImages) => {
  // Dynamically import jsPDF to allow code-splitting
  const { jsPDF } = await import('jspdf');

  let pdf = null;

  for (let i = 0; i < processedImages.length; i++) {
    const { dataUrl, width, height } = processedImages[i];

    // A4 dimensions in mm: 210 x 297
    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN = 10;
    const maxW = PAGE_W - MARGIN * 2;
    const maxH = PAGE_H - MARGIN * 2;

    // Scale image to fit within page margins
    const aspectRatio = width / height;
    let drawW = maxW;
    let drawH = drawW / aspectRatio;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * aspectRatio;
    }

    // Centre on page
    const x = MARGIN + (maxW - drawW) / 2;
    const y = MARGIN + (maxH - drawH) / 2;

    if (i === 0) {
      pdf = new jsPDF({ orientation: drawW > drawH ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
    } else {
      pdf.addPage('a4', drawW > drawH ? 'landscape' : 'portrait');
    }

    pdf.addImage(dataUrl, 'JPEG', x, y, drawW, drawH);
  }

  return pdf;
};

// ── FileItem component ───────────────────────────────────────────────────────
const FileItem = ({ file, processed, onRemove, targetSize }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 group">
    {/* Thumbnail */}
    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
      {processed?.dataUrl ? (
        <img
          src={processed.dataUrl}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-xs text-slate-500">Original: {formatBytes(file.size)}</span>
        {processed && (
          <>
            <span className="text-slate-300">→</span>
            <span className={`text-xs font-bold ${processed.sizeBytes <= targetSize ? 'text-gov-green' : 'text-amber-600'}`}>
              {formatBytes(processed.sizeBytes)}
              {processed.sizeBytes <= targetSize ? ' ✓' : ' ⚠'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Q:{processed.quality}%</span>
          </>
        )}
      </div>
    </div>

    {/* Remove */}
    <button
      onClick={() => onRemove(file.name)}
      className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
      aria-label={`Remove ${file.name}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

// ── DocumentProcessor ────────────────────────────────────────────────────────
// 100% client-side: no uploads, no server calls.
// Uses HTML5 Canvas for image compression and jsPDF for PDF compilation.
// ────────────────────────────────────────────────────────────────────────────
const DocumentProcessor = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);              // { file: File, processed: object|null }
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState('compress');        // 'compress' | 'pdf'
  const [processedAll, setProcessedAll] = useState(false);
  const [targetSize, setTargetSize] = useState(100 * 1024); // default 100 KB target size
  const fileInputRef = useRef(null);

  // ── Validate & add files ──────────────────────────────────────────────────
  const addFiles = useCallback((newFiles) => {
    const validFiles = Array.from(newFiles).filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(`"${f.name}" is not a supported image type.`);
        return false;
      }
      if (f.size > 20 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds the 20MB input limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setFiles((prev) => {
      const existingNames = new Set(prev.map((e) => e.file.name));
      const deduped = validFiles.filter((f) => !existingNames.has(f.name));
      if (deduped.length < validFiles.length) {
        toast.info(`${validFiles.length - deduped.length} duplicate file(s) skipped.`);
      }
      return [...prev, ...deduped.map((file) => ({ file, processed: null }))];
    });
    setProcessedAll(false);
  }, [toast]);

  // ── Drag and Drop handlers ───────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);

  // ── Remove a file ────────────────────────────────────────────────────────
  const removeFile = useCallback((name) => {
    setFiles((prev) => prev.filter((e) => e.file.name !== name));
    setProcessedAll(false);
  }, []);

  const clearAll = () => { setFiles([]); setProcessedAll(false); };

  // ── Process all images through Canvas compression ────────────────────────
  const processImages = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessedAll(false);

    const results = [];
    for (const entry of files) {
      try {
        const compressed = await compressImageOnCanvas(entry.file, targetSize);
        results.push({ file: entry.file, processed: compressed });
      } catch (err) {
        toast.error(`Failed to process "${entry.file.name}": ${err.message}`);
        results.push({ file: entry.file, processed: null });
      }
    }

    setFiles(results);
    setProcessedAll(true);
    setIsProcessing(false);
    toast.success(`${results.filter((r) => r.processed).length} image(s) compressed!`);
  }, [files, toast, targetSize]);

  // ── Download single compressed image ─────────────────────────────────────
  const downloadSingle = (entry) => {
    if (!entry.processed?.dataUrl) return;
    const link = document.createElement('a');
    link.download = `compressed_${entry.file.name.replace(/\.[^.]+$/, '')}.jpg`;
    link.href = entry.processed.dataUrl;
    link.click();
  };

  // ── Build and download PDF ────────────────────────────────────────────────
  const downloadPdf = useCallback(async () => {
    const readyImages = files.filter((e) => e.processed?.dataUrl);
    if (readyImages.length === 0) {
      toast.error('No processed images to compile into PDF.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdf = await buildPdf(readyImages.map((e) => e.processed));
      pdf.save('LocGovt_Documents.pdf');
      toast.success('PDF compiled and downloaded successfully!');
    } catch (err) {
      toast.error(`PDF generation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [files, toast]);

  const processedCount = files.filter((e) => e.processed).length;
  const totalOriginalSize = files.reduce((acc, e) => acc + e.file.size, 0);
  const totalCompressedSize = files.reduce((acc, e) => acc + (e.processed?.sizeBytes || 0), 0);
  const savingsPercent = totalOriginalSize > 0
    ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Privacy-First Processing</p>
          <h2 className="font-display font-bold text-2xl text-gov-navy">Document Processor</h2>
          <p className="text-sm text-slate-500 mt-1">
            Compress images &amp; compile PDFs entirely in your browser — zero uploads.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-center">
          {/* Target Size Select Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1">
            <span className="text-[10px] font-bold font-mono text-slate-500 pl-2">TARGET SIZE:</span>
            <select
              value={targetSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setTargetSize(newSize);
                // Clear previously processed cache to enforce re-compression under new limit
                setFiles((prev) => prev.map((f) => ({ ...f, processed: null })));
                setProcessedAll(false);
              }}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none pr-2 cursor-pointer"
              id="target-size-select"
            >
              <option value={100 * 1024}>Under 100 KB</option>
              <option value={200 * 1024}>Under 200 KB</option>
              <option value={500 * 1024}>Under 500 KB</option>
              <option value={1024 * 1024}>Under 1 MB</option>
            </select>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
            {[
              {
                key: 'compress',
                label: 'Compress',
                id: 'mode-compress',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                )
              },
              {
                key: 'pdf',
                label: 'Make PDF',
                id: 'mode-pdf',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                )
              },
            ].map((m) => (
              <button
                key={m.key}
                id={m.id}
                onClick={() => setMode(m.key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5
                  ${mode === m.key
                    ? 'bg-gov-navy text-white shadow-md'
                    : 'text-slate-600 hover:text-gov-navy hover:bg-slate-200/50'
                  }
                `}
                aria-pressed={mode === m.key}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all duration-300
          ${isDragOver
            ? 'border-gov-blue bg-blue-50/50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-gov-navy hover:bg-slate-50'
          }
        `}
        role="button"
        tabIndex={0}
        aria-label="Drop images here or click to select files"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          aria-hidden="true"
        />

        <div
          className={`
            w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform
            bg-slate-100 border border-slate-200
            ${isDragOver ? 'scale-110' : ''}
          `}
        >
          {isDragOver ? (
            <svg className="w-8 h-8 text-gov-navy animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          )}
        </div>
        <div className="text-center">
          <p className="text-slate-700 font-semibold">
            {isDragOver ? 'Release to add images' : 'Drag & drop images here'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            or click to browse · JPEG, PNG, WebP, GIF · max 20MB each
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="glass-card p-5 space-y-4">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">
                <strong className="text-slate-800">{files.length}</strong> file{files.length !== 1 ? 's' : ''}
              </span>
              {processedCount > 0 && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-gov-green font-semibold">
                    {savingsPercent}% smaller
                  </span>
                  <span className="text-slate-400 text-xs font-mono">
                    {formatBytes(totalOriginalSize)} → {formatBytes(totalCompressedSize)}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-600 transition-colors"
              aria-label="Clear all files"
            >
              Clear all
            </button>
          </div>

          {/* File items */}
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
            {files.map((entry) => (
              <FileItem
                key={entry.file.name}
                file={entry.file}
                processed={entry.processed}
                onRemove={removeFile}
                targetSize={targetSize}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-200">
            {/* Process / Compress */}
            <button
              onClick={processImages}
              disabled={isProcessing || files.length === 0}
              className="btn-cyan py-2.5 px-6 font-display tracking-widest text-[10px] flex items-center justify-center gap-1.5"
              id="process-images-btn"
            >
              {isProcessing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                  <span>COMPRESS ALL</span>
                </>
              )}
            </button>

            {/* Download individual files */}
            {processedAll && mode === 'compress' && (
              files.filter((e) => e.processed).map((entry) => (
                <button
                  key={entry.file.name}
                  onClick={() => downloadSingle(entry)}
                  className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-mono flex items-center gap-1.5"
                  id={`download-${entry.file.name.replace(/\s+/g, '-')}`}
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  <span>{entry.file.name.length > 20 ? entry.file.name.slice(0, 17) + '...' : entry.file.name}</span>
                </button>
              ))
            )}

            {/* Build PDF */}
            {mode === 'pdf' && processedCount > 0 && (
              <button
                onClick={downloadPdf}
                disabled={isProcessing}
                className="btn-purple py-2.5 px-6 font-display tracking-widest text-[10px] flex items-center justify-center gap-1.5"
                id="build-pdf-btn"
              >
                {isProcessing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Building PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span>DOWNLOAD PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <svg className="w-5 h-5 text-gov-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <div>
          <p className="text-sm font-bold text-green-700">100% Private Sandbox</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict local session execution. All files are loaded, compressed, and compiled directly inside your browser session memory. 
            No files are uploaded to our databases, meaning they are completely invisible to other citizens and servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessor;
