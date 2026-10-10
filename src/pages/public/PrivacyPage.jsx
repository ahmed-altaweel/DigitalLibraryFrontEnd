import React from 'react';
import { Shield, Lock, EyeOff, Cookie } from 'lucide-react';
import { useTranslation } from '../../i18n/index.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import styles from './StaticPages.module.css';

export default function PrivacyPage() {
  const { t, language } = useTranslation();

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === 'ar' ? 'سياسة الخصوصية وحماية بيانات الباحثين' : 'Privacy & Data Protection Policy'}
        </h1>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'نلتزم بالحفاظ على خصوصية قراءاتك، هوامشك البحثية، ومعلومات حسابك بأعلى المعايير الأمنية.'
            : 'Committed to safeguarding your reading history, private marginalia, and account credentials.'}
        </p>
      </header>

      <div className={styles.card}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Lock size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? '1. أمان الجلسات وملفات تعريف الارتباط (Cookies)' : '1. Secure Session Cookies'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'تعتمد المنصة حصرياً على ملفات تعريف الارتباط الآمنة (HTTP-Only Secure Cookies) لإدارة جلسات تسجيل الدخول وتجديد الرموز المميزة، دون تخزين كلمات المرور أو الرموز الحساسة في تخزين المتصفح المكشوف (LocalStorage).'
              : 'Our architecture employs HTTP-Only secure cookies exclusively for authentication sessions and silent token refresh, completely avoiding sensitive credential exposure in client storage.'}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <EyeOff size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? '2. سرية سجل القراءة والهوامش الشخصية' : '2. Reading Privacy & Personal Notes'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'سجل تتبع تقدم قراءتك وهوامشك وملاحظاتك وإشاراتك المرجعية هي بيانات خاصة بك وحدك ولا تتم مشاركتها أو بيعها لأي جهات إعلانية أو خارجية.'
              : 'Your reading progress, bookmarked pages, personal tags, and critical study notes are strictly private to your researcher account and are never shared or commercialized.'}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Shield size={20} color="var(--color-accent)" />
            <span>{language === 'ar' ? '3. حقوق الباحث في التحكم ببياناته' : '3. Data Ownership & Rights'}</span>
          </h2>
          <p className={styles.text}>
            {language === 'ar'
              ? 'يحق لك في أي وقت تعديل بياناتك الشخصية، أو سحب مقترحاتك الفهرسية، أو طلب تعطيل وحذف حسابك من خلال إعدادات الحساب.'
              : 'You retain full control over your profile details, personal lists, and submitted contributions, with the right to update or delete your account at any time.'}
          </p>
        </section>
      </div>
    </div>
  );
}
