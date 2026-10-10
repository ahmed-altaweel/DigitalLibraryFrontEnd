import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  ListOrdered,
  Bookmark,
  Clock,
  Tag,
  StickyNote,
  FileEdit,
  Settings
} from 'lucide-react';
import { useTranslation } from '../../../i18n/index.jsx';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className={styles.sidebar} aria-label="Member Navigation">
      <nav className={styles.nav}>
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <LayoutDashboard size={18} />
          <span>{t('nav.dashboard')}</span>
        </NavLink>
        <NavLink to="/library" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <Library size={18} />
          <span>{t('nav.myLibrary')}</span>
        </NavLink>
        <NavLink to="/reading-lists" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <ListOrdered size={18} />
          <span>{t('nav.readingLists')}</span>
        </NavLink>
        <NavLink to="/bookmarks" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <Bookmark size={18} />
          <span>{t('nav.bookmarks')}</span>
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <Clock size={18} />
          <span>{t('nav.progress')}</span>
        </NavLink>
        <NavLink to="/my-tags" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <Tag size={18} />
          <span>{t('nav.tags')}</span>
        </NavLink>
        <NavLink to="/my-notes" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <StickyNote size={18} />
          <span>{t('nav.notes')}</span>
        </NavLink>
        <NavLink to="/contributions" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <FileEdit size={18} />
          <span>{t('nav.contributions')}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <Settings size={18} />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </nav>
    </aside>
  );
}
