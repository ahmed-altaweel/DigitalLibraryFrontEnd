import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '../../../i18n/index.jsx';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.col}>
          <div className={styles.brandRow}>
            <BookOpen size={22} className={styles.brandIcon} />
            <h3 className={styles.title}>{t('common.appName')}</h3>
          </div>
          <p className={styles.text}>{t('common.appTagline')}</p>
        </div>
        
        <div className={styles.col}>
          <h4 className={styles.subtitle}>{t('nav.catalog')}</h4>
          <Link to="/catalog" className={styles.link}>{t('nav.catalog')}</Link>
          <Link to="/search" className={styles.link}>{t('common.search')}</Link>
          <Link to="/library" className={styles.link}>{t('nav.myLibrary')}</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.subtitle}>{t('member.readingListsTitle')}</h4>
          <Link to="/reading-lists" className={styles.link}>{t('nav.readingLists')}</Link>
          <Link to="/bookmarks" className={styles.link}>{t('nav.bookmarks')}</Link>
          <Link to="/contributions" className={styles.link}>{t('nav.contributions')}</Link>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} {t('common.appName')}. {t('common.appTagline')}.</p>
      </div>
    </footer>
  );
}
