/**
 * @file NotificationContext.jsx
 * @description Global toast/notification system. Wraps the app once (see
 * main.jsx) and exposes useNotify() so any component or hook can fire a
 * toast from anywhere, including plain modules like api.js via a registered
 * bridge (see App.jsx + services/api.js's registerApiHandlers).
 */
import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import ToastContainer from '../components/ui/ToastContainer';

const NotificationContext = createContext();

const MAX_TOASTS = 4;
const DEFAULT_DURATIONS = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 8000,
};

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const timersRef = useRef({});

  // Two-phase removal: mark the toast as exiting so Toast.jsx can play the
  // toastOut animation, then actually drop it from the array once that
  // animation has had time to finish.
  const dismiss = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200); // matches --duration-base
  }, []);

  const addToast = useCallback((type, message, opts = {}) => {
    const id = ++idRef.current;
    const hasRetry = typeof opts.retry === 'function';
    const duration = opts.duration ?? (hasRetry ? Infinity : DEFAULT_DURATIONS[type]);

    const toast = {
      id,
      type,
      message,
      retry: opts.retry,
      duration,
      dismissible: true,
    };

    setToasts((prev) => {
      const next = [...prev, toast];
      // Cap concurrent toasts, dropping the oldest on overflow
      if (next.length > MAX_TOASTS) {
        const dropped = next.shift();
        if (timersRef.current[dropped.id]) {
          clearTimeout(timersRef.current[dropped.id]);
          delete timersRef.current[dropped.id];
        }
      }
      return next;
    });

    if (duration !== Infinity) {
      timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss]);

  const notify = {
    success: (message, opts) => addToast('success', message, opts),
    error: (message, opts) => addToast('error', message, opts),
    warning: (message, opts) => addToast('warning', message, opts),
    info: (message, opts) => addToast('info', message, opts),
    dismiss,
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotificationContext);
}
