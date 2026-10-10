import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { bookmarksApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function BookmarksPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: bookmarks, isLoading: isBmLoading, isError, refetch } = useQuery({
    queryKey: ['bookmarks', 'me'],
    queryFn: () => bookmarksApi.getAll(),
  });

  const { data: materialsData, isLoading: isMatsLoading } = useQuery({
    queryKey: ['materials', 'all_for_bookmarks'],
    queryFn: () => materialsApi.getAll({ page: 1, size: 50, status: 'published' }),
  });

  const materials = materialsData?.items || [];
  const isLoading = isBmLoading || isMatsLoading;

  const deleteMutation = useMutation({
    mutationFn: (id) => bookmarksApi.delete(id),
    onSuccess: () => {
      toast.info(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'me'] });
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const items = bookmarks || [];

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }}>
            {t('member.bookmarksTitle')}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
            Jump to saved pages, citations, and scholarly excerpts.
          </p>
        </div>

        {isError && (
          <EmptyState
            icon={<AlertCircle size={36} color="var(--color-error)" />}
            title={t('common.error')}
            description="Failed to load bookmarks."
            actionText={t('common.retry')}
            onAction={refetch}
          />
        )}

        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton height="1.25rem" width="60%" />
                <Skeleton height="0.875rem" width="80%" style={{ marginTop: 'var(--space-2)' }} />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon={<Bookmark size={40} />}
            title="No Bookmarks Yet"
            description="When reading a scholarly work in the viewer, use the bookmark button to mark pages."
            actionText={t('nav.catalog')}
            onAction={() => window.location.href = '/catalog'}
          />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {items.map((b) => {
              const matchedMat = materials.find((m) => m.id === b.material_id);
              const materialTitle = matchedMat?.title || `Material #${b.material_id?.slice(0, 8)}`;

              return (
                <Card key={b.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: b.color || 'var(--color-accent)',
                            flexShrink: 0,
                          }}
                        />
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', margin: 0, color: 'var(--color-primary)' }} dir="auto">
                          {b.title || `${t('common.page')} ${b.page_number}`}
                        </h4>
                      </div>

                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-accent)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        P. {b.page_number}
                      </span>
                    </div>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                      From: <strong dir="auto">{materialTitle}</strong>
                    </p>

                    {b.note && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'var(--color-bg-secondary)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', margin: 0, fontStyle: 'italic' }} dir="auto">
                        "{b.note}"
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                      <Link to={`/read/${b.material_id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="outline" size="sm" iconLeft={<BookOpen size={14} />}>
                          {t('material.readNow')}
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(b.id)}
                        loading={deleteMutation.isPending && deleteMutation.variables === b.id}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 size={16} color="var(--color-error)" />
                      </Button>
                    </div>
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
