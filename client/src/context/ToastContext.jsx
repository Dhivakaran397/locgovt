import React, { createContext, useContext, useCallback, useReducer } from 'react';

// ── Toast Context ──────────────────────────────────────────────────────────
const ToastContext = createContext(null);

const TOAST_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
};

const toastReducer = (state, action) => {
  switch (action.type) {
    case TOAST_ACTIONS.ADD:
      return [...state, action.payload];
    case TOAST_ACTIONS.REMOVE:
      return state.filter((t) => t.id !== action.payload.id);
    default:
      return state;
  }
};

// ── Provider ───────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback(
    ({ message, type = 'info', duration = 4000, icon = null }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      dispatch({
        type: TOAST_ACTIONS.ADD,
        payload: { id, message, type, icon },
      });

      setTimeout(() => {
        dispatch({ type: TOAST_ACTIONS.REMOVE, payload: { id } });
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id) => {
    dispatch({ type: TOAST_ACTIONS.REMOVE, payload: { id } });
  }, []);

  // Convenience helpers
  const toast = {
    success: (message, opts = {}) =>
      addToast({ message, type: 'success', icon: '✅', ...opts }),
    error: (message, opts = {}) =>
      addToast({ message, type: 'error', icon: '❌', ...opts }),
    info: (message, opts = {}) =>
      addToast({ message, type: 'info', icon: 'ℹ️', ...opts }),
    xp: (xpAmount, opts = {}) =>
      addToast({
        message: `+${xpAmount} CitizenXP earned!`,
        type: 'xp',
        icon: '⚡',
        duration: 5000,
        ...opts,
      }),
    levelUp: (level, opts = {}) =>
      addToast({
        message: `🎉 Level Up! You are now Level ${level}!`,
        type: 'levelup',
        icon: '🏆',
        duration: 6000,
        ...opts,
      }),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

export default ToastContext;
