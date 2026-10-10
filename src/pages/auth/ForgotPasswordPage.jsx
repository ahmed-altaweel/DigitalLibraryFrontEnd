import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import styles from './AuthPages.module.css';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success(t('auth.forgotPasswordSubtitle'));
    } catch {
      // Always show sent to prevent account enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <CheckCircle2 size={40} color="var(--color-success)" className={styles.authLogo} />
            <h1 className={styles.authTitle}>{t('auth.forgotPasswordTitle')}</h1>
            <p className={styles.authSubtitle}>
              If an account with <strong>{email}</strong> exists, reset instructions have been dispatched.
            </p>
          </div>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="outline" fullWidth>
              {t('common.back')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <BookOpen size={36} className={styles.authLogo} />
          <h1 className={styles.authTitle}>{t('auth.forgotPasswordTitle')}</h1>
          <p className={styles.authSubtitle}>{t('auth.forgotPasswordSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={error}
            placeholder="scholar@library.edu"
            icon={<Mail size={18} />}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
            {t('auth.sendResetLink')}
          </Button>
        </form>

        <div className={styles.authFooter}>
          <Link to="/login">{t('auth.haveAccount')}</Link>
        </div>
      </div>
    </div>
  );
}
