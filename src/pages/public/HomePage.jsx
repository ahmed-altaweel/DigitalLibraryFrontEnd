import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Search,
  ArrowRight,
  FolderOpen,
  Library,
  Bookmark,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { materialsApi, categoriesApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import MaterialCard from '../../components/catalog/MaterialCard/MaterialCard.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch recent/featured materials
  const {
    data: materialsData,
    isLoading: isMaterialsLoading,
    isError: isMaterialsError,
    refetch: refetchMaterials,
  } = useQuery({
    queryKey: ['materials', 'featured'],
    queryFn: () => materialsApi.getAll({ page: 1, size: 6, status: 'published' }),
  });

  // Fetch categories
  const {
    data: categoriesList,
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const materials = materialsData?.items || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroPattern} />
        <div className={styles.heroContent}>
          <div className={styles.taglineBadge}>
            <Sparkles size={14} />
            <span>{t('common.appTagline')}</span>
          </div>

          <h1 className={styles.heroTitle} dir="auto">
            {t('catalog.title')}
          </h1>
          <p className={styles.heroSubtitle} dir="auto">
            {t('catalog.subtitle')}
          </p>

          <form className={styles.heroSearch} onSubmit={handleSearch}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder={t('catalog.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label={t('common.search')}
              />
            </div>
            <Button type="submit" variant="primary" size="lg">
              {t('common.searchBtn')}
            </Button>
          </form>

          <div className={styles.heroLinks}>
            <Link to="/catalog" className={styles.heroLink}>
              <span>{t('nav.catalog')}</span>
              <ArrowRight size={16} className={isRTL ? 'mirror-rtl' : ''} />
            </Link>
            <Link to="/register" className={styles.heroLink}>
              <span>{t('nav.register')}</span>
              <ArrowRight size={16} className={isRTL ? 'mirror-rtl' : ''} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{t('catalog.recent')}</h2>
              <p className={styles.sectionSubtitle}>{t('catalog.subtitle')}</p>
            </div>
            <Link to="/catalog" className={styles.viewAll}>
              <span>{t('common.all')}</span>
              <ArrowRight size={16} className={isRTL ? 'mirror-rtl' : ''} />
            </Link>
          </div>

          {/* 4 States for Materials */}
          {isMaterialsLoading && (
            <div className={styles.materialsGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <Skeleton height="200px" />
                  <div style={{ padding: 'var(--space-4)' }}>
                    <Skeleton height="1.25rem" width="70%" />
                    <Skeleton height="0.875rem" width="90%" style={{ marginTop: 'var(--space-2)' }} />
                    <Skeleton height="0.875rem" width="50%" style={{ marginTop: 'var(--space-1)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isMaterialsError && (
            <EmptyState
              icon={<AlertCircle size={36} color="var(--color-error)" />}
              title={t('common.error')}
              description="Failed to load materials from the library repository."
              actionText={t('common.retry')}
              onAction={refetchMaterials}
            />
          )}

          {!isMaterialsLoading && !isMaterialsError && materials.length === 0 && (
            <EmptyState
              icon={<BookOpen size={36} />}
              title={t('catalog.noMaterialsFound')}
              description={t('catalog.tryDifferentQuery')}
              actionText={t('nav.catalog')}
              onAction={() => navigate('/catalog')}
            />
          )}

          {!isMaterialsLoading && !isMaterialsError && materials.length > 0 && (
            <div className={styles.materialsGrid}>
              {materials.map((m) => (
                <MaterialCard key={m.id || m.slug} material={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      {categoriesList && categoriesList.length > 0 && (
        <section className={`${styles.section} ${styles.categoriesSection}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>{t('nav.categories')}</h2>
                <p className={styles.sectionSubtitle}>{t('catalog.subtitle')}</p>
              </div>
            </div>

            <div className={styles.categoriesGrid}>
              {categoriesList.slice(0, 8).map((cat) => (
                <Link key={cat.id} to={`/categories/${cat.slug}`} className={styles.categoryCard}>
                  <div className={styles.catIconWrapper}>
                    <FolderOpen size={24} />
                  </div>
                  <div className={styles.catInfo}>
                    <h3 className={styles.categoryName} dir="auto">{cat.name}</h3>
                    {cat.description && (
                      <p className={styles.categoryDesc} dir="auto">{cat.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Scholarly Community Features Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <div className={styles.featuresRow}>
              <div className={styles.featureItem}>
                <Library size={28} className={styles.featureIcon} />
                <h3 className={styles.featureTitle}>{t('nav.myLibrary')}</h3>
                <p className={styles.featureDesc}>{t('member.librarySubtitle')}</p>
              </div>

              <div className={styles.featureItem}>
                <Bookmark size={28} className={styles.featureIcon} />
                <h3 className={styles.featureTitle}>{t('member.bookmarksTitle')}</h3>
                <p className={styles.featureDesc}>{t('reader.addBookmark')}</p>
              </div>

              <div className={styles.featureItem}>
                <Clock size={28} className={styles.featureIcon} />
                <h3 className={styles.featureTitle}>{t('member.progressTitle')}</h3>
                <p className={styles.featureDesc}>{t('reader.progressUpdated', { percent: 100 })}</p>
              </div>
            </div>

            <div className={styles.ctaButtonWrapper}>
              <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
                {t('auth.registerTitle')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
