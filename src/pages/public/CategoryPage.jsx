import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { categoriesApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import MaterialGrid from '../../components/catalog/MaterialGrid/MaterialGrid.jsx';
import Pagination from '../../components/common/Pagination/Pagination.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const page = parseInt(params.get('page') || '1', 10);

  // Fetch all categories to locate the target by slug
  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const category = (allCategories || []).find((c) => c.slug === slug || c.id === slug);

  // Fetch materials for category
  const {
    data: materialsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['materials', 'category', slug, page],
    queryFn: () => materialsApi.getAll({ page, size: 12, status: 'published' }),
  });

  const materials = materialsData?.items || [];
  const totalPages = materialsData?.pages || 1;

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.categories'), href: '/catalog' },
          { label: category?.name || slug },
        ]}
      />

      <div style={{ marginBlock: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <FolderOpen size={30} color="var(--color-accent)" />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', margin: 0 }} dir="auto">
            {category?.name || slug}
          </h1>
        </div>
        {category?.description && (
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '70ch', margin: 0, lineHeight: 'var(--leading-relaxed)' }} dir="auto">
            {category.description}
          </p>
        )}
      </div>

      {isError ? (
        <EmptyState
          icon={<AlertCircle size={36} color="var(--color-error)" />}
          title={t('common.error')}
          description="Failed to load materials for this category."
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
