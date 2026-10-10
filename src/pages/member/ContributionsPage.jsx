import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileEdit, XCircle, CheckCircle2, Clock, Ban, AlertCircle } from 'lucide-react';
import { suggestionsApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function ContributionsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  // 1. Fetch user suggestions
  const { data: suggestions, isLoading: isSuggLoading, isError, refetch } = useQuery({
    queryKey: ['suggestions', 'me'],
    queryFn: () => suggestionsApi.getMySubmissions({ page: 1, size: 50 }),
  });

  // 2. Fetch materials for title reference
  const { data: materialsData, isLoading: isMatsLoading } = useQuery({
    queryKey: ['materials', 'all_for_suggestions'],
    queryFn: () => materialsApi.getAll({ page: 1, size: 50, status: 'published' }),
  });

  const materials = materialsData?.items || [];
  const isLoading = isSuggLoading || isMatsLoading;

  // 3. Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: (id) => suggestionsApi.withdraw(id),
    onSuccess: () => {
      toast.info(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['suggestions', 'me'] });
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const items = suggestions || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" size="sm">{t('suggestions.status.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="error" size="sm">{t('suggestions.status.rejected')}</Badge>;
      case 'withdrawn':
        return <Badge variant="default" size="sm">{t('suggestions.status.withdrawn')}</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning" size="sm">{t('suggestions.status.pending')}</Badge>;
    }
  };

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }}>
            {t('member.contributionsTitle')}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
            {t('member.contributionsSubtitle')}
          </p>
        </div>

        {isError && (
          <EmptyState
            icon={<AlertCircle size={36} color="var(--color-error)" />}
            title={t('common.error')}
            description="Failed to load contributions."
            actionText={t('common.retry')}
            onAction={refetch}
          />
        )}

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <Skeleton height="1.5rem" width="60%" />
                <Skeleton height="3rem" style={{ marginTop: 'var(--space-3)' }} />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon={<FileEdit size={40} />}
            title="No Suggestions Submitted Yet"
            description="Found a typo, incorrect metadata, or missing citation? Suggest corrections on any material page."
            actionText={t('nav.catalog')}
            onAction={() => window.location.href = '/catalog'}
          />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {items.map((s) => {
              const matchedMat = materials.find((m) => m.id === s.material_id);
              const materialTitle = matchedMat?.title || `Material #${s.material_id?.slice(0, 8)}`;

              return (
                <Card key={s.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', margin: 0, color: 'var(--color-primary)' }} dir="auto">
                            {materialTitle}
                          </h4>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            • {t(`suggestions.${s.suggestion_type}`) || s.suggestion_type}
                          </span>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0' }}>
                          Field: <strong>{s.field_name || 'general'}</strong> • Submitted on {new Date(s.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {getStatusBadge(s.status)}
                        {s.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => withdrawMutation.mutate(s.id)}
                            loading={withdrawMutation.isPending && withdrawMutation.variables === s.id}
                            style={{ color: 'var(--color-error)' }}
                          >
                            {t('suggestions.withdraw')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Diff View of Values */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)', background: 'var(--color-bg-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>
                          {t('suggestions.currentValue')}:
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textDecoration: 'line-through' }} dir="auto">
                          {s.current_value || '—'}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', display: 'block', marginBottom: '2px', fontWeight: 'var(--font-semibold)' }}>
                          {t('suggestions.proposedValue')}:
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', fontWeight: 'var(--font-semibold)' }} dir="auto">
                          {s.proposed_value}
                        </span>
                      </div>
                    </div>

                    {s.reason && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, fontStyle: 'italic' }} dir="auto">
                        Reason: "{s.reason}"
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
