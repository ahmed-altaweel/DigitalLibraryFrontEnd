import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Library,
  Bookmark,
  Clock,
  ListOrdered,
  FileEdit,
  Shield,
  Globe,
  Sun,
  Moon,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useTranslation } from '../../../i18n/index.jsx';
import { useTheme } from '../../../context/ThemeContext.jsx';
import SearchBar from '../../common/SearchBar/SearchBar.jsx';
import Button from '../../common/Button/Button.jsx';
import Avatar from '../../common/Avatar/Avatar.jsx';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, logout, isEditor, isAdmin } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
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
    <>
      <a href="#main-content" className="skip-link">
        {t('common.skipToContent')}
      </a>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.left}>
            <Link to="/" className={styles.logo} aria-label={t('common.appName')}>
              <BookOpen size={26} className={styles.logoIcon} />
              <div className={styles.logoTextWrapper}>
                <span className={styles.logoText}>{t('common.appName')}</span>
              </div>
            </Link>
            
            <nav className={styles.desktopNav} aria-label="Main Navigation">
              <Link to="/" className={styles.navLink}>{t('nav.home')}</Link>
              <Link to="/catalog" className={styles.navLink}>{t('nav.catalog')}</Link>
              {isAuthenticated && (
                <Link to="/library" className={styles.navLink}>{t('nav.myLibrary')}</Link>
              )}
              {(isEditor || isAdmin) && (
                <Link to="/admin" className={`${styles.navLink} ${styles.adminLink}`}>
                  <Shield size={16} />
                  <span>{t('nav.admin')}</span>
                </Link>
              )}
            </nav>
          </div>

          <div className={styles.center}>
            <div className={styles.search}>
              <SearchBar
                placeholder={t('catalog.searchPlaceholder')}
                onSubmit={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
              />
            </div>
          </div>

          <div className={styles.right}>
            {/* Language Switcher */}
            <button
              className={styles.iconBtn}
              onClick={toggleLanguage}
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              aria-label="Toggle language"
            >
              <Globe size={18} />
              <span className={styles.btnLabel}>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              className={styles.iconBtn}
              onClick={cycleTheme}
              title={`Theme: ${theme}`}
              aria-label="Toggle color theme"
            >
              {theme === 'light' && <Sun size={18} />}
              {theme === 'dark' && <Moon size={18} />}
              {theme === 'sepia' && <BookMarked size={18} />}
            </button>

            {isAuthenticated ? (
              <div className={styles.userSection} ref={userMenuRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="User Account Menu"
                >
                  <Avatar name={user?.full_name || user?.username || 'User'} size="sm" />
                </button>

                {userMenuOpen && (
                  <div className={styles.userMenu} role="menu">
                    <div className={styles.userMenuHeader}>
                      <span className={styles.userName}>{user?.full_name || user?.username}</span>
                      <span className={styles.userEmail}>{user?.email}</span>
                    </div>
                    <div className={styles.divider} />
                    <Link to="/dashboard" className={styles.menuItem} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard size={16} />
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link to="/library" className={styles.menuItem} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Library size={16} />
                      <span>{t('nav.myLibrary')}</span>
                    </Link>
                    <Link to="/reading-lists" className={styles.menuItem} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <ListOrdered size={16} />
                      <span>{t('nav.readingLists')}</span>
                    </Link>
                    <Link to="/bookmarks" className={styles.menuItem} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Bookmark size={16} />
                      <span>{t('nav.bookmarks')}</span>
                    </Link>
                    <Link to="/progress" className={styles.menuItem} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Clock size={16} />
                      <span>{t('nav.progress')}</span>
                    </Link>
                    <Link to="/contributions" className={styles.menuItem} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <FileEdit size={16} />
                      <span>{t('nav.contributions')}</span>
                    </Link>
                    <Link to="/settings" className={styles.menuItem} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Settings size={16} />
                      <span>{t('nav.settings')}</span>
                    </Link>
                    <div className={styles.divider} />
                    <button className={`${styles.menuItem} ${styles.logoutItem}`} role="menuitem" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  {t('nav.login')}
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  {t('nav.register')}
                </Button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              className={styles.mobileToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={styles.mobileDrawer}>
            <div className={styles.mobileSearch}>
              <SearchBar
                placeholder={t('catalog.searchPlaceholder')}
                onSubmit={(q) => {
                  setMobileMenuOpen(false);
                  navigate(`/search?q=${encodeURIComponent(q)}`);
                }}
              />
            </div>
            <nav className={styles.mobileNavLinks}>
              <Link to="/" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.home')}</Link>
              <Link to="/catalog" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.catalog')}</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.dashboard')}</Link>
                  <Link to="/library" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.myLibrary')}</Link>
                  <Link to="/reading-lists" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.readingLists')}</Link>
                  <Link to="/bookmarks" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.bookmarks')}</Link>
                  <Link to="/progress" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.progress')}</Link>
                  <Link to="/contributions" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.contributions')}</Link>
                  <Link to="/settings" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.settings')}</Link>
                  {(isEditor || isAdmin) && (
                    <Link to="/admin" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.admin')}</Link>
                  )}
                  <button className={`${styles.mobileNavLink} ${styles.mobileLogout}`} onClick={handleLogout}>{t('nav.logout')}</button>
                </>
              ) : (
                <div className={styles.mobileAuthRow}>
                  <Button variant="outline" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                    {t('nav.login')}
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
                    {t('nav.register')}
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
