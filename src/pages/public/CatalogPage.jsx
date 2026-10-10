import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, X, SlidersHorizontal, AlertCircle, UploadCloud } from 'lucide-react';
import { materialsApi, categoriesApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import MaterialGrid from '../../components/catalog/MaterialGrid/MaterialGrid.jsx';
import Pagination from '../../components/common/Pagination/Pagination.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import SearchBar from '../../components/common/SearchBar/SearchBar.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import styles from './CatalogPage.module.css';

const CONTENT_TYPES = ['book', 'paper', 'article', 'manuscript'];

export default function CatalogPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = searchParams.get('q') || '';
  const contentType = searchParams.get('content_type') || '';
  const categoryId = searchParams.get('category_id') || '';

  // Query materials matching backend contract
  const {
    data: materialsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['materials', 'catalog', { page, q, contentType, categoryId }],
    queryFn: () => {
      const params = {
        page,
        size: 12,
        status: 'published',
      };
      if (q) params.q = q;
      if (contentType) params.content_type = contentType;
      return materialsApi.getAll(params);
    },
  });

  // Query categories for sidebar filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const materials = materialsData?.items || [];
  const total = materialsData?.total || 0;
  const totalPages = materialsData?.pages || 1;

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(q || contentType || categoryId);

  // Format count
  const formattedTotal = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(total);

  return (
    <div className={styles.catalog}>
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: t('nav.home'), href: '/' },
            { label: t('nav.catalog') },
          ]}
        />

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('catalog.title')}</h1>
            <p className={styles.subtitle}>{t('catalog.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Badge variant="accent" size="md">
              {t('catalog.resultsFound', { count: formattedTotal })}
            </Badge>
            <Button
              variant="primary"
              size="sm"
              iconLeft={<UploadCloud size={16} />}
              onClick={() => navigate('/upload')}
            >
              {language === 'ar' ? '+ إيداع ورفع مادة' : '+ Deposit Material'}
            </Button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <SearchBar
              value={q}
              placeholder={t('catalog.searchPlaceholder')}
              onSubmit={(query) => updateParam('q', query)}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {t('common.resetFilters')}
            </Button>
          )}
        </div>

        {/* Removable Active Filter Chips */}
        {hasActiveFilters && (
          <div className={styles.activeChips} aria-label="Active filters">
            {q && (
              <span className={styles.chip}>
                <span>"{q}"</span>
                <button
                  type="button"
                  onClick={() => updateParam('q', '')}
                  aria-label="Remove search query filter"
                  className={styles.chipRemove}
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {contentType && (
              <span className={styles.chip}>
                <span>{t(`catalog.${contentType}`) || contentType}</span>
                <button
                  type="button"
                  onClick={() => updateParam('content_type', '')}
                  aria-label="Remove content type filter"
                  className={styles.chipRemove}
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        <div className={styles.contentLayout}>
          {/* Sidebar Filters */}
          <aside className={styles.sidebar} aria-label={t('catalog.filters')}>
            <div className={styles.filterSection}>
              <div className={styles.filterHeader}>
                <SlidersHorizontal size={16} />
                <h3 className={styles.filterTitle}>{t('catalog.contentType')}</h3>
              </div>
              <div className={styles.filterOptions}>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${!contentType ? styles.filterBtnActive : ''}`}
                  onClick={() => updateParam('content_type', '')}
                >
                  {t('catalog.allTypes')}
                </button>
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`${styles.filterBtn} ${contentType === type ? styles.filterBtnActive : ''}`}
                    onClick={() => updateParam('content_type', type)}
                  >
                    {t(`catalog.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            {categories && categories.length > 0 && (
              <div className={styles.filterSection}>
                <div className={styles.filterHeader}>
                  <h3 className={styles.filterTitle}>{t('nav.categories')}</h3>
                </div>
                <div className={styles.filterOptions}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.filterBtn} ${categoryId === cat.id ? styles.filterBtnActive : ''}`}
                      onClick={() => updateParam('category_id', categoryId === cat.id ? '' : cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main className={styles.mainArea}>
            {isError ? (
              <EmptyState
                icon={<AlertCircle size={36} color="var(--color-error)" />}
                title={t('common.error')}
                description="Failed to load catalog materials."
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
                  <div className={styles.paginationWrapper}>
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
