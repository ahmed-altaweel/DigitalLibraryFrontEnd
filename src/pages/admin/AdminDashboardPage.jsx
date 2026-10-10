import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  BookOpen, 
  DownloadCloud, 
  Activity, 
  MessageSquare, 
  FolderTree, 
  Tag as TagIcon, 
  ShieldCheck, 
  FileText,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import Button from '../../components/common/Button/Button.jsx';
import styles from './AdminDashboardPage.module.css';

export default function AdminDashboardPage() {
  const { t, language } = useTranslation();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  const { data: pendingSuggestions } = useQuery({
    queryKey: ['admin-pending-suggestions-count'],
    queryFn: () => adminApi.getPendingSuggestions({ page: 1, size: 50 }),
  });

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  const pendingCount = pendingSuggestions?.length || 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('admin.dashboard')}</h1>
        <p className={styles.subtitle}>{t('admin.stats')}</p>
      </header>

      {error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            {t('common.error')}: {error.message}
          </p>
          <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
        </div>
      ) : (
        <section className={styles.statsGrid} aria-label={t('admin.stats')}>
          <div className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconUsers}`}>
              <Users size={26} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {isLoading ? <Skeleton width="60px" height="32px" /> : formatNumber(stats?.total_users)}
              </span>
              <span className={styles.statLabel}>{t('admin.totalUsers')}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconMaterials}`}>
              <BookOpen size={26} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {isLoading ? <Skeleton width="60px" height="32px" /> : formatNumber(stats?.total_materials)}
              </span>
              <span className={styles.statLabel}>{t('admin.totalMaterials')}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconDownloads}`}>
              <DownloadCloud size={26} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {isLoading ? <Skeleton width="60px" height="32px" /> : formatNumber(stats?.total_downloads)}
              </span>
              <span className={styles.statLabel}>{t('admin.totalDownloads')}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconActivity}`}>
              <Activity size={26} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {isLoading ? <Skeleton width="60px" height="32px" /> : formatNumber(stats?.active_users_last_30_days)}
              </span>
              <span className={styles.statLabel}>{t('admin.activeUsers')}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconQueue}`}>
              <MessageSquare size={26} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {formatNumber(pendingCount)}
              </span>
              <span className={styles.statLabel}>{t('admin.suggestionsQueue')}</span>
            </div>
          </div>
        </section>
      )}

      <div>
        <h2 className={styles.sectionTitle}>{language === 'ar' ? 'الإجراءات الإدارية السريعة' : 'Curatorial & Editorial Actions'}</h2>
        <div className={styles.actionsGrid}>
          <Link to="/admin/materials" className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <BookOpen size={22} />
              <h3 className={styles.actionTitle}>{t('admin.materialsManage')}</h3>
            </div>
            <p className={styles.actionDesc}>
              {language === 'ar' 
                ? 'استعراض المواد، تعديل البيانات، إدارة النشر والأرشفة، ورفع الملفات الأصلية.'
                : 'Browse, edit metadata, publish, archive, and manage catalog documents and assets.'}
            </p>
            <div className={styles.actionFooter}>
              <span>{language === 'ar' ? 'عرض الفهرس' : 'Go to Catalog'}</span>
              <ArrowRight size={14} className="rtl-flip" />
            </div>
          </Link>

          <Link to="/admin/materials/new" className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <PlusCircle size={22} />
              <h3 className={styles.actionTitle}>{t('admin.newMaterial')}</h3>
            </div>
            <p className={styles.actionDesc}>
              {language === 'ar'
                ? 'إدخال وعاء علمي جديد، ربطه بالمؤلفين والتصنيفات، وإرفاق النسخة الرقمية.'
                : 'Catalog a new scholarly book, paper, or manuscript with primary digital assets.'}
            </p>
            <div className={styles.actionFooter}>
              <span>{language === 'ar' ? 'إضافة وعاء' : 'New Material'}</span>
              <ArrowRight size={14} className="rtl-flip" />
            </div>
          </Link>

          <Link to="/admin/suggestions" className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <MessageSquare size={22} />
              <h3 className={styles.actionTitle}>{t('admin.suggestionsQueue')}</h3>
            </div>
            <p className={styles.actionDesc}>
              {language === 'ar'
                ? 'مراجعة وتدقيق التصويبات والتحسينات المقترحة من الباحثين وقبولها أو رفضها.'
                : 'Review scholarly corrections submitted by researchers with side-by-side diffs.'}
            </p>
            <div className={styles.actionFooter}>
              <span>{language === 'ar' ? 'مراجعة المقترحات' : 'Review Queue'} ({pendingCount})</span>
              <ArrowRight size={14} className="rtl-flip" />
            </div>
          </Link>

          <Link to="/admin/categories" className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <FolderTree size={22} />
              <h3 className={styles.actionTitle}>{t('admin.categoriesManage')}</h3>
            </div>
            <p className={styles.actionDesc}>
              {language === 'ar'
                ? 'هيكلة شجرة التصنيفات الأكاديمية والعلوم والمعارف وتحديثها.'
                : 'Organize hierarchical academic disciplines and knowledge categories.'}
            </p>
            <div className={styles.actionFooter}>
              <span>{language === 'ar' ? 'إدارة التصنيفات' : 'Categories'}</span>
              <ArrowRight size={14} className="rtl-flip" />
            </div>
          </Link>

          <Link to="/admin/authors" className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <Users size={22} />
              <h3 className={styles.actionTitle}>{t('admin.authorsManage')}</h3>
            </div>
            <p className={styles.actionDesc}>
              {language === 'ar'
                ? 'إدارة تراجم المؤلفين والأعلام والمحققين ومواقعهم الشخصية.'
                : 'Curate author authority files, academic bios, and scholar profiles.'}
            </p>
            <div className={styles.actionFooter}>
              <span>{language === 'ar' ? 'إدارة الأعلام' : 'Authors'}</span>
              <ArrowRight size={14} className="rtl-flip" />
            </div>
          </Link>

          <Link to="/admin/tags" className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <TagIcon size={22} />
              <h3 className={styles.actionTitle}>{t('admin.tagsManage')}</h3>
            </div>
            <p className={styles.actionDesc}>
              {language === 'ar'
                ? 'إدارة المكانز والوسوم الموضوعية المشتركة في الفهرس.'
                : 'Manage indexing vocabulary, scholarly keywords, and subject tags.'}
            </p>
            <div className={styles.actionFooter}>
              <span>{language === 'ar' ? 'إدارة الوسوم' : 'Tags'}</span>
              <ArrowRight size={14} className="rtl-flip" />
            </div>
          </Link>

          <Link to="/admin/users" className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <ShieldCheck size={22} />
              <h3 className={styles.actionTitle}>{t('admin.usersManage')}</h3>
            </div>
            <p className={styles.actionDesc}>
              {language === 'ar'
                ? 'إدارة حسابات المستخدمين، تفعيل/تعطيل الحسابات، ومنح صلاحيات التحرير والإدارة.'
                : 'Manage user accounts, toggle active state, and assign curator roles.'}
            </p>
            <div className={styles.actionFooter}>
              <span>{language === 'ar' ? 'إدارة المستخدمين' : 'Users & Roles'}</span>
              <ArrowRight size={14} className="rtl-flip" />
            </div>
          </Link>

          <Link to="/admin/audit-logs" className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <FileText size={22} />
              <h3 className={styles.actionTitle}>{t('admin.auditLogs')}</h3>
            </div>
            <p className={styles.actionDesc}>
              {language === 'ar'
                ? 'تتبع العمليات الأمنية والتحريرية التي تمت على المنصة وسجل الأنشطة.'
                : 'Inspect the full chronological trail of administrative and security events.'}
            </p>
            <div className={styles.actionFooter}>
              <span>{language === 'ar' ? 'سجل التدقيق' : 'Audit Trail'}</span>
              <ArrowRight size={14} className="rtl-flip" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
