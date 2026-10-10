import React from 'react';
import { BookOpen, ShieldCheck, Globe, Users, HeartHandshake } from 'lucide-react';
import { useTranslation } from '../../i18n/index.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import styles from './StaticPages.module.css';

export default function AboutPage() {
  const { t, language } = useTranslation();

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: language === 'ar' ? 'عن المكتبة الرقمية' : 'About Library' },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === 'ar' ? 'عن صرح المكتبة الرقمية' : 'About the Digital Library'}
        </h1>
        <p className={styles.subtitle}>
          {t('common.appTagline')}
        </p>
      </header>

      <div className={styles.card}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <BookOpen size={22} color="var(--color-accent)" />
            <span>{language === 'ar' ? 'الرسالة والرؤية الأكاديمية' : 'Mission & Scholarly Vision'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'تأسست المكتبة الرقمية لتكون مستودعاً أكاديمياً مفتوحاً وحصناً لحفظ التراث الفكري والإنتاج العلمي. نهدف إلى إتاحة أمهات الكتب، والرسائل الجامعية، والأوراق البحثية المحكمة، والمخطوطات النادرة للباحثين والقراء في شتى بقاع العالم دون عوائق مالية أو جغرافية.'
              : 'The Digital Library is established as an open academic repository and scholarly archive. Our mission is to preserve intellectual heritage and scientific literature, providing researchers and readers worldwide with unrestricted access to seminal works, dissertations, peer-reviewed papers, and rare manuscripts.'}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <ShieldCheck size={22} color="var(--color-accent)" />
            <span>{language === 'ar' ? 'معايير التحقيق والحفظ الرقمي' : 'Preservation & Scholarly Rigor'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'تخضع كافة المقتنيات في الفهرس للمراجعة والتدقيق الببليوغرافي وفق معايير الفهرسة الدولية. نحرص على حفظ الملفات الأصلية بصيغ مفتوحة (PDF/A, EPUB, TXT) تضمن استدامة القراءة عبر الأجيال مع الحفاظ على هوامش التوثيق وأرقام الصفحات المطابقة للأصول المطبوعة.'
              : 'All catalog holdings undergo rigorous bibliographic verification aligned with international archiving standards. Primary documents are preserved in open, standardized formats ensuring generational longevity while preserving original pagination and scholarly citations.'}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Globe size={22} color="var(--color-accent)" />
            <span>{language === 'ar' ? 'التزامنا بالمعرفة المفتوحة (Open Access)' : 'Commitment to Open Access'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'نؤمن بأن المعرفة حق إنساني مشترك. نشجع الإيداع الحر تحت رخص المشاع الإبداعي (Creative Commons) والملكية العامة، مع احترام كامل لحقوق الملكية الفكرية ونسب الفضل لأصحابه ومؤلفيه.'
              : 'We believe knowledge is a common human heritage. We advocate for scholarly deposits under Creative Commons and Public Domain licenses, honoring copyright integrity and proper author attribution.'}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Users size={22} color="var(--color-accent)" />
            <span>{language === 'ar' ? 'مجتمع الباحثين والمساهمين' : 'Scholarly Community'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'تتيح المنصة لكل باحث إنشاء مكتبة خاصة، وتدوين الهوامش والملاحظات الأكاديمية على مستوى الصفحة، وبناء قوائم القراءة، والمساهمة في تنقيح الفهرس واقتراح التصحيحات الببليوغرافية.'
              : 'Our platform empowers every researcher with a personal reading room: page-level marginalia notes, reading lists, reading tracking, and collaborative bibliographic contribution queues.'}
          </p>
        </section>
      </div>
    </div>
  );
}
