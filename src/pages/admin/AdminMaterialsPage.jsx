import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Archive, 
  Search, 
  RotateCcw,
  ExternalLink,
  Eye,
  Download
} from 'lucide-react';
import { materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Table from '../../components/common/Table/Table.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Pagination from '../../components/common/Pagination/Pagination.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.jsx';
import CoverPlaceholder from '../../components/common/CoverPlaceholder/CoverPlaceholder.jsx';
import styles from './AdminMaterialsPage.module.css';

export default function AdminMaterialsPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Filter & pagination state
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('');
  const [status, setStatus] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch materials
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-materials', { page, size: pageSize, q: searchTerm, content_type: contentType, status }],
    queryFn: () => materialsApi.getAll({
      page,
      size: pageSize,
      q: searchTerm || undefined,
      content_type: contentType || undefined,
      status: status || undefined,
    }),
  });

  const materialsList = data?.items || [];
  const totalPages = data?.pages || 1;

  // Mutations
  const publishMutation = useMutation({
    mutationFn: (id) => materialsApi.publish(id),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم نشر المادة بنجاح' : 'Material published successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const unpublishMutation = useMutation({
    mutationFn: (id) => materialsApi.unpublish(id),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم إلغاء نشر المادة وإعادتها لمسودة' : 'Material reverted to draft', 'info');
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => materialsApi.archive(id),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تمت أرشفة المادة' : 'Material archived', 'info');
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => materialsApi.delete(id),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم حذف المادة بنجاح' : 'Material deleted successfully', 'success');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setContentType('');
    setStatus('');
    setPage(1);
  };

  const contentTypeOptions = [
    { value: '', label: t('catalog.allTypes') },
    { value: 'book', label: t('catalog.book') },
    { value: 'paper', label: t('catalog.paper') },
    { value: 'article', label: t('catalog.article') },
    { value: 'manuscript', label: t('catalog.manuscript') },
  ];

  const statusOptions = [
    { value: '', label: language === 'ar' ? 'كافة الحالات' : 'All Statuses' },
    { value: 'published', label: t('catalog.published') },
    { value: 'draft', label: t('catalog.draft') },
    { value: 'archived', label: t('catalog.archived') },
  ];

  const getStatusBadgeVariant = (st) => {
    if (st === 'published') return 'success';
    if (st === 'draft') return 'warning';
    return 'default';
  };

  const columns = [
    {
      key: 'title',
      label: language === 'ar' ? 'المادة العلمية' : 'Material',
      render: (_, row) => (
        <div className={styles.materialCell}>
          <div className={styles.materialThumbnail}>
            {row.cover_image_url ? (
              <img 
                src={row.cover_image_url} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <CoverPlaceholder title={row.title} contentType={row.content_type} />
            )}
          </div>
          <div className={styles.materialInfo}>
            <Link to={`/materials/${row.slug || row.id}`} className={styles.materialTitle} target="_blank" rel="noopener noreferrer">
              {row.title}
            </Link>
            <span className={styles.materialMeta}>
              {row.language?.toUpperCase()} • {row.publication_date ? new Date(row.publication_date).getFullYear() : '—'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'content_type',
      label: t('material.contentType'),
      render: (v) => <Badge variant="secondary">{v ? t(`catalog.${v}`) || v : '—'}</Badge>
    },
    {
      key: 'publication_status',
      label: t('common.status'),
      render: (v) => (
        <Badge variant={getStatusBadgeVariant(v)}>
          {v ? t(`catalog.${v}`) || v : '—'}
        </Badge>
      )
    },
    {
      key: 'stats',
      label: language === 'ar' ? 'التفاعل' : 'Interactions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          <span title={t('material.views')} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Eye size={12} /> {row.view_count || 0}
          </span>
          <span title={t('material.downloads')} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Download size={12} /> {row.download_count || 0}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: language === 'ar' ? 'تاريخ الإضافة' : 'Created',
      render: (v) => v ? new Date(v).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '—'
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_, row) => (
        <div className={styles.actionButtons}>
          <Button 
            size="sm" 
            variant="outline" 
            iconLeft={<Edit size={14} />} 
            onClick={() => navigate(`/admin/materials/${row.id}/edit`)}
            title={t('common.edit')}
          >
            {t('common.edit')}
          </Button>

          {row.publication_status !== 'published' ? (
            <Button 
              size="sm" 
              variant="outline" 
              iconLeft={<CheckCircle size={14} />} 
              onClick={() => publishMutation.mutate(row.id)}
              disabled={publishMutation.isPending}
              title={language === 'ar' ? 'نشر' : 'Publish'}
            >
              {language === 'ar' ? 'نشر' : 'Publish'}
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              iconLeft={<XCircle size={14} />} 
              onClick={() => unpublishMutation.mutate(row.id)}
              disabled={unpublishMutation.isPending}
              title={language === 'ar' ? 'إلغاء النشر' : 'Unpublish'}
            >
              {language === 'ar' ? 'مسودة' : 'Draft'}
            </Button>
          )}

          {row.publication_status !== 'archived' && (
            <Button 
              size="sm" 
              variant="outline" 
              iconLeft={<Archive size={14} />} 
              onClick={() => archiveMutation.mutate(row.id)}
              disabled={archiveMutation.isPending}
              title={language === 'ar' ? 'أرشفة' : 'Archive'}
            >
              {language === 'ar' ? 'أرشفة' : 'Archive'}
            </Button>
          )}

          <Button 
            size="sm" 
            variant="danger" 
            iconLeft={<Trash2 size={14} />} 
            onClick={() => setDeleteId(row.id)}
            title={t('common.delete')}
          >
            {t('common.delete')}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>{t('admin.materialsManage')}</h1>
          <p>{language === 'ar' ? 'إدارة ونشر وتعديل أوعية الفهرس والوثائق الرقمية' : 'Manage catalog acquisitions, publication status, and metadata'}</p>
        </div>
        <Button 
          iconLeft={<Plus size={18} />} 
          onClick={() => navigate('/admin/materials/new')}
        >
          {t('admin.newMaterial')}
        </Button>
      </header>

      <section className={styles.filterBar} aria-label="Filters">
        <Input 
          placeholder={t('catalog.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          icon={<Search size={18} />}
        />
        <Select 
          options={contentTypeOptions}
          value={contentType}
          onChange={(e) => { setContentType(e.target.value); setPage(1); }}
        />
        <Select 
          options={statusOptions}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        />
        <Button 
          variant="ghost" 
          iconLeft={<RotateCcw size={16} />}
          onClick={handleResetFilters}
        >
          {t('common.resetFilters')}
        </Button>
      </section>

      {error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            {t('common.error')}: {error.message}
          </p>
          <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
        </div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={materialsList} 
            loading={isLoading} 
            emptyMessage={t('catalog.noMaterialsFound')}
          />

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog 
        isOpen={Boolean(deleteId)}
        title={language === 'ar' ? 'حذف مادة علمية' : 'Delete Material'}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
