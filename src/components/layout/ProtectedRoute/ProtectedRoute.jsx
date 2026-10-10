import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useTranslation } from '../../../i18n/index.jsx';
import Spinner from '../../common/Spinner/Spinner.jsx';
import EmptyState from '../../common/EmptyState/EmptyState.jsx';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" color="var(--color-primary)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  if (roles && !hasRole(roles)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <EmptyState
          icon={<ShieldAlert size={40} />}
          title={t('common.error')}
          description="403 Forbidden: You do not have the required permissions to access this scholarly resource."
          actionText={t('common.back')}
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  return children;
}
