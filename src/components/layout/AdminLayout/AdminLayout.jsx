import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users,
  Tag as TagIcon,
  MessageSquare,
  UserCog,
  FileText,
  LogOut,
  ArrowLeft,
  Globe,
  Sun,
  Moon,
  BookMarked,
  Shield
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useTranslation } from '../../../i18n/index.jsx';
import { useTheme } from '../../../context/ThemeContext.jsx';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { isAdmin, logout, user } = useAuth();
  const { t, language, setLanguage, isRTL } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('sepia');
    else setTheme('light');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logo}>
            <Shield size={24} className={styles.logoIcon} />
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoTitle}>{t('common.appName')}</span>
              <span className={styles.logoSubtitle}>{t('admin.dashboard')}</span>
            </div>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Admin Navigation">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            <LayoutDashboard size={18} />
            <span>{t('admin.dashboard')}</span>
          </NavLink>
          
          <NavLink
            to="/admin/materials"
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            <BookOpen size={18} />
            <span>{t('admin.materialsManage')}</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            <FolderTree size={18} />
            <span>{t('admin.categoriesManage')}</span>
          </NavLink>

          <NavLink
            to="/admin/authors"
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            <Users size={18} />
            <span>{t('admin.authorsManage')}</span>
          </NavLink>

          <NavLink
            to="/admin/tags"
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            <TagIcon size={18} />
            <span>{t('admin.tagsManage')}</span>
          </NavLink>

          <NavLink
            to="/admin/suggestions"
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            <MessageSquare size={18} />
            <span>{t('admin.suggestionsQueue')}</span>
          </NavLink>

          {isAdmin && (
            <>
              <div className={styles.navGroupLabel}>{t('admin.roles')}</div>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
              >
                <UserCog size={18} />
                <span>{t('admin.usersManage')}</span>
              </NavLink>

              <NavLink
                to="/admin/audit-logs"
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
              >
                <FileText size={18} />
                <span>{t('admin.auditLogs')}</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link to="/" className={styles.returnLink}>
            <ArrowLeft size={16} className={isRTL ? 'mirror-rtl' : ''} />
            <span>{t('nav.home')}</span>
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.headerTitleRow}>
            <h1 className={styles.pageHeaderTitle}>{t('admin.dashboard')}</h1>
          </div>
          
          <div className={styles.headerControls}>
            <button
              onClick={toggleLanguage}
              className={styles.headerIconBtn}
              title={language === 'ar' ? 'English' : 'عربي'}
              aria-label="Toggle language"
            >
              <Globe size={18} />
              <span className={styles.btnLabel}>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={cycleTheme}
              className={styles.headerIconBtn}
              title={`Theme: ${theme}`}
              aria-label="Toggle theme"
            >
              {theme === 'light' && <Sun size={18} />}
              {theme === 'dark' && <Moon size={18} />}
              {theme === 'sepia' && <BookMarked size={18} />}
            </button>

            <div className={styles.userInfo}>
              <span className={styles.userBadge}>{user?.username || 'Staff'}</span>
            </div>
          </div>
        </header>

        <main id="main-content" className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
