import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, ArrowRight, Search, AlertCircle } from 'lucide-react';
import { categoriesApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import SearchBar from '../../components/common/SearchBar/SearchBar.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const { t, language, isRTL } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Filter categories by search term
  const filteredCategories = categories.filter((cat) => {
    const q = searchTerm.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  // Separate parent and children if parent_id exists
  const parentCategories = filteredCategories.filter((c) => !c.parent_id);
  const getSubcategories = (parentId) =>
    categories.filter((c) => c.parent_id === parentId);

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.categories') },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>{t('nav.categories')}</h1>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'تصفح أوعية المكتبة مصنفة حسب العلوم والمعارف والفروع الأكاديمية الدقيقة.'
            : 'Explore library materials organized systematically by academic disciplines and domains.'}
        </p>

        <div className={styles.searchRow}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث في التصنيفات...' : 'Search categories...'}
          />
        </div>
      </header>

      {isLoading && (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
              <Skeleton height="36px" width="50%" />
              <Skeleton height="16px" width="90%" style={{ marginTop: 'var(--space-3)' }} />
              <Skeleton height="16px" width="70%" style={{ marginTop: 'var(--space-2)' }} />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={<AlertCircle size={40} color="var(--color-error)" />}
          title={t('common.error')}
          description="Failed to load categories."
          actionText={t('common.retry')}
          onAction={refetch}
        />
      )}

      {!isLoading && !isError && filteredCategories.length === 0 && (
        <EmptyState
          icon={<FolderOpen size={40} />}
          title={t('common.empty')}
          description={language === 'ar' ? 'لا توجد تصنيفات تطابق بحثك.' : 'No categories match your search.'}
        />
      )}

      {!isLoading && !isError && filteredCategories.length > 0 && (
        <div className={styles.grid}>
          {(parentCategories.length > 0 ? parentCategories : filteredCategories).map((cat) => {
            const subcats = getSubcategories(cat.id);
            return (
              <Link key={cat.id} to={`/categories/${cat.slug || cat.id}`} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <FolderOpen size={22} />
                  </div>
                  <h2 className={styles.cardTitle} dir="auto">
                    {cat.name}
                  </h2>
                </div>

                {cat.description && (
                  <p className={styles.cardDesc} dir="auto">
                    {cat.description}
                  </p>
                )}

                {subcats.length > 0 && (
                  <div className={styles.subcategories}>
                    {subcats.slice(0, 4).map((sub) => (
                      <span key={sub.id} className={styles.subBadge} dir="auto">
                        {sub.name}
                      </span>
                    ))}
                    {subcats.length > 4 && (
                      <span className={styles.subBadge}>+{subcats.length - 4}</span>
                    )}
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <span>{language === 'ar' ? 'استعراض المحتويات' : 'Browse Materials'}</span>
                  <ArrowRight size={16} className={isRTL ? 'mirror-rtl' : ''} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
