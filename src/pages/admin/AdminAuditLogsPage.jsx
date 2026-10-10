import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Search, 
  RotateCcw, 
  Eye, 
  ShieldAlert, 
  Clock, 
  Server,
  User
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import Table from '../../components/common/Table/Table.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import Pagination from '../../components/common/Pagination/Pagination.jsx';
import styles from './AdminAuditLogsPage.module.css';

export default function AdminAuditLogsPage() {
  const { t, language } = useTranslation();

  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');

  // Detail inspection modal
  const [inspectLog, setInspectLog] = useState(null);

  // Fetch audit logs
  const { data: logs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-audit-logs', { page, size: pageSize, action: actionFilter, user_id: userIdFilter }],
    queryFn: () => adminApi.getAuditLogs({
      page,
      size: pageSize,
      action: actionFilter.trim() || undefined,
      user_id: userIdFilter.trim() || undefined,
    }),
  });

  const handleResetFilters = () => {
    setActionFilter('');
    setUserIdFilter('');
    setPage(1);
  };

  const getActionBadgeVariant = (act) => {
    const actionUpper = act?.toUpperCase() || '';
    if (actionUpper.includes('DELETE') || actionUpper.includes('DEACTIVATE') || actionUpper.includes('REJECT')) {
      return 'danger';
    }
    if (actionUpper.includes('CREATE') || actionUpper.includes('APPROVE') || actionUpper.includes('PUBLISH')) {
      return 'success';
    }
    if (actionUpper.includes('UPDATE') || actionUpper.includes('REVIEW')) {
      return 'warning';
    }
    return 'secondary';
  };

  const columns = [
    {
      key: 'created_at',
      label: language === 'ar' ? 'التوقيت' : 'Timestamp',
      render: (v) => (
        <span style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} color="var(--color-text-secondary)" />
          {v ? new Date(v).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : '—'}
        </span>
      )
    },
    {
      key: 'action',
      label: language === 'ar' ? 'الحدث / العملية' : 'Action',
      render: (v) => <Badge variant={getActionBadgeVariant(v)}>{v}</Badge>
    },
    {
      key: 'user_id',
      label: language === 'ar' ? 'المستخدم' : 'Actor',
      render: (v) => v ? (
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace' }}>
          {v.substring(0, 8)}...
        </span>
      ) : <span style={{ color: 'var(--color-text-secondary)' }}>System</span>
    },
    {
      key: 'entity',
      label: language === 'ar' ? 'الكيان المتأثر' : 'Entity Target',
      render: (_, row) => (
        <span style={{ fontSize: 'var(--text-xs)' }}>
          {row.entity_type ? <strong>{row.entity_type}: </strong> : ''}
          {row.entity_id ? <code style={{ color: 'var(--color-text-secondary)' }}>{row.entity_id.substring(0, 8)}</code> : '—'}
        </span>
      )
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (v) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Server size={12} />
          {v || '—'}
        </span>
      )
    },
    {
      key: 'actions',
      label: t('common.details'),
      render: (_, row) => (
        <Button 
          size="sm" 
          variant="outline" 
          iconLeft={<Eye size={14} />} 
          onClick={() => setInspectLog(row)}
          title={t('common.details')}
        >
          {t('common.details')}
        </Button>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>{t('admin.auditLogs')}</h1>
          <p>{language === 'ar' ? 'سجل العمليات الإدارية، التعديلات الببليوغرافية، والأنشطة الأمنية' : 'Immutable audit trail of curatorial actions and security events'}</p>
        </div>
      </header>

      {/* Filter Bar */}
      <section className={styles.filterBar} aria-label="Filters">
        <Input 
          placeholder={language === 'ar' ? 'تصفية حسب نوع العملية (مثال: CREATE_MATERIAL)...' : 'Filter by action (e.g. CREATE_MATERIAL)...'}
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          icon={<Search size={18} />}
        />
        <Input 
          placeholder={language === 'ar' ? 'تصفية حسب معرف المستخدم...' : 'Filter by User ID...'}
          value={userIdFilter}
          onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
          icon={<User size={18} />}
        />
        <Button 
          variant="ghost" 
          iconLeft={<RotateCcw size={16} />}
          onClick={handleResetFilters}
        >
          {t('common.resetFilters')}
        </Button>
      </section>

      {error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            {t('common.error')}: {error.message}
          </p>
          <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
        </div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={logs} 
            loading={isLoading} 
            emptyMessage={language === 'ar' ? 'لا توجد سجلات تدقيق مطابقة' : 'No audit records found'}
          />

          <div className={styles.paginationWrapper}>
            <Pagination 
              currentPage={page} 
              totalPages={logs.length < pageSize && page === 1 ? 1 : page + 1} 
              onPageChange={setPage} 
            />
          </div>
        </>
      )}

      {/* Audit Log JSON Details Modal */}
      <Modal
        isOpen={Boolean(inspectLog)}
        onClose={() => setInspectLog(null)}
        title={language === 'ar' ? 'تفاصيل السجل الأمني والبيانات' : 'Audit Log Record Details'}
        footer={
          <Button onClick={() => setInspectLog(null)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
        }
      >
        {inspectLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge variant={getActionBadgeVariant(inspectLog.action)}>{inspectLog.action}</Badge>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                {new Date(inspectLog.created_at).toLocaleString()}
              </span>
            </div>

            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              <div><strong>Record ID:</strong> <code>{inspectLog.id}</code></div>
              <div><strong>Actor (User ID):</strong> <code>{inspectLog.user_id || 'System'}</code></div>
              <div><strong>Entity:</strong> {inspectLog.entity_type} ({inspectLog.entity_id})</div>
              <div><strong>IP Address:</strong> {inspectLog.ip_address || 'N/A'}</div>
            </div>

            <div>
              <strong style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Event Payload / Details:
              </strong>
              <div className={styles.jsonBox}>
                {inspectLog.details 
                  ? JSON.stringify(inspectLog.details, null, 2) 
                  : 'No extra details recorded for this event.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
