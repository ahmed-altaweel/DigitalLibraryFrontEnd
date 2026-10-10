import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import styles from './AuthPages.module.css';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
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
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      toast.success(t('auth.loginSuccess'));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      } else {
        setErrors({ general: err.message || 'Registration failed' });
      }
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <BookOpen size={36} className={styles.authLogo} />
          <h1 className={styles.authTitle}>{t('auth.registerTitle')}</h1>
          <p className={styles.authSubtitle}>{t('auth.registerSubtitle')}</p>
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
            label={t('auth.username')}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="ibn_khaldun"
            icon={<User size={18} />}
            autoComplete="username"
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
            autoComplete="new-password"
            required
          />

          <Input
            label={t('auth.confirmPassword')}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            icon={<Lock size={18} />}
            autoComplete="new-password"
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
            {t('nav.register')}
          </Button>
        </form>

        <div className={styles.authFooter}>
          <Link to="/login">{t('auth.haveAccount')}</Link>
        </div>
      </div>
    </div>
  );
}
