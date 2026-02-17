import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Drawer({ open, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm drawer-overlay"
        onClick={onClose}
      />
      {/* Drawer panel — pinned to the LEFT side */}
      <div
        className={cn(
          'absolute left-0 top-0 w-full h-full bg-white shadow-2xl overflow-y-auto drawer-slide-left',
          width
        )}
      >
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
