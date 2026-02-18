import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { useApp } from '../context/AppContext';
import { LOGIN } from '../graphql/mutations';
import { tokenService } from '../services/tokenService';
import { toastService } from '../services/toastService';
import { t } from '../services/i18n';

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
    if (!phone || !password) {
      setError(t('errors.validation.required_fields'));
      return;
    }

    try {
      setError('');
      const { data } = await loginMutation({
        variables: {
          input: { phone, password },
        },
      });

      if (data?.login?.accessToken) {
        tokenService.setToken(data.login.accessToken);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-200 rotate-6">
            <span className="text-3xl text-white font-black -rotate-6">{t('app.logo_letter')}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-1">{t('app.title')}</h1>
          <p className="text-sm text-slate-500">{t('login.welcome')}</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-7 space-y-5 border border-white">
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
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
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

          <p className="text-center text-xs text-slate-400">
            {t('login.initial_password_hint')}
          </p>
        </form>
      </div>
    </div>
  );
}
