import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderTree, Search } from 'lucide-react';
import { categoriesApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Table from '../../components/common/Table/Table.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import styles from './AdminCategoriesPage.module.css';

export default function AdminCategoriesPage() {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch categories
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => categoriesApi.create(data),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم إنشاء التصنيف بنجاح' : 'Category created successfully', 'success');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      setFormError(err.message);
      showToast(err.message, 'error');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoriesApi.update(id, data),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم تحديث التصنيف بنجاح' : 'Category updated successfully', 'success');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      setFormError(err.message);
      showToast(err.message, 'error');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم حذف التصنيف بنجاح' : 'Category deleted successfully', 'success');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormParentId('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name || '');
    setFormDescription(cat.description || '');
    setFormParentId(cat.parent_id || '');
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormError('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError(language === 'ar' ? 'اسم التصنيف مطلوب' : 'Category name is required');
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDescription?.trim() || null,
      parent_id: formParentId || null,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return cat.name?.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q);
  });

  const parentCategoryOptions = [
    { value: '', label: language === 'ar' ? 'تصنيف رئيسي (بدون أب)' : 'Root Category (No Parent)' },
    ...categories
      .filter((c) => !editingCategory || c.id !== editingCategory.id)
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  const columns = [
    {
      key: 'name',
      label: language === 'ar' ? 'اسم التصنيف' : 'Category Name',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <FolderTree size={18} color="var(--color-primary)" />
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
      key: 'description',
      label: language === 'ar' ? 'الوصف' : 'Description',
      render: (v) => v || <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
    },
    {
      key: 'parent_id',
      label: language === 'ar' ? 'التصنيف الأب' : 'Parent Category',
      render: (v) => {
        if (!v) return <Badge variant="secondary">{language === 'ar' ? 'رئيسي' : 'Root'}</Badge>;
        const parent = categories.find((c) => c.id === v);
        return parent ? <Badge>{parent.name}</Badge> : <Badge>{v}</Badge>;
      }
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
            onClick={() => openEditModal(row)}
            title={t('common.edit')}
          >
            {t('common.edit')}
          </Button>
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
          <h1>{t('admin.categoriesManage')}</h1>
          <p>{language === 'ar' ? 'إدارة الهيكل الشجري للتصنيفات والعلوم والمعارف' : 'Manage academic knowledge categories and hierarchy'}</p>
        </div>
        <Button 
          iconLeft={<Plus size={18} />} 
          onClick={openCreateModal}
        >
          {language === 'ar' ? 'إضافة تصنيف' : 'Add Category'}
        </Button>
      </header>

      <div className={styles.searchBar}>
        <Input 
          placeholder={language === 'ar' ? 'بحث في التصنيفات...' : 'Search categories...'}
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
          data={filteredCategories} 
          loading={isLoading} 
          emptyMessage={language === 'ar' ? 'لا توجد تصنيفات مطابقة' : 'No categories found'}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCategory 
          ? (language === 'ar' ? 'تعديل التصنيف' : 'Edit Category')
          : (language === 'ar' ? 'إضافة تصنيف جديد' : 'New Category')
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleSave} 
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className={styles.modalForm}>
          <Input 
            label={language === 'ar' ? 'اسم التصنيف *' : 'Category Name *'}
            value={formName}
            onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
            error={formError}
            required
            autoFocus
          />

          <Input 
            label={language === 'ar' ? 'الوصف المختصر' : 'Short Description'}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder={language === 'ar' ? 'نبذة عن موضوعات هذا التصنيف' : 'Scope of this discipline'}
          />

          <Select 
            label={language === 'ar' ? 'التصنيف الأب (اختياري)' : 'Parent Category (Optional)'}
            options={parentCategoryOptions}
            value={formParentId}
            onChange={(e) => setFormParentId(e.target.value)}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={Boolean(deleteId)}
        title={language === 'ar' ? 'حذف التصنيف' : 'Delete Category'}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
