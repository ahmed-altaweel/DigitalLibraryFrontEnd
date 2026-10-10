import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UploadCloud, 
  File, 
  Trash2, 
  ArrowLeft, 
  Download, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { materialsApi, assetsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.jsx';
import styles from './AdminMaterialForm.module.css';

export default function AdminMaterialEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

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
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteAssetId, setDeleteAssetId] = useState(null);
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);

  // Fetch material details
  const { data: material, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-material-detail', id],
    queryFn: () => materialsApi.getByIdOrSlug(id),
  });

  // Fetch assets for material
  const { data: assets = [], refetch: refetchAssets } = useQuery({
    queryKey: ['material-assets', id],
    queryFn: () => assetsApi.getForMaterial(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (material) {
      setFormData({
        title: material.title || '',
        description: material.description || '',
        content_type: material.content_type || 'book',
        language: material.language || 'ar',
        publication_date: material.publication_date ? material.publication_date.split('T')[0] : '',
        isbn: material.isbn || '',
        doi: material.doi || '',
        page_count: material.page_count ? String(material.page_count) : '',
        license_type: material.license_type || 'Public Domain',
        license_notes: material.license_notes || '',
        cover_image_url: material.cover_image_url || '',
        external_url: material.external_url || '',
      });
    }
  }, [material]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Update material mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => materialsApi.update(id, payload),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم تحديث بيانات المادة بنجاح' : 'Material updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-material-detail', id] });
    },
    onError: (err) => {
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      showToast(err.message, 'error');
    }
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: (assetId) => assetsApi.delete(assetId),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم حذف الملف الرقمي' : 'Digital asset deleted', 'success');
      setDeleteAssetId(null);
      refetchAssets();
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const handleAssetUpload = async (file) => {
    if (!file) return;
    const maxBytes = 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      showToast(language === 'ar' ? 'حجم الملف يتجاوز الحد الأقصى (100 ميجابايت)' : 'File exceeds 100MB limit', 'error');
      return;
    }

    setIsUploadingAsset(true);
    try {
      showToast(language === 'ar' ? 'جاري رفع الملف الرقمي...' : 'Uploading digital asset...', 'info');
      await assetsApi.upload(id, file);
      showToast(language === 'ar' ? 'تم رفع الملف بنجاح' : 'Asset uploaded successfully', 'success');
      refetchAssets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFieldErrors({ title: language === 'ar' ? 'العنوان مطلوب' : 'Title is required' });
      return;
    }

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
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Skeleton width="200px" height="32px" />
        <Skeleton width="100%" height="400px" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
          {t('common.error')}: {error.message}
        </p>
        <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/materials')} iconLeft={<ArrowLeft size={16} className="rtl-flip" />}>
            {t('common.back')}
          </Button>
          <h1 className={styles.title} style={{ margin: 0 }}>{t('admin.editMaterial')}</h1>
        </div>
        <p className={styles.subtitle}>
          {language === 'ar' ? `تعديل سجل: ${material?.title}` : `Editing catalog record: ${material?.title}`}
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
            />
            <Input 
              label={t('material.doi')}
              name="doi"
              value={formData.doi}
              onChange={handleChange}
            />
            <Input 
              label={t('material.pages')}
              type="number"
              min="1"
              name="page_count"
              value={formData.page_count}
              onChange={handleChange}
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
                { value: 'CC-BY-4.0', label: 'CC BY 4.0' },
                { value: 'CC-BY-SA-4.0', label: 'CC BY-SA 4.0' },
                { value: 'CC-BY-NC-4.0', label: 'CC BY-NC 4.0' },
                { value: 'All Rights Reserved', label: 'All Rights Reserved' },
              ]}
            />
            <Input 
              label={t('material.licenseNotes')}
              name="license_notes"
              value={formData.license_notes}
              onChange={handleChange}
            />
          </div>

          <div className={styles.grid2}>
            <Input 
              label={language === 'ar' ? 'رابط صورة الغلاف' : 'Cover Image URL'}
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
            />
            <Input 
              label={language === 'ar' ? 'رابط المرجع الخارجي' : 'External Resource URL'}
              name="external_url"
              value={formData.external_url}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Digital Assets Management */}
        <section>
          <h2 className={styles.sectionTitle}>{language === 'ar' ? 'الملفات الرقمية المرفقة' : 'Attached Digital Assets'}</h2>
          
          {assets.length === 0 ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              {language === 'ar' ? 'لا توجد ملفات رقمية مرفقة بهذه المادة حتى الآن.' : 'No digital assets attached to this material yet.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {assets.map((asset) => (
                <div key={asset.id} className={styles.assetItem}>
                  <div className={styles.assetDetails}>
                    <File size={20} color="var(--color-primary)" />
                    <div>
                      <strong>{asset.original_filename}</strong>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {asset.mime_type} • {(asset.file_size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <a 
                      href={assetsApi.getDownloadUrl(asset.id)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="button button--ghost button--sm"
                      style={{ textDecoration: 'none' }}
                      title="Download"
                    >
                      <Download size={14} />
                    </a>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      iconLeft={<Trash2 size={14} />}
                      onClick={() => setDeleteAssetId(asset.id)}
                      title={t('common.delete')}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div 
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={30} className={styles.dropzoneIcon} />
            <strong>{language === 'ar' ? 'رفع ملف رقمي إضافي' : 'Upload Additional Digital Asset'}</strong>
            <span className={styles.dropzoneHint}>{t('admin.allowedFormats')}</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.epub,.txt,.md"
              style={{ display: 'none' }}
              disabled={isUploadingAsset}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleAssetUpload(e.target.files[0]);
                }
              }}
            />
          </div>
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
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending}
          >
            {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Delete Asset Confirm Dialog */}
      <ConfirmDialog 
        isOpen={Boolean(deleteAssetId)}
        title={language === 'ar' ? 'حذف الملف الرقمي' : 'Delete Asset'}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => deleteAssetId && deleteAssetMutation.mutate(deleteAssetId)}
        onCancel={() => setDeleteAssetId(null)}
      />
    </div>
  );
}
