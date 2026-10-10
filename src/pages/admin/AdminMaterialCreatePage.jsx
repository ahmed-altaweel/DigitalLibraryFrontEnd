import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  UploadCloud, 
  File, 
  X, 
  ArrowLeft, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { materialsApi, assetsApi, authorsApi, categoriesApi, tagsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import styles from './AdminMaterialForm.module.css';

export default function AdminMaterialCreatePage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'book',
    language: 'ar',
    publication_date: '',
    isbn: '',
    doi: '',
    page_count: '',
    license_type: 'Public Domain',
    license_notes: '',
    cover_image_url: '',
    external_url: '',
    author_ids: [],
    category_ids: [],
    tag_ids: [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch taxonomies
  const { data: authors = [] } = useQuery({ queryKey: ['authors'], queryFn: authorsApi.getAll });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: tagsApi.getAll });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const toggleArrayItem = (fieldName, itemId) => {
    setFormData((prev) => {
      const currentList = prev[fieldName] || [];
      const exists = currentList.includes(itemId);
      const updated = exists 
        ? currentList.filter(id => id !== itemId)
        : [...currentList, itemId];
      return { ...prev, [fieldName]: updated };
    });
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const maxBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxBytes) {
      showToast(language === 'ar' ? 'حجم الملف يتجاوز الحد الأقصى (100 ميجابايت)' : 'File exceeds 100MB limit', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFieldErrors({ title: language === 'ar' ? 'العنوان مطلوب' : 'Title is required' });
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

      // If a digital asset file was selected, upload it
      if (selectedFile && newMaterial?.id) {
        showToast(language === 'ar' ? 'جاري رفع الملف الرقمي...' : 'Uploading digital asset...', 'info');
        await assetsApi.upload(newMaterial.id, selectedFile);
      }

      showToast(language === 'ar' ? 'تمت إضافة المادة العلمية بنجاح' : 'Material cataloged successfully', 'success');
      navigate('/admin/materials');
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/materials')} iconLeft={<ArrowLeft size={16} className="rtl-flip" />}>
            {t('common.back')}
          </Button>
          <h1 className={styles.title} style={{ margin: 0 }}>{t('admin.newMaterial')}</h1>
        </div>
        <p className={styles.subtitle}>
          {language === 'ar' ? 'إدخال مادة علمية جديدة للفهرس مع بياناتها الببليوغرافية ونسختها الرقمية' : 'Create a new catalog record with bibliographic metadata and primary document.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* Core Metadata */}
        <section>
          <h2 className={styles.sectionTitle}>{language === 'ar' ? 'البيانات الأساسية' : 'Core Identification'}</h2>
          
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Input 
              label={language === 'ar' ? 'عنوان المادة العلمية *' : 'Material Title *'}
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={fieldErrors.title}
              placeholder="e.g. مقدمة ابن خلدون / Principles of Quantum Mechanics"
              required
            />
          </div>

          <div className={styles.grid3} style={{ marginBottom: 'var(--space-4)' }}>
            <Select 
              label={t('material.contentType')}
              name="content_type"
              value={formData.content_type}
              onChange={handleChange}
              options={[
                { value: 'book', label: t('catalog.book') },
                { value: 'paper', label: t('catalog.paper') },
                { value: 'article', label: t('catalog.article') },
                { value: 'manuscript', label: t('catalog.manuscript') },
              ]}
            />

            <Select 
              label={t('material.language')}
              name="language"
              value={formData.language}
              onChange={handleChange}
              options={[
                { value: 'ar', label: 'العربية (Arabic)' },
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' },
                { value: 'fa', label: 'فارسی' },
              ]}
            />

            <Input 
              label={t('material.publicationDate')}
              type="date"
              name="publication_date"
              value={formData.publication_date}
              onChange={handleChange}
            />
          </div>

          <div className={styles.textareaWrapper}>
            <label className={styles.label}>{language === 'ar' ? 'الوصف / المستخلص العلمي' : 'Abstract / Description'}</label>
            <textarea 
              name="description"
              className={styles.textarea}
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={language === 'ar' ? 'ملخص المحتوى، موضوع الدراسة، أهم الفصول...' : 'Summary of scope, methodologies, topics covered...'}
            />
          </div>
        </section>

        {/* Bibliographic Identifiers */}
        <section>
          <h2 className={styles.sectionTitle}>{language === 'ar' ? 'المعرفات الببليوغرافية والحقوق' : 'Identifiers & Rights'}</h2>
          
          <div className={styles.grid3} style={{ marginBottom: 'var(--space-4)' }}>
            <Input 
              label={t('material.isbn')}
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="978-0-123456-47-2"
            />
            <Input 
              label={t('material.doi')}
              name="doi"
              value={formData.doi}
              onChange={handleChange}
              placeholder="10.1000/182"
            />
            <Input 
              label={t('material.pages')}
              type="number"
              min="1"
              name="page_count"
              value={formData.page_count}
              onChange={handleChange}
              placeholder="480"
            />
          </div>

          <div className={styles.grid2} style={{ marginBottom: 'var(--space-4)' }}>
            <Select 
              label={t('material.license')}
              name="license_type"
              value={formData.license_type}
              onChange={handleChange}
              options={[
                { value: 'Public Domain', label: 'Public Domain (ملك عام)' },
                { value: 'CC-BY-4.0', label: 'CC BY 4.0 (نسب المصنف)' },
                { value: 'CC-BY-SA-4.0', label: 'CC BY-SA 4.0 (نسب المصنف - الترخيص بالمثل)' },
                { value: 'CC-BY-NC-4.0', label: 'CC BY-NC 4.0 (غير تجاري)' },
                { value: 'All Rights Reserved', label: 'All Rights Reserved (محفوظ الحقوق)' },
              ]}
            />
            <Input 
              label={t('material.licenseNotes')}
              name="license_notes"
              value={formData.license_notes}
              onChange={handleChange}
              placeholder="e.g. Digitized by manuscript preservation trust"
            />
          </div>

          <div className={styles.grid2}>
            <Input 
              label={language === 'ar' ? 'رابط صورة الغلاف' : 'Cover Image URL'}
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              placeholder="https://..."
            />
            <Input 
              label={language === 'ar' ? 'رابط المرجع الخارجي' : 'External Resource URL'}
              name="external_url"
              value={formData.external_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </section>

        {/* Taxonomy Assignment */}
        <section>
          <h2 className={styles.sectionTitle}>{language === 'ar' ? 'التصنيف والفهرسة والمؤلفون' : 'Classification & Attribution'}</h2>
          
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className={styles.label} style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              {t('material.authors')}
            </label>
            <div className={styles.multiSelectBox}>
              {authors.length === 0 ? (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {language === 'ar' ? 'لا يوجد مؤلفون مسجلون بعد. يمكنك إضافتهم من صفحة الأعلام.' : 'No authors registered yet.'}
                </span>
              ) : (
                authors.map((author) => {
                  const isSelected = formData.author_ids.includes(author.id);
                  return (
                    <div 
                      key={author.id}
                      className={`${styles.selectOptionItem} ${isSelected ? styles.selectOptionItemActive : ''}`}
                      onClick={() => toggleArrayItem('author_ids', author.id)}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{author.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className={styles.label} style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              {t('nav.categories')}
            </label>
            <div className={styles.multiSelectBox}>
              {categories.length === 0 ? (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {language === 'ar' ? 'لا توجد تصنيفات مسجلة بعد.' : 'No categories registered yet.'}
                </span>
              ) : (
                categories.map((cat) => {
                  const isSelected = formData.category_ids.includes(cat.id);
                  return (
                    <div 
                      key={cat.id}
                      className={`${styles.selectOptionItem} ${isSelected ? styles.selectOptionItemActive : ''}`}
                      onClick={() => toggleArrayItem('category_ids', cat.id)}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{cat.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label className={styles.label} style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              {t('admin.tagsManage')}
            </label>
            <div className={styles.multiSelectBox}>
              {tags.length === 0 ? (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {language === 'ar' ? 'لا توجد وسوم مسجلة بعد.' : 'No tags registered yet.'}
                </span>
              ) : (
                tags.map((tag) => {
                  const isSelected = formData.tag_ids.includes(tag.id);
                  return (
                    <div 
                      key={tag.id}
                      className={`${styles.selectOptionItem} ${isSelected ? styles.selectOptionItemActive : ''}`}
                      onClick={() => toggleArrayItem('tag_ids', tag.id)}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{tag.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Digital Asset Upload */}
        <section>
          <h2 className={styles.sectionTitle}>{t('admin.uploadAsset')}</h2>
          <div 
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={36} className={styles.dropzoneIcon} />
            <strong>{t('admin.dragDrop')}</strong>
            <span className={styles.dropzoneHint}>{t('admin.allowedFormats')}</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.epub,.txt,.md"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>

          {selectedFile && (
            <div className={styles.filePreview}>
              <div className={styles.filePreviewInfo}>
                <File size={22} color="var(--color-primary)" />
                <div>
                  <strong>{selectedFile.name}</strong>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                iconLeft={<X size={16} />}
              >
                {t('common.remove')}
              </Button>
            </div>
          )}
        </section>

        <div className={styles.formActions}>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => navigate('/admin/materials')}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {language === 'ar' ? 'حفظ وإضافة المادة' : 'Catalog Material'}
          </Button>
        </div>
      </form>
    </div>
  );
}
