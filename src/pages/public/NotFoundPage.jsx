import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { useTranslation } from '../../i18n/index.jsx';
import Button from '../../components/common/Button/Button.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-8)' }}>
      <SearchX size={64} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }} />
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-4xl)', color: 'var(--color-primary)', margin: '0 0 var(--space-2)' }}>
        404
      </h1>
      <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text)', margin: '0 0 var(--space-3)' }}>
        Page Not Found
      </h2>
      <p style={{ maxWidth: '420px', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-8)', lineHeight: 'var(--leading-relaxed)' }}>
        The scholarly document or page you are looking for does not exist or has been relocated.
      </p>
      <Button variant="primary" size="lg" onClick={() => navigate('/')}>
        {t('nav.home')}
      </Button>
    </div>
  );
}
