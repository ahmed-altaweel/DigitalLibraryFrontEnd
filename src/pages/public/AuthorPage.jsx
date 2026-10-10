import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Globe, AlertCircle } from 'lucide-react';
import { authorsApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import MaterialGrid from '../../components/catalog/MaterialGrid/MaterialGrid.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function AuthorPage() {
  const { slug } = useParams();
  const { t } = useTranslation();

  const { data: allAuthors } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorsApi.getAll(),
  });

  const author = (allAuthors || []).find((a) => a.slug === slug || a.id === slug);

  const {
    data: materialsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['materials', 'author', slug],
    queryFn: () => materialsApi.getAll({ page: 1, size: 12, status: 'published' }),
  });

  const materials = materialsData?.items || [];

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.authors'), href: '/catalog' },
          { label: author?.name || slug },
        ]}
      />

      <div
        style={{
          marginBlock: 'var(--space-6)',
          padding: 'var(--space-8)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <User size={32} color="var(--color-accent)" />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', margin: 0 }} dir="auto">
            {author?.name || slug}
          </h1>
        </div>

        {author?.bio && (
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '70ch', margin: 0, lineHeight: 'var(--leading-relaxed)' }} dir="auto">
            {author.bio}
          </p>
        )}

        {author?.website && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <a
              href={author.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-accent)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}
            >
              <Globe size={16} />
              <span>{t('material.externalResource')}</span>
            </a>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--color-primary)' }}>
          {t('material.relatedMaterials')}
        </h2>
      </div>

      {isError ? (
        <EmptyState
          icon={<AlertCircle size={36} color="var(--color-error)" />}
          title={t('common.error')}
          description="Failed to load materials for this author."
          actionText={t('common.retry')}
          onAction={refetch}
        />
      ) : (
        <MaterialGrid
          materials={materials}
          loading={isLoading}
          emptyMessage={t('catalog.noMaterialsFound')}
        />
      )}
    </div>
  );
}
