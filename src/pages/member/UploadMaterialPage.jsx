import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  Book,
  GraduationCap,
  Scroll,
  FileSpreadsheet,
  X,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { materialsApi, assetsApi, authorsApi, categoriesApi, tagsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import CoverPlaceholder from '../../components/common/CoverPlaceholder/CoverPlaceholder.jsx';
import styles from './UploadMaterialPage.module.css';

export default function UploadMaterialPage() {
  const navigate = useNavigate();
  const { t, language, isRTL } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'book',
    language: 'ar',
    publication_date: '',
    isbn: '',
    doi: '',
    page_count: '',
    license_type: 'Creative Commons (CC-BY 4.0)',
    license_notes: '',
    cover_image_url: '',
    external_url: '',
    author_ids: [],
    category_ids: [],
    tag_ids: [],
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Inline Quick Author Creation Modal
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorWebsite, setNewAuthorWebsite] = useState('');

  // Fetch Taxonomies
  const { data: authors = [], refetch: refetchAuthors } = useQuery({
    queryKey: ['authors'],
    queryFn: authorsApi.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: tags = [], refetch: refetchTags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Toggle multi-select arrays
  const toggleArraySelection = (field, id) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return { ...prev, [field]: updated };
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (file) => {
    const maxBytes = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxBytes) {
      toast.error(language === 'ar' ? 'حجم الملف يتجاوز الحد الأقصى (100 ميجابايت)' : 'File exceeds 100MB limit');
      return;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'epub', 'txt', 'md'].includes(ext)) {
      toast.error(language === 'ar' ? 'صيغة الملف غير مدعومة. الصيغ المقبولة: PDF, EPUB, TXT, MD' : 'Unsupported format. Allowed: PDF, EPUB, TXT, MD');
      return;
    }
    setSelectedFile(file);
    toast.info(language === 'ar' ? `تم إرفاق: ${file.name}` : `Attached: ${file.name}`);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick author creation
  const handleQuickAuthorSubmit = async (e) => {
    e.preventDefault();
    if (!newAuthorName.trim()) return;

    try {
      const created = await authorsApi.create({
        name: newAuthorName.trim(),
        bio: newAuthorBio.trim() || undefined,
        website: newAuthorWebsite.trim() || undefined,
      });
      await refetchAuthors();
      toggleArraySelection('author_ids', created.id);
      setNewAuthorName('');
      setNewAuthorBio('');
      setNewAuthorWebsite('');
      setAuthorModalOpen(false);
      toast.success(language === 'ar' ? 'تمت إضافة المؤلف بنجاح' : 'Author created successfully');
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  };

  // Submit Material
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFieldErrors({ title: language === 'ar' ? 'عنوان المادة العلمية مطلوب' : 'Title is required' });
      toast.error(language === 'ar' ? 'يرجى إدخال عنوان المادة' : 'Please provide a title');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        content_type: formData.content_type,
        language: formData.language,
        publication_date: formData.publication_date || null,
        isbn: formData.isbn?.trim() || null,
        doi: formData.doi?.trim() || null,
        page_count: formData.page_count ? parseInt(formData.page_count, 10) : null,
        license_type: formData.license_type || null,
        license_notes: formData.license_notes?.trim() || null,
        cover_image_url: formData.cover_image_url?.trim() || null,
        external_url: formData.external_url?.trim() || null,
        author_ids: formData.author_ids,
        category_ids: formData.category_ids,
        tag_ids: formData.tag_ids,
      };

      const newMaterial = await materialsApi.create(payload);

      // If a digital document file was uploaded, upload it as primary asset
      if (selectedFile && newMaterial?.id) {
        toast.info(language === 'ar' ? 'جاري رفع الملف الرقمي وتوثيقه...' : 'Uploading digital document...');
        await assetsApi.upload(newMaterial.id, selectedFile);
      }

      toast.success(language === 'ar' ? 'تم إيداع ونشر المادة العلمية بنجاح!' : 'Scholarly material deposited successfully!');
      queryClient.invalidateQueries({ queryKey: ['materials'] });

      // Navigate to the newly created material page
      navigate(`/materials/${newMaterial.slug || newMaterial.id}`);
    } catch (err) {
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      toast.error(err.message || (language === 'ar' ? 'حدث خطأ أثناء حفظ المادة' : 'Failed to save material'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} iconLeft={<ArrowLeft size={16} className={isRTL ? 'mirror-rtl' : ''} />}>
            {t('common.back')}
          </Button>
          <h1 className={styles.title}>
            {language === 'ar' ? 'إيداع ورفع مادة علمية جديدة' : 'Deposit & Upload Scholarly Material'}
          </h1>
        </div>
        <p className={styles.subtitle}>
          {language === 'ar'
            ? 'أضف كتاباً، ورقة بحثية، مقالاً، أو مخطوطة إلى رصيد الفهرس الأكاديمي الرقمي مع الملف الأصلي وبياناته الببليوغرافية.'
            : 'Contribute a book, research paper, article, or manuscript to the open scholarly repository with complete metadata and primary document.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* Step 1: Content Type */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {language === 'ar' ? '1. نوع الوعاء العلمي' : '1. Resource Type'}
            </h2>
          </div>

          <div className={styles.typeGrid}>
            {[
              { id: 'book', name: language === 'ar' ? 'كتاب علمي' : 'Book', icon: <Book size={24} /> },
              { id: 'paper', name: language === 'ar' ? 'ورقة بحثية' : 'Research Paper', icon: <GraduationCap size={24} /> },
              { id: 'article', name: language === 'ar' ? 'مقال علمي / دراسة' : 'Scholarly Article', icon: <FileText size={24} /> },
              { id: 'manuscript', name: language === 'ar' ? 'مخطوطة نادرة' : 'Manuscript', icon: <Scroll size={24} /> },
            ].map((type) => (
              <div
                key={type.id}
                role="button"
                tabIndex={0}
                className={`${styles.typeCard} ${formData.content_type === type.id ? styles.typeActive : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, content_type: type.id }))}
                onKeyDown={(e) => e.key === 'Enter' && setFormData((prev) => ({ ...prev, content_type: type.id }))}
              >
                <div className={styles.typeIcon}>{type.icon}</div>
                <span className={styles.typeName}>{type.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Step 2: Digital Asset Upload */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {language === 'ar' ? '2. رفع الملف الرقمي (الوثيقة)' : '2. Digital File Upload'}
            </h2>
            <span className={styles.sectionSubtitle}>
              {language === 'ar' ? '(اختياري ولكن يُنصح به لتمكين القارئ والتنزيل)' : '(Optional, recommended for reader & download)'}
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.epub,.txt,.md"
            onChange={handleFileInputChange}
          />

          {!selectedFile ? (
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={44} className={styles.uploadIcon} />
              <p className={styles.dropTitle}>
                {language === 'ar' ? 'اسحب الملف الرقمي وأفلته هنا، أو اضغط للاختيار من جهازك' : 'Drag & drop document here, or click to browse'}
              </p>
              <p className={styles.dropHint}>
                {language === 'ar' ? 'الصيغ المدعومة: PDF, EPUB, TXT, MD (الحد الأقصى 100 ميجابايت)' : 'Supported formats: PDF, EPUB, TXT, MD (Max 100MB)'}
              </p>
            </div>
          ) : (
            <div className={styles.filePreview}>
              <div className={styles.fileInfo}>
                <FileText size={26} color="var(--color-primary)" />
                <div>
                  <div className={styles.fileName}>{selectedFile.name}</div>
                  <div className={styles.fileSize}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} iconLeft={<X size={16} />}>
                {language === 'ar' ? 'إزالة' : 'Remove'}
              </Button>
            </div>
          )}
        </section>

        {/* Step 3: Bibliographic Details */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {language === 'ar' ? '3. البيانات الببليوغرافية الأساسية' : '3. Core Bibliographic Details'}
            </h2>
          </div>

          <Input
            label={language === 'ar' ? 'عنوان المادة العلمية *' : 'Title *'}
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={fieldErrors.title}
            placeholder={
              formData.content_type === 'paper'
                ? 'e.g. Deep Learning Approaches to Arabic Manuscript Recognition'
                : 'e.g. مقدمة ابن خلدون'
            }
            required
          />

          <Input
            label={language === 'ar' ? 'المستخلص / نبذة عن المحتوى' : 'Abstract / Description'}
            name="description"
            textarea
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder={language === 'ar' ? 'اكتب ملخصاً وافياً للمادة وموضوعاتها الرئيسية...' : 'Provide a comprehensive overview or abstract...'}
          />

          <div className={styles.row3}>
            <Select
              label={language === 'ar' ? 'لغة النص' : 'Language'}
              name="language"
              value={formData.language}
              onChange={handleChange}
              options={[
                { value: 'ar', label: 'العربية (Arabic)' },
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' },
                { value: 'fa', label: 'فارسی' },
                { value: 'tr', label: 'Türkçe' },
              ]}
            />

            <Input
              label={language === 'ar' ? 'تاريخ النشر / الصدور' : 'Publication Date'}
              type="date"
              name="publication_date"
              value={formData.publication_date}
              onChange={handleChange}
            />

            <Input
              label={language === 'ar' ? 'عدد الصفحات' : 'Page Count'}
              type="number"
              min="1"
              name="page_count"
              value={formData.page_count}
              onChange={handleChange}
              placeholder="e.g. 350"
            />
          </div>
        </section>

        {/* Step 4: Authors & Classifications */}
        <section className={styles.section}>
          <div className={styles.sectionHeader} style={{ justifyContent: 'space-between' }}>
            <h2 className={styles.sectionTitle}>
              {language === 'ar' ? '4. المؤلفون والعلماء' : '4. Authors & Scholars'}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconLeft={<Plus size={14} />}
              onClick={() => setAuthorModalOpen(true)}
            >
              {language === 'ar' ? '+ إضافة مؤلف جديد' : '+ Add New Author'}
            </Button>
          </div>

          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {authors.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                  {language === 'ar' ? 'لا يوجد مؤلفون مسجلون. اضغط الزر أعلاه لإضافة أول مؤلف.' : 'No authors registered. Click button above to add one.'}
                </p>
              ) : (
                authors.map((author) => {
                  const isSelected = formData.author_ids.includes(author.id);
                  return (
                    <button
                      key={author.id}
                      type="button"
                      className={`${styles.tabBtn || ''}`}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: isSelected ? '#ffffff' : 'var(--color-text)',
                        fontSize: 'var(--text-xs)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => toggleArraySelection('author_ids', author.id)}
                    >
                      {author.name}
                      {isSelected && <CheckCircle2 size={12} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginTop: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
              {language === 'ar' ? 'التصنيفات الموضوعية' : 'Categories'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {categories.map((cat) => {
                const isSelected = formData.category_ids.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: isSelected ? '#ffffff' : 'var(--color-text)',
                      fontSize: 'var(--text-xs)',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleArraySelection('category_ids', cat.id)}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Step 5: Identifiers & Academic Licensing */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {language === 'ar' ? '5. المعرفات الأكاديمية والترخيص' : '5. Identifiers & Licensing'}
            </h2>
          </div>

          <div className={styles.row2}>
            <Input
              label={language === 'ar' ? 'الرقم الدولي المعياري (ISBN)' : 'ISBN'}
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="e.g. 978-0-123456-47-2"
            />

            <Input
              label={language === 'ar' ? 'المعرف الرقمي (DOI)' : 'DOI'}
              name="doi"
              value={formData.doi}
              onChange={handleChange}
              placeholder="e.g. 10.1000/182"
            />
          </div>

          <div className={styles.row2}>
            <Select
              label={language === 'ar' ? 'رخصة الملكية الفكرية' : 'License Type'}
              name="license_type"
              value={formData.license_type}
              onChange={handleChange}
              options={[
                { value: 'Creative Commons (CC-BY 4.0)', label: 'Creative Commons Attribution (CC-BY 4.0)' },
                { value: 'Creative Commons (CC-BY-SA 4.0)', label: 'Creative Commons ShareAlike (CC-BY-SA 4.0)' },
                { value: 'Public Domain', label: 'الملكية العامة (Public Domain)' },
                { value: 'Open Access / Academic Non-Commercial', label: 'وصول حر أكاديمي غير تجاري' },
                { value: 'All Rights Reserved', label: 'كافة الحقوق محفوظة (All Rights Reserved)' },
              ]}
            />

            <Input
              label={language === 'ar' ? 'رابط المصدر الخارجي (اختياري)' : 'External Source URL (optional)'}
              type="url"
              name="external_url"
              value={formData.external_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <Input
            label={language === 'ar' ? 'رابط صورة الغلاف (اختياري)' : 'Cover Image URL (optional)'}
            name="cover_image_url"
            value={formData.cover_image_url}
            onChange={handleChange}
            placeholder="https://.../cover.jpg"
          />
        </section>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            iconLeft={<UploadCloud size={18} />}
          >
            {language === 'ar' ? 'إيداع ونشر المادة الآن' : 'Deposit & Publish Material'}
          </Button>
        </div>
      </form>

      {/* Inline Quick Author Modal */}
      <Modal
        isOpen={authorModalOpen}
        onClose={() => setAuthorModalOpen(false)}
        title={language === 'ar' ? 'إضافة مؤلف أو باحث جديد' : 'Add New Author / Scholar'}
        maxWidth="480px"
      >
        <form onSubmit={handleQuickAuthorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label={language === 'ar' ? 'اسم المؤلف / المحقق *' : 'Author Name *'}
            value={newAuthorName}
            onChange={(e) => setNewAuthorName(e.target.value)}
            placeholder="e.g. أبو الوليد ابن رشد / Prof. Alan Turing"
            required
          />

          <Input
            label={language === 'ar' ? 'النبذة العلمية والسيرة' : 'Biography'}
            textarea
            rows={3}
            value={newAuthorBio}
            onChange={(e) => setNewAuthorBio(e.target.value)}
            placeholder={language === 'ar' ? 'نبذة موجزة عن العالم ومجاله...' : 'Brief academic bio...'}
          />

          <Input
            label={language === 'ar' ? 'الموقع الشخصي أو الأكاديمي' : 'Website / Academic Profile'}
            type="url"
            value={newAuthorWebsite}
            onChange={(e) => setNewAuthorWebsite(e.target.value)}
            placeholder="https://..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Button type="button" variant="ghost" onClick={() => setAuthorModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={!newAuthorName.trim()}>
              {language === 'ar' ? 'حفظ وإضافة' : 'Save & Select'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
