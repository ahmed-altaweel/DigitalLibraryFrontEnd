import React from 'react';
import { Book, FileText, Scroll, BookOpen, GraduationCap } from 'lucide-react';
import styles from './CoverPlaceholder.module.css';

const TYPE_CONFIG = {
  book: {
    icon: Book,
    accentClass: styles.bookAccent,
    label: 'Book',
  },
  paper: {
    icon: FileText,
    accentClass: styles.paperAccent,
    label: 'Paper',
  },
  article: {
    icon: FileText,
    accentClass: styles.articleAccent,
    label: 'Article',
  },
  manuscript: {
    icon: Scroll,
    accentClass: styles.manuscriptAccent,
    label: 'Manuscript',
  },
  dissertation: {
    icon: GraduationCap,
    accentClass: styles.dissertationAccent,
    label: 'Dissertation',
  },
  default: {
    icon: BookOpen,
    accentClass: styles.defaultAccent,
    label: 'Scholarship',
  },
};

export default function CoverPlaceholder({ title = '', contentType = 'book', height = 240 }) {
  const config = TYPE_CONFIG[contentType?.toLowerCase()] || TYPE_CONFIG.default;
  const Icon = config.icon;

  return (
    <div
      className={`${styles.container} ${config.accentClass}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      aria-hidden="true"
    >
      <div className={styles.topPattern}>
        <span className={styles.typeTag}>{config.label}</span>
        <Icon size={24} className={styles.typeIcon} />
      </div>

      <div className={styles.titleArea}>
        <span className={styles.scholarlyRule} />
        <h4 className={styles.titleText} dir="auto">
          {title || 'Scholarly Volume'}
        </h4>
        <span className={styles.scholarlyRule} />
      </div>

      <div className={styles.bottomWatermark}>
        <span className={styles.libraryStamp}>DIGITAL ARCHIVE</span>
      </div>
    </div>
  );
}
