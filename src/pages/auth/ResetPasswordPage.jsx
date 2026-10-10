import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Key } from 'lucide-react';
import { authApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import styles from './AuthPages.module.css';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!token) newErrors.token = 'Reset token is required';
    if (!password) newErrors.password = 'New password is required';
    if (password && password.length < 8) newErrors.password = 'Must be at least 8 characters long';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: password });
      toast.success(t('auth.loginSuccess'));
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Password reset failed');
      setErrors({ general: err.message || 'Invalid or expired reset token' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <BookOpen size={36} className={styles.authLogo} />
          <h1 className={styles.authTitle}>{t('auth.resetPasswordTitle')}</h1>
        </div>

        {errors.general && (
          <div className={styles.errorBanner} role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
          <Input
            label={t('auth.resetToken')}
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            error={errors.token}
            placeholder="Paste reset token here"
            icon={<Key size={18} />}
            required
          />

          <Input
            label={t('member.newPassword')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            icon={<Lock size={18} />}
            required
          />

          <Input
            label={t('auth.confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="••••••••"
            icon={<Lock size={18} />}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
            {t('auth.resetBtn')}
          </Button>
        </form>

        <div className={styles.authFooter}>
          <Link to="/login">{t('auth.haveAccount')}</Link>
        </div>
      </div>
    </div>
  );
}
