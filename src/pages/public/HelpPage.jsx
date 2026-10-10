import React from 'react';
import { HelpCircle, Search, BookOpen, UploadCloud, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n/index.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import styles from './StaticPages.module.css';

export default function HelpPage() {
  const { t, language } = useTranslation();

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: language === 'ar' ? 'المساعدة ودليل الاستخدام' : 'Help & Search Guide' },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === 'ar' ? 'دليل البحث والمساعدة' : 'Help & Research Guide'}
        </h1>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'إرشادات وافية للبحث المتقدم في الفهرس، استخدام قارئ المخطوطات الرقمي، وإيداع المواد العلمية.'
            : 'Comprehensive guidance on catalog exploration, using the digital reader, and depositing scholarly materials.'}
        </p>
      </header>

      <div className={styles.card}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Search size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? 'كيف تبحث في الفهرس بدقة؟' : 'How to Search the Catalog'}</span>
          </h2>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              {language === 'ar' ? 'البحث بالنص والكلمات المفتاحية' : 'Full-Text & Keyword Search'}
            </h3>
            <p className={styles.faqAnswer}>
              {language === 'ar'
                ? 'يمكنك البحث عن أي كلمة في العنوان، اسم المؤلف، أو نبذة الكتاب مباشرة من شريط البحث في أعلى أي صفحة. يدعم النظام الكلمات العربية واللاتينية بتطابق فوري.'
                : 'Enter keywords, author names, or subject terms in the global search bar. The search engine matches titles and bibliographic summaries dynamically.'}
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              {language === 'ar' ? 'التصفية بحسب نوع الوعاء والتصنيف' : 'Filtering by Resource Type'}
            </h3>
            <p className={styles.faqAnswer}>
              {language === 'ar'
                ? 'في صفحة الفهرس العام (/catalog)، يمكنك تصفية النتائج بحسب نوع الوعاء (كتاب، ورقة بحثية، مقال علمي، مخطوطة)، أو تحديد تصنيف معرفي معين.'
                : 'Use the sidebar in the Catalog page to filter results by resource type (Book, Research Paper, Article, Manuscript) or specific academic category.'}
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <BookOpen size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? 'استخدام قارئ الوثائق المدمج' : 'Using the Built-in Reader'}</span>
          </h2>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              {language === 'ar' ? 'السمات وملاءمة القراءة (الوضع الليلي وورق السيبيا)' : 'Reader Themes & Focus'}
            </h3>
            <p className={styles.faqAnswer}>
              {language === 'ar'
                ? 'يتيح لك القارئ التبديل الفوري بين وضع الورق الطبيعي (فاتح)، ووضع السيبيا (ورق عتيق مريح للعين)، والوضع الليلي الهادئ، بالإضافة إلى التكبير التفاعلي وملاءمة العرض.'
                : 'The reader features seamless switching between Parchment (Light), Sepia (Classic Book Paper), and Charcoal (Dark), along with zoom and fit-width modes.'}
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              {language === 'ar' ? 'حفظ التقدم والعلامات المرجعية تلقائياً' : 'Auto-Save Reading Progress & Bookmarks'}
            </h3>
            <p className={styles.faqAnswer}>
              {language === 'ar'
                ? 'عند تسجيل دخولك، يتم حفظ آخر صفحة وصلت إليها تلقائياً. يمكنك إضافة علامة مرجعية مع ملاحظة خاصة في أي وقت بالضغط على أيقونة الإشارة المرجعية.'
                : 'For logged-in members, current reading page progress is synchronized automatically. You can also pin custom bookmarks with scholarly notes.'}
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <UploadCloud size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? 'إيداع ورفع مادة علمية جديدة' : 'Depositing a Scholarly Work'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'يمكنك التوجه لصفحة "إيداع مادة علمية" (/upload) وإرفاق ملف كتابك أو بحثك (PDF أو EPUB) مع تعبئة بياناته الببليوغرافية وحقوق الملكية لنشره فوراً في الفهرس العام.'
              : 'Navigate to the Deposit Material page (/upload) to attach your PDF or EPUB document, specify its metadata and open license, and catalog it immediately.'}
          </p>
        </section>
      </div>
    </div>
  );
}
