import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, BookOpen, CheckCircle, Play, AlertCircle } from 'lucide-react';
import { readingProgressApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function ReadingProgressPage() {
  const { t } = useTranslation();

  const { data: progressItems, isLoading: isProgLoading, isError, refetch } = useQuery({
    queryKey: ['reading-progress', 'me'],
    queryFn: () => readingProgressApi.getAll(),
  });

  const { data: materialsData, isLoading: isMatsLoading } = useQuery({
    queryKey: ['materials', 'all_for_progress'],
    queryFn: () => materialsApi.getAll({ page: 1, size: 50, status: 'published' }),
  });

  const materials = materialsData?.items || [];
  const isLoading = isProgLoading || isMatsLoading;

  const items = progressItems || [];

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }}>
            {t('member.progressTitle')}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
            Track and resume your reading journey across all volumes.
          </p>
        </div>

        {isError && (
          <EmptyState
            icon={<AlertCircle size={36} color="var(--color-error)" />}
            title={t('common.error')}
            description="Failed to load reading progress records."
            actionText={t('common.retry')}
            onAction={refetch}
          />
        )}

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton height="1.5rem" width="60%" />
                <Skeleton height="0.875rem" width="40%" style={{ marginTop: 'var(--space-2)' }} />
                <Skeleton height="8px" style={{ marginTop: 'var(--space-4)' }} />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon={<Clock size={40} />}
            title="No Reading History Yet"
            description="Open any material in the reader to automatically track your reading progress."
            actionText={t('nav.catalog')}
            onAction={() => window.location.href = '/catalog'}
          />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {items.map((item) => {
              const matchedMat = materials.find((m) => m.id === item.material_id);
              const title = matchedMat?.title || `Material #${item.material_id?.slice(0, 8)}`;
              const percent = Math.round(item.completion_percentage || 0);

              let statusVariant = 'default';
              if (item.status === 'completed' || percent >= 100) statusVariant = 'success';
              else if (item.status === 'in_progress') statusVariant = 'warning';

              return (
                <Card key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', margin: 0, color: 'var(--color-primary)' }} dir="auto">
                          {title}
                        </h3>
                        <Badge variant={statusVariant} size="sm">
                          {item.status || 'not_started'}
                        </Badge>
                      </div>

                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {t('common.page')} {item.current_page || 1} {item.total_pages ? `${t('common.of')} ${item.total_pages}` : ''} • {percent}% completed
                        {item.last_read_at && ` • Last read ${new Date(item.last_read_at).toLocaleDateString()}`}
                      </p>
                    </div>

                    <Link to={`/read/${item.material_id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm" iconLeft={<Play size={14} />}>
                        {t('material.readNow')}
                      </Button>
                    </Link>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: 'var(--radius-full)', marginTop: 'var(--space-4)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, percent))}%`,
                        height: '100%',
                        background: percent >= 100 ? 'var(--color-success)' : 'var(--color-accent)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-normal)',
                      }}
                    />
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
