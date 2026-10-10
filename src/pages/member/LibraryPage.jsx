import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Library, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { libraryApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function LibraryPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: libraryData,
    isLoading: isLibLoading,
    isError: isLibError,
    refetch,
  } = useQuery({
    queryKey: ['library', 'me'],
    queryFn: () => libraryApi.getLibrary({ page: 1, size: 50 }),
  });

  const libraryItems = libraryData?.items || [];

  // Query all materials to join details
  const { data: materialsData, isLoading: isMatsLoading } = useQuery({
    queryKey: ['materials', 'all_for_library'],
    queryFn: () => materialsApi.getAll({ page: 1, size: 100, status: 'published' }),
  });

  const allMaterials = materialsData?.items || [];

  const removeMutation = useMutation({
    mutationFn: (materialId) => libraryApi.remove(materialId),
    onSuccess: () => {
      toast.info(t('material.removeFromLibrary'));
      queryClient.invalidateQueries({ queryKey: ['library', 'me'] });
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const isLoading = isLibLoading || isMatsLoading;

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }}>
            {t('member.libraryTitle')}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
            {t('member.librarySubtitle')}
          </p>
        </div>

        {isLibError && (
          <EmptyState
            icon={<AlertCircle size={36} color="var(--color-error)" />}
            title={t('common.error')}
            description="Failed to load your personal library."
            actionText={t('common.retry')}
            onAction={refetch}
          />
        )}

        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton height="1.25rem" width="80%" />
                <Skeleton height="0.875rem" width="50%" style={{ marginTop: 'var(--space-2)' }} />
                <Skeleton height="2rem" style={{ marginTop: 'var(--space-4)' }} />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isLibError && libraryItems.length === 0 && (
          <EmptyState
            icon={<Library size={40} />}
            title={t('member.libraryTitle')}
            description={t('member.emptyLibrary')}
            actionText={t('nav.catalog')}
            onAction={() => navigate('/catalog')}
          />
        )}

        {!isLoading && !isLibError && libraryItems.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {libraryItems.map((item) => {
              const matchedMat = allMaterials.find((m) => m.id === item.material_id);
              const title = matchedMat?.title || `Material #${item.material_id.slice(0, 8)}`;
              const slug = matchedMat?.slug || item.material_id;

              return (
                <Card key={item.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--space-3)' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', margin: 0, color: 'var(--color-primary)' }} dir="auto">
                        <Link to={`/materials/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {title}
                        </Link>
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
                        Added on {new Date(item.added_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                      <Link to={`/read/${item.material_id}`} style={{ flex: 1, textDecoration: 'none' }}>
                        <Button variant="primary" size="sm" fullWidth iconLeft={<BookOpen size={16} />}>
                          {t('material.readNow')}
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMutation.mutate(item.material_id)}
                        loading={removeMutation.isPending && removeMutation.variables === item.material_id}
                        aria-label={t('material.removeFromLibrary')}
                        title={t('material.removeFromLibrary')}
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
