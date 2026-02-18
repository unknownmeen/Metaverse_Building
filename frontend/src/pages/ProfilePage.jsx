import { useState, useRef } from 'react';
import { Save, Lock, Eye, EyeOff, Check, Loader2, Camera, LogOut, User } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { useApp } from '../context/AppContext';
import { UPDATE_PROFILE } from '../graphql/mutations';
import { transformUser } from '../graphql/adapters';
import { uploadFile } from '../services/uploadService';
import { toastService } from '../services/toastService';
import { t } from '../services/i18n';
import { LIMITS } from '../lib/validation';
import { toPersianDigits } from '../lib/persianNumbers';

function getProfilePhotoUrl(user) {
  const candidate = user?.avatar || user?.avatarId || '';
  if (typeof candidate !== 'string') return '';
  return candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('/')
    ? candidate
    : '';
}

export default function ProfilePage() {
  const { state, dispatch, logout, refreshProducts, refreshNotifications } = useApp();
  const [name, setName] = useState(state.user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(getProfilePhotoUrl(state.user));
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [saved, setSaved] = useState(false);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  const handleSave = async () => {
    if (!name.trim()) {
      toastService.error(t('errors.validation.name_required'));
      return;
    }
    if (newPassword && newPassword.length < LIMITS.PASSWORD_MIN) {
      toastService.error(t('profile.password_too_short'));
      return;
    }
    try {
      const input = { name: name.trim() };
      if (selectedAvatar) input.avatarId = selectedAvatar;
      if (newPassword) input.password = newPassword;

      const { data } = await updateProfile({ variables: { input } });

      if (data?.updateProfile) {
        dispatch({
          type: 'SET_AUTH_DATA',
          user: transformUser(data.updateProfile),
        });
        await Promise.allSettled([refreshProducts(), refreshNotifications()]);
      }

      toastService.success(t('success.profile_updated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      /* Global error handler shows the toast */
    }
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-xl font-black text-slate-800 mb-6">{t('profile.title')}</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <label className="text-xs font-semibold text-slate-400 mb-3 block">{t('profile.upload_photo')}</label>
          <div className="flex items-center justify-between gap-4 bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{name || t('profile.title')}</p>
                <p className="text-xs text-slate-400">
                  {selectedAvatar ? t('common.saved') : t('common.not_set')}
                </p>
              </div>
            </div>
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setUploadingAvatar(true);
                  const result = await uploadFile(file);
                  setSelectedAvatar(result.url || '');
                } catch {
                  toastService.error(t('common.upload_error'));
                } finally {
                  setUploadingAvatar(false);
                  if (avatarFileRef.current) avatarFileRef.current.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              disabled={uploadingAvatar}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-70"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>{t('profile.upload_photo')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 mb-1">{t('profile.user_info')}</h3>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('profile.full_name')}</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, LIMITS.NAME_MAX))}
              maxLength={LIMITS.NAME_MAX}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all ${
                !name.trim() ? 'border-red-300' : 'border-slate-200'
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('profile.phone')}</label>
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
              <span className="text-sm text-slate-600 font-medium flex-1" dir="ltr">
                {toPersianDigits(state.user?.phone || '')}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                {t('common.not_editable')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            {t('profile.change_password')}
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('profile.current_password')}</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder={t('profile.current_password_placeholder')}
                className="w-full px-4 py-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('profile.new_password')}</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder={t('profile.new_password_placeholder')}
                className="w-full px-4 py-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${
              saved
                ? 'bg-emerald-500 text-white shadow-emerald-200'
                : 'bg-gradient-to-l from-primary-500 to-primary-600 text-white shadow-primary-200 hover:shadow-xl'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('common.saving')}
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                {t('common.saved')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('common.save_changes')}
              </>
            )}
          </button>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" />
            {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
