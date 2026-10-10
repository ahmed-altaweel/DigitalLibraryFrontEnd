import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tag as TagIcon, AlertCircle } from 'lucide-react';
import { tagsApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import MaterialGrid from '../../components/catalog/MaterialGrid/MaterialGrid.jsx';
import Pagination from '../../components/common/Pagination/Pagination.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function TagPage() {
  const { slug } = useParams();
  const { t, language } = useTranslation();
  const [params, setParams] = useSearchParams();
  const page = parseInt(params.get('page') || '1', 10);

  // Fetch all tags to find matching tag
  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  const tag = allTags.find((t) => t.slug === slug || t.id === slug);

  // Fetch materials for tag
  const {
    data: materialsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['materials', 'tag', tag?.id || slug, page],
    queryFn: () => materialsApi.getAll({ tag_id: tag?.id, page, size: 12, status: 'published' }),
    enabled: Boolean(tag?.id || slug),
  });

  const materials = materialsData?.items || [];
  const totalPages = materialsData?.pages || 1;

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: language === 'ar' ? 'الوسوم' : 'Tags', href: '/tags' },
          { label: tag?.name || slug },
        ]}
      />

      <div style={{ marginBlock: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <TagIcon size={28} color="var(--color-accent)" />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', margin: 0 }} dir="auto">
            {tag?.name || slug}
          </h1>
        </div>
      </div>

      {isError ? (
        <EmptyState
          icon={<AlertCircle size={36} color="var(--color-error)" />}
          title={t('common.error')}
          description="Failed to load materials for this subject."
          actionText={t('common.retry')}
          onAction={refetch}
        />
      ) : (
        <>
          <MaterialGrid
            materials={materials}
            loading={isLoading}
            emptyMessage={t('catalog.noMaterialsFound')}
          />

          {totalPages > 1 && (
            <div style={{ marginTop: 'var(--space-10)', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setParams({ page: String(p) })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
