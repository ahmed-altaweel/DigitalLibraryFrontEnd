import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, FileText } from 'lucide-react';
import Badge from '../../common/Badge/Badge.jsx';
import CoverPlaceholder from '../../common/CoverPlaceholder/CoverPlaceholder.jsx';
import { useTranslation } from '../../../i18n/index.jsx';
import styles from './MaterialCard.module.css';

export default function MaterialCard({ material }) {
  const { t, language } = useTranslation();

  if (!material) return null;

  const {
    slug,
    title,
    content_type = 'book',
    description,
    view_count = 0,
    download_count = 0,
    page_count,
    cover_image_url,
    language: docLang,
  } = material;

  // Localized content type
  const typeLabel = t(`catalog.${content_type?.toLowerCase()}`) || content_type;

  // Format numbers using Intl
  const formatNumber = (num) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(num || 0);
  };

  return (
    <Link to={`/materials/${slug}`} className={styles.card} aria-label={title}>
      <div className={styles.coverWrapper}>
        {cover_image_url ? (
          <img
            src={cover_image_url}
            alt={title}
            className={styles.coverImage}
            loading="lazy"
            onError={(e) => {
              // Hide broken image and allow fallback
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <CoverPlaceholder title={title} contentType={content_type} height={200} />
        )}
        <div className={styles.typeBadgeWrapper}>
          <Badge variant="accent" size="sm">
            {typeLabel}
          </Badge>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title} dir="auto">
          {title}
        </h3>

        {description && (
          <p className={styles.description} dir="auto">
            {description}
          </p>
        )}

        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat} title={t('material.views')}>
              <Eye size={14} />
              <span>{formatNumber(view_count)}</span>
            </span>
            {download_count > 0 && (
              <span className={styles.stat} title={t('material.downloads')}>
                <Download size={14} />
                <span>{formatNumber(download_count)}</span>
              </span>
            )}
            {page_count && (
              <span className={styles.stat} title={t('material.pages')}>
                <FileText size={14} />
                <span>{formatNumber(page_count)} {t('common.page')}</span>
              </span>
            )}
          </div>

          {docLang && (
            <span className={styles.langBadge}>
              {docLang.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
