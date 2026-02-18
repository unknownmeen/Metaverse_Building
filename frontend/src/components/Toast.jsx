import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    progressColor: 'bg-emerald-400',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    progressColor: 'bg-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    progressColor: 'bg-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    progressColor: 'bg-blue-400',
  },
};

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.error;
  const Icon = config.icon;
  const duration = toast.duration || 5000;

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 300);
    const removeTimer = setTimeout(() => onRemove(toast.id), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, duration, onRemove]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm min-w-[300px] max-w-[420px] overflow-hidden transition-all duration-300 ${config.bg} ${config.border} ${
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      }`}
      style={{ animation: exiting ? 'none' : 'slideInRight 0.3s ease-out' }}
      dir="rtl"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

      <p className={`text-sm leading-relaxed flex-1 ${config.text}`}>
        {toast.message}
      </p>

      <button
        onClick={() => onRemove(toast.id)}
        className={`flex-shrink-0 p-0.5 rounded-lg hover:bg-black/5 transition-colors ${config.text}`}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-black/5">
        <div
          className={`h-full ${config.progressColor}`}
          style={{
            animation: `shrinkWidth ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
