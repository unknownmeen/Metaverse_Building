import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PRIORITY } from '../data/mockData';
import { t } from '../services/i18n';
import { cn } from '../lib/utils';

const ORDER = ['normal', 'important', 'urgent'];

export default function PrioritySelect({ value, onChange, disabled, showLabel = true, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selected = ORDER.map((k) => PRIORITY[k.toUpperCase()]).find((p) => p?.key === value) || PRIORITY.NORMAL;

  return (
    <div ref={ref} className={cn('relative', className)}>
      {showLabel && (
        <label className="text-xs font-semibold text-slate-400 mb-1.5 block text-right">
          {t('mission.priority')}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-slate-300 transition-all disabled:opacity-60 text-right"
      >
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium"
          style={{ backgroundColor: selected.bg, color: selected.color }}
        >
          {t(`status.priority.${selected.key}`)}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 py-1">
          {ORDER.map((key) => {
            const p = PRIORITY[key.toUpperCase()];
            if (!p) return null;
            const isSelected = value === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  onChange(p.key);
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2.5 text-right transition-colors',
                  isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                )}
              >
                {isSelected ? (
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                ) : (
                  <span className="w-4 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    'inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium',
                    isSelected && 'bg-blue-100 text-primary-600'
                  )}
                  style={!isSelected ? { backgroundColor: p.bg, color: p.color } : {}}
                >
                  {t(`status.priority.${p.key}`)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
