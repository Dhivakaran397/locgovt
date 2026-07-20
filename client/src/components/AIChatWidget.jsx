import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_ASSISTANT_ID = '81bdd40b-c2ac-4626-9c61-79a10ec6483d';
const DEFAULT_PUBLIC_KEY = '472dbbc9-8aeb-4bc4-9ce6-329f8f30d143';

export default function AIChatWidget() {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [callState, setCallState] = useState('idle'); // 'idle', 'connecting', 'active'
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [assistantId, setAssistantId] = useState(DEFAULT_ASSISTANT_ID);
  const [publicKey, setPublicKey] = useState(DEFAULT_PUBLIC_KEY);
  const [showConfig, setShowConfig] = useState(false);

  const vapiRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts, currentText]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const startVoiceCall = () => {
    setCallState('connecting');
    setTranscripts([]);
    setCurrentText('');

    try {
      // Initialize Vapi client
      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;

      // Event listeners
      vapi.on('call-start', () => {
        setCallState('active');
        setTranscripts([{ role: 'assistant', text: 'Voice call connected. Start speaking!' }]);
      });

      vapi.on('call-end', () => {
        setCallState('idle');
        vapiRef.current = null;
      });

      vapi.on('speech-start', () => {
        // Visual cue user started speaking
      });

      vapi.on('speech-end', () => {
        // Visual cue user stopped speaking
      });

      vapi.on('message', (msg) => {
        if (msg.type === 'transcript') {
          const text = msg.transcript;
          if (msg.transcriptType === 'partial') {
            setCurrentText(`${msg.role === 'user' ? 'You' : 'Assistant'}: ${text}`);
          } else {
            setCurrentText('');
            setTranscripts((prev) => [
              ...prev,
              { role: msg.role, text: text }
            ]);
          }
        }
      });

      vapi.on('error', (err) => {
        console.error('Vapi Call Error:', err);
        setTranscripts((prev) => [
          ...prev,
          { role: 'assistant', text: 'Call error. Please check your credentials or network.' }
        ]);
        setCallState('idle');
        vapiRef.current = null;
      });

      // Start the call
      vapi.start(assistantId);

    } catch (error) {
      console.error('Vapi Init Error:', error);
      setCallState('idle');
    }
  };

  const endVoiceCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setCallState('idle');
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const nextMuted = !isMuted;
      vapiRef.current.setMuted(nextMuted);
      setIsMuted(nextMuted);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 bg-gradient-to-tr from-gov-navy to-gov-blue hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-xl transition-all relative border border-white/20"
        aria-label="Toggle voice assistant"
        id="vapi-float-btn"
      >
        <img
          src="/logo-opt2.png"
          alt="LocGovt AI"
          className="w-full h-full rounded-full object-cover select-none"
          id="vapi-avatar-img"
        />
        {callState === 'active' && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
        )}
      </button>

      {/* Expanded Assistant Card */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[500px] animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-gov-navy to-gov-blue p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <img
                src="/logo-opt2.png"
                alt="LocGovt AI Mini"
                className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm shrink-0 select-none"
              />
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase">LocGovt Voice AI</h3>
                <p className="text-[9px] text-slate-300 font-mono">
                  {callState === 'active' ? 'Call Active' : callState === 'connecting' ? 'Connecting...' : 'Click Call to Start'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-all text-xs"
                id="vapi-close-btn"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat/Transcript Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] max-h-[300px] bg-slate-50/50">
            {transcripts.map((t, idx) => (
              <div key={idx} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-2.5 text-xs leading-relaxed shadow-sm font-medium ${
                  t.role === 'user'
                    ? 'bg-gov-navy text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}>
                  <span className="block text-[8px] opacity-60 uppercase tracking-widest font-mono mb-0.5">
                    {t.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  {t.text}
                </div>
              </div>
            ))}

            {currentText && (
              <div className="flex justify-start animate-pulse">
                <div className="max-w-[85%] bg-slate-200/80 rounded-lg p-2.5 text-xs text-slate-600 leading-relaxed font-mono">
                  {currentText}
                </div>
              </div>
            )}

            {transcripts.length === 0 && !currentText && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <span className="text-3xl animate-bounce">🎙️</span>
                <p className="text-xs text-slate-500 font-medium">
                  {locale === 'ta'
                    ? 'AI உதவியாளருடன் பேச கீழே உள்ள Call பட்டனை அழுத்தவும்'
                    : 'Click Start Call below to start a live voice chat with the AI assistant!'}
                </p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Active Call UI Waveforms */}
          {callState === 'active' && (
            <div className="px-4 py-2 bg-slate-100 border-t border-b border-slate-200 flex items-center justify-center gap-1.5 h-8">
              <span className="w-1 bg-gov-blue h-3 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 bg-gov-blue h-5 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 bg-gov-blue h-2 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="w-1 bg-gov-blue h-4 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              <span className="w-1 bg-gov-blue h-3 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          )}

          {/* Controls Footer */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
            {callState === 'idle' ? (
              <button
                onClick={startVoiceCall}
                className="w-full btn-cyan py-2.5 rounded-lg font-display tracking-widest text-[10px] flex items-center justify-center gap-2 uppercase shadow-md"
                id="vapi-start-call-btn"
              >
                <span>📞</span>
                <span>{locale === 'ta' ? 'அழைப்பைத் தொடங்கு' : 'Start Call'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                    isMuted
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                  id="vapi-mute-btn"
                >
                  <span>{isMuted ? '🔇 Unmute' : '🎙️ Mute'}</span>
                </button>

                <button
                  onClick={endVoiceCall}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-md"
                  id="vapi-end-call-btn"
                >
                  <span>❌</span>
                  <span>{locale === 'ta' ? 'முடிக்கவும்' : 'End Call'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
