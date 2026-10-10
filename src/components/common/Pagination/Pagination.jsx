import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '../../../i18n/index.jsx';
import styles from './Pagination.module.css';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const { t, isRTL } = useTranslation();

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav className={styles.pagination} aria-label="Pagination Navigation">
      <button
        type="button"
        className={styles.btn}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <PrevIcon size={18} />
      </button>

      {pages.map((p, idx) => (
        <button
          key={idx}
          type="button"
          className={`${styles.btn} ${p === currentPage ? styles.active : ''} ${p === '...' ? styles.dots : ''}`}
          disabled={p === '...'}
          aria-current={p === currentPage ? 'page' : undefined}
          aria-label={p === '...' ? 'More pages' : `${t('common.page')} ${p}`}
          onClick={() => typeof p === 'number' && onPageChange(p)}
        >
          {p === '...' ? <MoreHorizontal size={16} /> : p}
        </button>
      ))}

      <button
        type="button"
        className={styles.btn}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <NextIcon size={18} />
      </button>
    </nav>
  );
}
