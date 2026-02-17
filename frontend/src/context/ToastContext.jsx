import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toastService } from '../services/toastService';

const ToastContext = createContext();

const MAX_TOASTS = 5;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe((toast) => {
      setToasts((prev) => {
        const isDuplicate = prev.some((t) => t.message === toast.message);
        if (isDuplicate) return prev;

        const next = [...prev, toast];
        return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
      });
    });
    return unsubscribe;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
