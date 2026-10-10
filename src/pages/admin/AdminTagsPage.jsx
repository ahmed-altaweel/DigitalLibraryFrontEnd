import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag as TagIcon, Search, X } from 'lucide-react';
import { tagsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Table from '../../components/common/Table/Table.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.jsx';
import styles from './AdminTagsPage.module.css';

export default function AdminTagsPage() {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [createError, setCreateError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  // Fetch tags
  const { data: tags = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: (data) => tagsApi.create(data),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تمت إضافة الوسم بنجاح' : 'Tag created successfully', 'success');
      setNewTagName('');
      setCreateError('');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err) => {
      setCreateError(err.message);
      showToast(err.message, 'error');
    }
  });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => tagsApi.delete(id),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم حذف الوسم' : 'Tag deleted', 'success');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      setCreateError(language === 'ar' ? 'اسم الوسم مطلوب' : 'Tag name is required');
      return;
    }
    createMutation.mutate({ name: newTagName.trim() });
  };

  const filteredTags = tags.filter((tag) => {
    if (!searchTerm.trim()) return true;
    return tag.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      key: 'name',
      label: language === 'ar' ? 'اسم الوسم' : 'Tag Name',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <TagIcon size={16} color="var(--color-primary)" />
          <span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      )
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (v) => <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{v}</code>
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_, row) => (
        <Button 
          size="sm" 
          variant="danger" 
          iconLeft={<Trash2 size={14} />} 
          onClick={() => setDeleteId(row.id)}
          title={t('common.delete')}
        >
          {t('common.delete')}
        </Button>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>{t('admin.tagsManage')}</h1>
          <p>{language === 'ar' ? 'المكنز والكلمات المفتاحية والوسوم الموضوعية الموحدة' : 'Controlled vocabulary, thematic keywords, and subject tags'}</p>
        </div>
      </header>

      {/* Quick Add Form */}
      <form onSubmit={handleCreate} className={styles.createBar}>
        <div style={{ flex: 1 }}>
          <Input 
            placeholder={language === 'ar' ? 'اسم الوسم الجديد (مثال: مخطوطات نادرة، فلسفة إشراقية)...' : 'New tag name...'}
            value={newTagName}
            onChange={(e) => { setNewTagName(e.target.value); setCreateError(''); }}
            error={createError}
          />
        </div>
        <Button 
          type="submit" 
          iconLeft={<Plus size={16} />} 
          loading={createMutation.isPending}
        >
          {language === 'ar' ? 'إضافة وسم' : 'Add Tag'}
        </Button>
      </form>

      <div className={styles.searchBar}>
        <Input 
          placeholder={language === 'ar' ? 'بحث في الوسوم...' : 'Search tags...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      {error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            {t('common.error')}: {error.message}
          </p>
          <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={filteredTags} 
          loading={isLoading} 
          emptyMessage={language === 'ar' ? 'لا توجد وسوم مطابقة' : 'No tags found'}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={Boolean(deleteId)}
        title={language === 'ar' ? 'حذف الوسم' : 'Delete Tag'}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
