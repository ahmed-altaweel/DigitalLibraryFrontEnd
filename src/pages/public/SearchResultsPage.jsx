import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, AlertCircle } from 'lucide-react';
import { materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import MaterialGrid from '../../components/catalog/MaterialGrid/MaterialGrid.jsx';
import Pagination from '../../components/common/Pagination/Pagination.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';

export default function SearchResultsPage() {
  const { t, language } = useTranslation();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const page = parseInt(params.get('page') || '1', 10);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['materials', 'search', { q, page }],
    queryFn: () => materialsApi.getAll({ q, page, size: 12, status: 'published' }),
  });

  const materials = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  const formattedTotal = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(total);

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.catalog'), href: '/catalog' },
          { label: `${t('common.search')}: "${q}"` },
        ]}
      />

      <div style={{ marginBlock: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', margin: 0 }}>
            {t('common.search')}: <span style={{ color: 'var(--color-accent)' }}>"{q}"</span>
          </h1>
        </div>
        <Badge variant="accent" size="md">
          {t('catalog.resultsFound', { count: formattedTotal })}
        </Badge>
      </div>

      {isError ? (
        <EmptyState
          icon={<AlertCircle size={36} color="var(--color-error)" />}
          title={t('common.error')}
          description="Failed to search materials."
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
                onPageChange={(p) => setParams({ q, page: String(p) })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
