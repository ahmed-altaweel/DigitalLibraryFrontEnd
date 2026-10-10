import React from 'react';
import { Scale, CheckCircle2, AlertOctagon, BookMarked } from 'lucide-react';
import { useTranslation } from '../../i18n/index.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import styles from './StaticPages.module.css';

export default function TermsPage() {
  const { t, language } = useTranslation();

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: language === 'ar' ? 'شروط الاستخدام' : 'Terms of Service' },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === 'ar' ? 'شروط الاستخدام وسياسة النشر الأكاديمي' : 'Terms of Use & Scholarly Guidelines'}
        </h1>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'القواعد المنظمة للإفادة من مصادر المكتبة، وإيداع الأوعية العلمية، وحقوق الملكية الفكرية.'
            : 'Governing guidelines for library resource utilization, open-access deposits, and copyright preservation.'}
        </p>
      </header>

      <div className={styles.card}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Scale size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? '1. الاستخدام الأكاديمي والبحثي' : '1. Academic & Scholarly Use'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'تُتاح محتويات المكتبة الرقمية للأغراض التعليمية والبحث العلمي غير التجاري. يحق للمستفيدين قراءة الأوعية وتحميل النسخ المسموح بها وتضمين الاقتباسات المرجعية مع التزام التوثيق العلمي الدقيق.'
              : 'Holdings are accessible for non-commercial educational and scholarly research. Users are permitted to read, download authorized digital documents, and cite resources provided accurate scholarly attribution is maintained.'}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <BookMarked size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? '2. إيداع المواد العلمية ومسؤولية الباحث' : '2. Scholarly Deposits & Researcher Responsibility'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'عند إيداع كتاب، ورقة بحثية، أو مخطوطة عبر بوابة الإيداع، يقر الباحث بأنه المالك للحقوق أو أن المصدر يقع ضمن نطاق الملكية العامة أو رخص المشاع الإبداعي المفتوح. تحتفظ إدارة المكتبة بحق مراجعة المادة وتنقيح بياناتها.'
              : 'By depositing a work through the upload portal, the contributor warrants they hold requisite rights or that the material resides in the Public Domain or an open license. The library reserves editorial rights to verify metadata.'}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <AlertOctagon size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? '3. النزاهة العلمية وحظر التعدي' : '3. Intellectual Property Integrity'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'يُحظر كشط البيانات آلياً بشكل يضر بخوادم المنصة أو إزالة إشعارات حقوق الملكية الفكرية من الملفات الرقمية الأصلية.'
              : 'Automated scraping harmful to system integrity or removal of embedded copyright notices from primary documents is strictly prohibited.'}
          </p>
        </section>
      </div>
    </div>
  );
}
