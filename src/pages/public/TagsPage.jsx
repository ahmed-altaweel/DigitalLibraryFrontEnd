import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tag as TagIcon, AlertCircle } from 'lucide-react';
import { tagsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import SearchBar from '../../components/common/SearchBar/SearchBar.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import styles from './TagsPage.module.css';

export default function TagsPage() {
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: tags = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  const filteredTags = tags.filter((tag) =>
    tag.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: language === 'ar' ? 'الوسوم والموضوعات' : 'Subject Tags' },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === 'ar' ? 'مكنز الوسوم والموضوعات' : 'Subject Thesaurus & Tags'}
        </h1>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'استكشف المكنز الموضوعي للمكتبة، وابحث عن الكتب والأوراق العلمية بحسب رؤوس الموضوعات والكلمات المفتاحية.'
            : 'Explore the library’s subject thesaurus to discover resources categorized by keywords and scholarly topics.'}
        </p>

        <div className={styles.searchRow}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث في الوسوم والموضوعات...' : 'Search subject tags...'}
          />
        </div>
      </header>

      {isLoading && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-8)' }}>
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} height="36px" width="120px" style={{ borderRadius: 'var(--radius-full)' }} />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={<AlertCircle size={40} color="var(--color-error)" />}
          title={t('common.error')}
          description="Failed to load tags."
          actionText={t('common.retry')}
          onAction={refetch}
        />
      )}

      {!isLoading && !isError && filteredTags.length === 0 && (
        <EmptyState
          icon={<TagIcon size={40} />}
          title={t('common.empty')}
          description={language === 'ar' ? 'لا توجد وسوم تطابق بحثك.' : 'No subject tags match your query.'}
        />
      )}

      {!isLoading && !isError && filteredTags.length > 0 && (
        <div className={styles.cloudContainer}>
          {filteredTags.map((tag) => (
            <Link key={tag.id} to={`/tags/${tag.slug || tag.id}`} className={styles.tagChip} dir="auto">
              <TagIcon size={14} />
              <span>{tag.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
