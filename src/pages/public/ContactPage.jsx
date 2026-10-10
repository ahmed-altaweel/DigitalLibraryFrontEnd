import React, { useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Button from '../../components/common/Button/Button.jsx';
import styles from './StaticPages.module.css';

export default function ContactPage() {
  const { t, language } = useTranslation();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    inquiryType: 'general',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(language === 'ar' ? 'يرجى إكمال الحقول الإلزامية' : 'Please fill all required fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(
        language === 'ar'
          ? 'تم إرسال استفسارك بنجاح، سيتواصل معك فريق المكتبة قريباً.'
          : 'Inquiry sent successfully. The library team will get in touch soon.'
      );
    }, 600);
  };

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: language === 'ar' ? 'الاتصال والاستفسارات' : 'Contact & Inquiries' },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === 'ar' ? 'التواصل والاستفسارات الأكاديمية' : 'Academic Inquiries & Contact'}
        </h1>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'نسعد بتواصل الباحثين والمحققين والمؤسسات العلمية للتعاون الفهرسي أو الدعم التقني.'
            : 'We welcome inquiries from scholars, researchers, and institutions regarding collections and technical support.'}
        </p>
      </header>

      <div className={styles.card}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <CheckCircle2 size={54} color="var(--color-success)" style={{ margin: '0 auto var(--space-4)' }} />
            <h2 className={styles.sectionTitle} style={{ justifyContent: 'center' }}>
              {language === 'ar' ? 'شكراً لتواصلك معنا' : 'Thank You for Reaching Out'}
            </h2>
            <p className={styles.text} style={{ marginTop: 'var(--space-2)' }}>
              {language === 'ar'
                ? 'تم استلام رسالتك وسيقوم أمناء المكتبة بمراجعتها والرد على بريدك الإلكتروني.'
                : 'Your message has been received. Our library staff will review it and reply via email.'}
            </p>
            <Button
              variant="outline"
              style={{ marginTop: 'var(--space-6)' }}
              onClick={() => {
                setSubmitted(false);
                setForm({ name: '', email: '', inquiryType: 'general', subject: '', message: '' });
              }}
            >
              {language === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <Input
                label={language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. د. أحمد الشريف / Dr. Jane Doe"
                required
              />

              <Input
                label={language === 'ar' ? 'البريد الإلكتروني الأكاديمي *' : 'Email Address *'}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="scholar@university.edu"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <Select
                label={language === 'ar' ? 'طبيعة الاستفسار' : 'Inquiry Category'}
                name="inquiryType"
                value={form.inquiryType}
                onChange={handleChange}
                options={[
                  { value: 'general', label: language === 'ar' ? 'استفسار عام عن المكتبة' : 'General Library Inquiry' },
                  { value: 'deposit', label: language === 'ar' ? 'إيداع مخطوطات أو أطروحات' : 'Manuscript / Thesis Deposit' },
                  { value: 'correction', label: language === 'ar' ? 'تصحيح فهرسي أو ببليوغرافي' : 'Bibliographic Correction' },
                  { value: 'partnership', label: language === 'ar' ? 'شراكة بحثية أو مؤسسية' : 'Institutional Partnership' },
                ]}
              />

              <Input
                label={language === 'ar' ? 'موضوع الرسالة' : 'Subject'}
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder={language === 'ar' ? 'موجز الاستفسار...' : 'Brief subject line...'}
              />
            </div>

            <Input
              label={language === 'ar' ? 'نص الرسالة أو الاستفسار *' : 'Message *'}
              textarea
              rows={5}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder={language === 'ar' ? 'اكتب تفاصيل استفسارك أو اقتراحك هنا...' : 'Write your detailed inquiry here...'}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" size="lg" loading={loading} iconLeft={<Send size={18} />}>
                {language === 'ar' ? 'إرسال الاستفسار' : 'Submit Inquiry'}
              </Button>
            </div>
          </form>
        )}

        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <span className={styles.infoBoxTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} /> {language === 'ar' ? 'البريد الإلكتروني' : 'Direct Email'}
            </span>
            <span className={styles.infoBoxContent}>support@digitallibrary.edu</span>
          </div>

          <div className={styles.infoBox}>
            <span className={styles.infoBoxTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> {language === 'ar' ? 'ساعات المراجعة الأكاديمية' : 'Service Hours'}
            </span>
            <span className={styles.infoBoxContent}>
              {language === 'ar' ? 'الأحد - الخميس (08:00 - 16:00)' : 'Sun - Thu (08:00 - 16:00)'}
            </span>
          </div>

          <div className={styles.infoBox}>
            <span className={styles.infoBoxTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> {language === 'ar' ? 'المقر والأرشيف' : 'Archive Location'}
            </span>
            <span className={styles.infoBoxContent}>
              {language === 'ar' ? 'مبنى قاعة القراءة والرقمنة المركزية' : 'Central Digital Archives & Reading Hall'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
