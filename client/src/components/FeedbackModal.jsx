import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const STAR_LABELS = ['', 'Very Poor', 'Poor', 'Satisfactory', 'Good', 'Excellent'];

const StarButton = ({ star, hovered, selected, onHover, onLeave, onClick }) => {
  const filled = star <= (hovered || selected);
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(star)}
      onMouseLeave={onLeave}
      onClick={() => onClick(star)}
      className="transition-all duration-100 focus:outline-none"
      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
    >
      <svg
        className="w-8 h-8 transition-transform duration-100"
        style={{
          transform: filled ? 'scale(1.1)' : 'scale(1)',
        }}
        fill={filled ? '#f59e0b' : 'none'}
        viewBox="0 0 24 24"
        stroke={filled ? '#f59e0b' : '#cbd5e1'}
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
};

const FeedbackModal = ({ service, onClose }) => {
  const { user }       = useUser();
  const { addToast }   = useToast();
  const { t }          = useLanguage();
  const overlayRef     = useRef(null);

  const [step, setStep]       = useState(1);
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [form, setForm]       = useState({
    timeframe:  '',
    comment:    '',
    wasHelpful: null,
  });
  const [loading, setLoading] = useState(false);
  const [earned,  setEarned]  = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  const handleSubmit = async () => {
    if (!rating)           return addToast({ type: 'info', message: 'Please select a star rating.' });
    if (!form.timeframe)   return addToast({ type: 'info', message: 'Please select completion timeframe.' });

    setLoading(true);
    try {
      const payload = {
        serviceId:           service._id,
        userId:              user?._id || user?.id || user?.username || 'anonymous_user',
        username:            user?.username || 'Citizen',
        district:            user?.district || 'Chennai',
        userDistrict:        user?.district || 'Chennai',
        rating,
        starRating:          rating,
        timeframe:           form.timeframe,
        processingTimeframe: form.timeframe,
        comment:             form.comment.trim(),
        citizenComment:      form.comment.trim(),
        wasHelpful:          form.wasHelpful,
      };
      const res = await axios.post('/api/feedback', payload);
      const xpGain = res.data?.xpEarned || 30;
      setEarned(xpGain);
      setStep(3);
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Feedback log failed.' });
    } finally {
      setLoading(false);
    }
  };

  const TIMEFRAME_OPTIONS = [
    { value: 'Under 5 minutes',   label: t('navHome') === 'முகப்பு' ? '5 நிமிடத்திற்குள்' : t('navHome') === 'होम' ? '5 मिनट से कम' : 'Under 5 min' },
    { value: '5–15 minutes',      label: t('navHome') === 'முகப்பு' ? '5-15 நிமிடங்கள்' : t('navHome') === 'होम' ? '5-15 मिनट' : '5–15 min' },
    { value: '15–30 minutes',     label: t('navHome') === 'முகப்பு' ? '15-30 நிமிடங்கள்' : t('navHome') === 'होम' ? '15-30 मिनट' : '15–30 min' },
    { value: '30–60 minutes',     label: t('navHome') === 'முகப்பு' ? '30-60 நிமிடங்கள்' : t('navHome') === 'होम' ? '30-60 मिनट' : '30–60 min' },
    { value: 'Over an hour',      label: t('navHome') === 'முகப்பு' ? '1 மணிநேரத்திற்கும் மேல்' : t('navHome') === 'होम' ? '1 घंटे से अधिक' : 'Over 1 hour' },
    { value: 'Multiple sessions', label: t('navHome') === 'முகப்பு' ? 'பல அமர்வுகள்' : t('navHome') === 'होम' ? 'कई सत्र' : 'Multi-session' },
  ];

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content max-w-md w-full">

        {/* ── STEP 1: Star Rating ──────────────────────────────────── */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label mb-1">{t('modalTitle')}</p>
                <h2 id="modal-title" className="text-slate-800 font-bold text-sm leading-snug">
                  {service.serviceName}
                </h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm" id="feedback-close-btn">
                ✕
              </button>
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center gap-2 py-2 border-y border-slate-100">
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map((s) => (
                  <StarButton
                    key={s}
                    star={s}
                    hovered={hovered}
                    selected={rating}
                    onHover={setHovered}
                    onLeave={() => setHovered(0)}
                    onClick={setRating}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-500 font-mono tracking-widest uppercase h-4">
                {STAR_LABELS[hovered || rating] || ''}
              </p>
            </div>

            {/* Was Helpful */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-bold text-center">{t('modalHelpful')}</p>
              <div className="flex gap-2">
                {[
                  {
                    value: true,
                    textKey: 'modalYes',
                    bg: 'rgba(13,122,60,0.1)',
                    border: '#bbf7d0',
                    textColor: '#0d7a3c',
                    icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                      </svg>
                    )
                  },
                  {
                    value: false,
                    textKey: 'modalNo',
                    bg: 'rgba(220,38,38,0.1)',
                    border: '#fecaca',
                    textColor: '#dc2626',
                    icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7L2.34 12.7a2 2 0 002 2.3zM17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3"/>
                      </svg>
                    )
                  },
                ].map((opt) => {
                  const labelText = t(opt.textKey).replace(/^[👍👎]\s*/, '');
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => setForm((p) => ({ ...p, wasHelpful: opt.value }))}
                      className="flex-1 py-2 rounded font-mono text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background:  form.wasHelpful === opt.value ? opt.bg : '#ffffff',
                        borderColor: form.wasHelpful === opt.value ? opt.border : '#cbd5e1',
                        color:       form.wasHelpful === opt.value ? opt.textColor : '#475569',
                      }}
                      id={`helpful-${opt.value}-btn`}
                    >
                      {opt.icon}
                      <span>{labelText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => rating ? setStep(2) : addToast({ type: 'info', message: 'Please select a rating star first.' })}
              className="w-full btn-cyan py-3 font-display tracking-widest text-[10px]"
              id="feedback-next-btn"
            >
              {t('modalContinue')}
            </button>
          </div>
        )}

        {/* ── STEP 2: Details ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label mb-1">{t('modalDetailedLogs')}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-slate-700">{STAR_LABELS[rating]}</span>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold" id="feedback-close-step2">
                ✕
              </button>
            </div>

            {/* Timeframe */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">{t('modalTimeframe')}</label>
              <div className="grid grid-cols-3 gap-2">
                {TIMEFRAME_OPTIONS.map((tOpt) => (
                  <button
                    key={tOpt.value}
                    onClick={() => setForm((p) => ({ ...p, timeframe: tOpt.value }))}
                    className="py-2 px-1 rounded text-[9px] font-mono font-bold border transition-all"
                    style={{
                      background:  form.timeframe === tOpt.value ? 'rgba(15, 41, 74, 0.08)' : '#ffffff',
                      borderColor: form.timeframe === tOpt.value ? 'var(--gov-navy)' : '#cbd5e1',
                      color:       form.timeframe === tOpt.value ? 'var(--gov-navy)' : '#475569',
                    }}
                    id={`timeframe-${tOpt.value.replace(/\s+/g, '-')}`}
                  >
                    {tOpt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                {t('modalComment')}
              </label>
              <textarea
                rows={3}
                value={form.comment}
                onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                className="input-field text-xs resize-none"
                placeholder={t('modalCommentPlaceholder')}
                maxLength={1000}
                id="feedback-comment"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep(1)} className="btn-ghost px-4 py-2 font-display text-[9px]" id="feedback-back-btn">
                {t('modalBack')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 btn-cyan py-2.5 font-display tracking-widest text-[9px]"
                id="feedback-submit-btn"
              >
                {loading ? 'SUBMITTING...' : t('modalSubmit')}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Success ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-gov-green text-2xl shadow-sm">
              ✓
            </div>

            <div className="space-y-1">
              <p className="font-display text-slate-800 font-bold text-sm tracking-wide">{t('modalLogged')}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{t('modalLoggedDesc')}</p>
            </div>

            {earned > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded px-6 py-2 flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gov-navy">{t('modalXpEarned', { earned })}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn-cyan px-8 py-2.5 font-display tracking-widest text-[9px]"
              id="feedback-done-btn"
            >
              {t('modalDone')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
