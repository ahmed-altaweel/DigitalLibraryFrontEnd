import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authApi } from '../../services/api.js';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Button from '../../components/common/Button/Button.jsx';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        language,
      });
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success(t('common.success'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
      toast.error(err.message || t('common.error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, maxWidth: '640px', minWidth: 0 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }}>
            {t('member.settingsTitle')}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
            Manage your scholarly identity, security, and interface preferences.
          </p>
        </div>

        {/* 1. Profile Information */}
        <Card style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', margin: '0 0 var(--space-4)', color: 'var(--color-primary)' }}>
            {t('member.profileInfo')}
          </h2>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label={t('auth.username')}
              value={user?.username || ''}
              disabled
              readOnly
            />

            <Input
              label={t('auth.email')}
              value={user?.email || ''}
              disabled
              readOnly
            />

            <Input
              label={t('member.fullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Fatima Al-Zahra"
            />

            <Input
              textarea
              rows={3}
              label={t('member.bio')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Research interests, institutional affiliation..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" loading={profileLoading}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. Reader & Interface Preferences */}
        <Card style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', margin: '0 0 var(--space-4)', color: 'var(--color-primary)' }}>
            Interface Preferences
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
                {t('member.languagePref')}
              </label>
              <Select
                options={[
                  { value: 'ar', label: 'العربية (Arabic - RTL)' },
                  { value: 'en', label: 'English (English - LTR)' },
                ]}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
                {t('member.themePref')}
              </label>
              <Select
                options={[
                  { value: 'light', label: t('reader.themeLight') },
                  { value: 'dark', label: t('reader.themeDark') },
                  { value: 'sepia', label: t('reader.themeSepia') },
                ]}
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* 3. Change Password */}
        <Card>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', margin: '0 0 var(--space-4)', color: 'var(--color-primary)' }}>
            {t('member.changePassword')}
          </h2>

          {passwordError && (
            <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }} role="alert">
              {passwordError}
            </p>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              type="password"
              label={t('member.oldPassword')}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Input
              type="password"
              label={t('member.newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Input
              type="password"
              label={t('auth.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" loading={passwordLoading}>
                {t('member.changePassword')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
