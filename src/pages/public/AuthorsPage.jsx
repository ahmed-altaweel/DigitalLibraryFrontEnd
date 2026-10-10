import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, ArrowRight, Globe, AlertCircle } from 'lucide-react';
import { authorsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import SearchBar from '../../components/common/SearchBar/SearchBar.jsx';
import Avatar from '../../components/common/Avatar/Avatar.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import styles from './AuthorsPage.module.css';

export default function AuthorsPage() {
  const { t, language, isRTL } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: authors = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['authors'],
    queryFn: authorsApi.getAll,
  });

  const filteredAuthors = authors.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.authors') },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>{t('nav.authors')}</h1>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'دليل أعلام ومؤلفي وباحثي المكتبة، تصفح سيرهم العلمية ومؤلفاتهم المحفوظة في الفهرس.'
            : 'Directory of scholars, authors, and researchers. Explore biographies and their preserved works.'}
        </p>

        <div className={styles.searchRow}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عن مؤلف أو عالم...' : 'Search authors or scholars...'}
          />
        </div>
      </header>

      {isLoading && (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
              <Skeleton height="40px" width="60%" />
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
          description="Failed to load authors."
          actionText={t('common.retry')}
          onAction={refetch}
        />
      )}

      {!isLoading && !isError && filteredAuthors.length === 0 && (
        <EmptyState
          icon={<User size={40} />}
          title={t('common.empty')}
          description={language === 'ar' ? 'لا يوجد مؤلفون يطابقون معايير البحث.' : 'No authors match your search.'}
        />
      )}

      {!isLoading && !isError && filteredAuthors.length > 0 && (
        <div className={styles.grid}>
          {filteredAuthors.map((author) => (
            <Link key={author.id} to={`/authors/${author.slug || author.id}`} className={styles.card}>
              <div className={styles.avatarRow}>
                <Avatar name={author.name} size="md" />
                <h2 className={styles.authorName} dir="auto">
                  {author.name}
                </h2>
              </div>

              {author.bio && (
                <p className={styles.bio} dir="auto">
                  {author.bio}
                </p>
              )}

              <div className={styles.cardFooter}>
                <span>{language === 'ar' ? 'عرض المؤلفات والأبحاث' : 'View Publications'}</span>
                <ArrowRight size={16} className={isRTL ? 'mirror-rtl' : ''} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
