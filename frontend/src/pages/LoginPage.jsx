import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { useApp } from '../context/AppContext';
import { LOGIN } from '../graphql/mutations';
import { tokenService } from '../services/tokenService';
import { toastService } from '../services/toastService';
import { t } from '../services/i18n';
import { toEnglishDigits, toPersianDigits } from '../lib/persianNumbers';

export default function LoginPage() {
  const { fetchInitialData } = useApp();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [loginMutation, { loading }] = useMutation(LOGIN);

  const handleLogin = async (e) => {
    e.preventDefault();
    const normalizedPhone = toEnglishDigits(phone).replace(/\D/g, '');
    if (!normalizedPhone || !password) {
      setError(t('errors.validation.required_fields'));
      return;
    }

    try {
      setError('');
      const { data } = await loginMutation({
        variables: {
          input: { phone: normalizedPhone, password },
        },
      });

      if (data?.login?.accessToken) {
        tokenService.setToken(data.login.accessToken, data.login.expiresIn);
        const initialized = await fetchInitialData();
        if (!initialized) {
          setError(t('errors.auth.login_failed'));
          return;
        }
        toastService.success(t('success.login'));
        navigate('/projects');
      }
    } catch (err) {
      const isCredentialError = err?.graphQLErrors?.some(
        (e) => /unauthorized|invalid|credentials|password/i.test(e.message)
      );
      setError(isCredentialError
        ? t('errors.auth.invalid_credentials')
        : t('errors.auth.login_failed')
      );
    }
  };

  const formContent = (
    <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-7 space-y-5 border border-slate-100">
      {error && (
        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl border border-red-100 animate-fade-in">
          {error}
        </div>
      )}
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('login.phone_label')}</label>
        <div className="relative">
          <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const normalized = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 11);
              setPhone(toPersianDigits(normalized));
              setError('');
            }}
            placeholder={t('login.phone_placeholder')}
            className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all placeholder:text-slate-300"
            dir="ltr"
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('login.password_label')}</label>
        <div className="relative">
          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder={t('login.password_placeholder')}
            className="w-full pr-12 pl-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all placeholder:text-slate-300"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-l from-primary-500 to-primary-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('common.logging_in')}
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            {t('login.submit')}
          </>
        )}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Desktop: Right panel — Hero image (بزرگ، نزدیک به فرم) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center pr-8 lg:pr-12">
        <div className="w-full max-w-md aspect-[3/4] rounded-[2rem] overflow-hidden shadow-xl shrink-0 relative">
          <img
            src="/login-hero.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* Desktop: Left panel — Form نزدیک به عکس */}
      <div className="hidden lg:flex flex-1 min-h-screen items-center justify-start p-4 lg:p-6 lg:pr-8 xl:pr-12">
        <div className="w-full max-w-sm">
          {formContent}
        </div>
      </div>

      {/* Mobile: image + form centered */}
      <div className="flex lg:hidden flex-1 flex-col items-center justify-center p-4 sm:p-6 gap-5 sm:gap-6">
        <div className="w-full max-w-sm flex-shrink-0">
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-slate-200/60 ring-1 ring-slate-100/80">
            <img
              src="/login-hero.png"
              alt=""
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
        <div className="w-full max-w-sm">
          {formContent}
        </div>
      </div>
    </div>
  );
}
