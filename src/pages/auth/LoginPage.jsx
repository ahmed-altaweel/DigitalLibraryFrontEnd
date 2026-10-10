import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import styles from './AuthPages.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get('returnUrl') || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await login({ email: formData.email, password: formData.password });
      toast.success(t('auth.loginSuccess'));
      navigate(returnUrl, { replace: true });
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      } else {
        setErrors({ general: err.message || 'Invalid credentials' });
      }
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <BookOpen size={36} className={styles.authLogo} />
          <h1 className={styles.authTitle}>{t('auth.loginTitle')}</h1>
          <p className={styles.authSubtitle}>{t('auth.loginSubtitle')}</p>
        </div>

        {errors.general && (
          <div className={styles.errorBanner} role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
          <Input
            label={t('auth.email')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="scholar@library.edu"
            icon={<Mail size={18} />}
            autoComplete="email"
            required
          />

          <Input
            label={t('auth.password')}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            icon={<Lock size={18} />}
            autoComplete="current-password"
            required
          />

          <div className={styles.forgotLink}>
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
            {t('nav.login')}
          </Button>
        </form>

        <div className={styles.authFooter}>
          <Link to="/register">{t('auth.needAccount')}</Link>
        </div>
      </div>
    </div>
  );
}
