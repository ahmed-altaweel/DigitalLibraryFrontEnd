import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  ExternalLink, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import styles from './AdminSuggestionsPage.module.css';

export default function AdminSuggestionsPage() {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [reviewModalData, setReviewModalData] = useState(null); // { item, action: 'approved' | 'rejected' }
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch pending suggestions
  const { data: suggestions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: () => adminApi.getPendingSuggestions({ page: 1, size: 50 }),
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ id, action, notes }) => adminApi.reviewSuggestion(id, action, notes),
    onSuccess: (_, variables) => {
      const isApproved = variables.action === 'approved';
      showToast(
        isApproved 
          ? (language === 'ar' ? 'تم اعتماد التصويب وتحديث الفهرس' : 'Suggestion approved and applied')
          : (language === 'ar' ? 'تم رفض المقترح' : 'Suggestion declined'),
        isApproved ? 'success' : 'info'
      );
      closeReviewModal();
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-suggestions-count'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const openReviewModal = (item, action) => {
    setReviewModalData({ item, action });
    setReviewNotes('');
  };

  const closeReviewModal = () => {
    setReviewModalData(null);
    setReviewNotes('');
  };

  const handleConfirmReview = () => {
    if (!reviewModalData) return;
    reviewMutation.mutate({
      id: reviewModalData.item.id,
      action: reviewModalData.action,
      notes: reviewNotes.trim() || null,
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('admin.suggestionsQueue')}</h1>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'مراجعة وتدقيق التصويبات والتحسينات الببليوغرافية المقترحة من مجتمع الباحثين'
            : 'Review, verify, and approve catalog corrections submitted by academic readers'}
        </p>
      </header>

      {isLoading ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.card}>
              <Skeleton width="180px" height="24px" />
              <div className={styles.diffGrid}>
                <Skeleton height="80px" />
                <Skeleton height="80px" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            {t('common.error')}: {error.message}
          </p>
          <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
        </div>
      ) : suggestions.length === 0 ? (
        <EmptyState 
          icon={<CheckCircle size={48} color="var(--color-success)" />}
          title={language === 'ar' ? 'طابور التدقيق خالٍ' : 'Review Queue Empty'}
          description={language === 'ar' ? 'تمت مراجعة كافة مقترحات وتصويبات الباحثين ولا توجد عناصر معلقة حالياً.' : 'All researcher suggestions have been verified and reviewed.'}
        />
      ) : (
        <div className={styles.list}>
          {suggestions.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.badges}>
                  <Badge variant="secondary">
                    {t(`suggestions.${item.suggestion_type}`) || item.suggestion_type}
                  </Badge>
                  {item.field_name && (
                    <Badge variant="default">
                      {item.field_name}
                    </Badge>
                  )}
                  <Badge variant="warning">
                    {t('suggestions.status.pending')}
                  </Badge>
                </div>
                <div className={styles.date}>
                  <Clock size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                  {new Date(item.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
              </div>

              {/* Side-by-side diff */}
              <div className={styles.diffGrid}>
                <div className={`${styles.diffColumn} ${styles.currentCol}`}>
                  <span className={styles.diffLabel}>{t('suggestions.currentValue')}</span>
                  <div className={styles.diffValue}>
                    {item.current_value || <em style={{ color: 'var(--color-text-secondary)' }}>None / Empty</em>}
                  </div>
                </div>

                <div className={`${styles.diffColumn} ${styles.proposedCol}`}>
                  <span className={styles.diffLabel}>{t('suggestions.proposedValue')}</span>
                  <div className={styles.diffValue}>
                    {item.proposed_value || <em style={{ color: 'var(--color-text-secondary)' }}>None</em>}
                  </div>
                </div>
              </div>

              {/* Reason / Academic justification */}
              {item.reason && (
                <div className={styles.reasonBox}>
                  <span className={styles.reasonLabel}>{t('suggestions.reason')}</span>
                  <p style={{ margin: 0 }}>{item.reason}</p>
                </div>
              )}

              <div className={styles.cardFooter}>
                <Link 
                  to={`/materials/${item.material_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}
                >
                  <span>{language === 'ar' ? 'معاينة المادة العلمية' : 'View Target Material'}</span>
                  <ExternalLink size={14} />
                </Link>

                <div className={styles.reviewActions}>
                  <Button 
                    size="sm" 
                    variant="outline"
                    iconLeft={<XCircle size={14} />}
                    onClick={() => openReviewModal(item, 'rejected')}
                  >
                    {t('admin.reject')}
                  </Button>
                  <Button 
                    size="sm" 
                    iconLeft={<CheckCircle size={14} />}
                    onClick={() => openReviewModal(item, 'approved')}
                  >
                    {t('admin.approve')}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Review Confirmation & Notes Modal */}
      <Modal
        isOpen={Boolean(reviewModalData)}
        onClose={closeReviewModal}
        title={reviewModalData?.action === 'approved' 
          ? (language === 'ar' ? 'اعتماد التصويب ونشره' : 'Approve Catalog Correction')
          : (language === 'ar' ? 'رفض المقترح' : 'Decline Suggestion')
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeReviewModal}>{t('common.cancel')}</Button>
            <Button 
              variant={reviewModalData?.action === 'approved' ? 'primary' : 'danger'}
              onClick={handleConfirmReview}
              loading={reviewMutation.isPending}
            >
              {reviewModalData?.action === 'approved' ? t('admin.approve') : t('admin.reject')}
            </Button>
          </>
        }
      >
        <div className={styles.reviewModalContent}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            {reviewModalData?.action === 'approved'
              ? (language === 'ar' 
                  ? 'سيتم اعتماد هذا التعديل ونشره في بيانات المادة العلمية وإخطار الباحث.' 
                  : 'Approving will apply this correction to the catalog record and notify the contributor.')
              : (language === 'ar'
                  ? 'سيتم حفظ المقترح كمرفوض وإعلام الباحث.'
                  : 'Declining will mark this suggestion as rejected.')
            }
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text)' }}>
              {t('admin.reviewNotes')} ({language === 'ar' ? 'اختياري' : 'Optional'})
            </label>
            <textarea 
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={language === 'ar' ? 'مبررات القرار التحريري أو مراجع إضافية...' : 'Reasoning or editorial feedback for the scholar...'}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: 'var(--text-sm)'
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
