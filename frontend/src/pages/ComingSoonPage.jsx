import { Clock, Sparkles } from 'lucide-react';
import { t } from '../services/i18n';

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-200 rotate-6">
          <Clock className="w-12 h-12 text-white -rotate-6" />
        </div>
        <div className="absolute -top-2 -left-2">
          <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>
      </div>
      <h1 className="text-2xl font-black text-slate-800 mb-2">{t('coming_soon.title')}</h1>
      <p className="text-base text-slate-500 mb-4">{t('coming_soon.description')}</p>
      <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-5 py-2.5 rounded-2xl text-sm font-semibold border border-amber-200">
        <Sparkles className="w-4 h-4" />
        {t('coming_soon.badge')}
      </div>
    </div>
  );
}
