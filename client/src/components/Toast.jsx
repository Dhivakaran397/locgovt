import React from 'react';
import { useToast } from '../context/ToastContext';

const ICONS = {
  success: (
    <svg className="w-5 h-5 flex-shrink-0 text-gov-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 flex-shrink-0 text-gov-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  xp: (
    <svg className="w-5 h-5 flex-shrink-0 text-gov-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const COLORS = {
  success: { border: '#bbf7d0', bg: '#f0fdf4', bar: '#16a34a' },
  error:   { border: '#fecaca', bg: '#fee2e2', bar: '#dc2626' },
  info:    { border: '#bae6fd', bg: '#f0f9ff', bar: '#0284c7' },
  xp:      { border: '#e2e8f0', bg: '#f8fafc', bar: '#0f294a' },
};

const ToastItem = ({ id, type = 'info', message, duration = 4000 }) => {
  const { removeToast } = useToast();
  const [progress, setProgress] = React.useState(100);
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    const step = 100 / (duration / 100);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(intervalRef.current);
          removeToast(id);
          return 0;
        }
        return p - step;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [duration, id, removeToast]);

  const c = COLORS[type] || COLORS.info;

  return (
    <div
      className="toast-item"
      style={{
        borderColor: c.border,
        background:  c.bg,
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0">
        {ICONS[type] || ICONS.info}
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs text-slate-800 font-medium leading-relaxed break-words">{message}</p>
      </div>

      <button
        onClick={() => removeToast(id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
        aria-label="Close notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress tracker */}
      <div
        className="toast-progress"
        style={{
          background: c.bar,
          width:      `${progress}%`,
        }}
      />
    </div>
  );
};

const Toast = () => {
  const { toasts } = useToast();

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
};

export default Toast;
