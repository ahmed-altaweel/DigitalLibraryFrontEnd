import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Users, Search, Globe } from 'lucide-react';
import { authorsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Table from '../../components/common/Table/Table.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.jsx';
import styles from './AdminAuthorsPage.module.css';

export default function AdminAuthorsPage() {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch authors
  const { data: authors = [], isLoading, error, refetch } = useQuery({
    queryKey: ['authors'],
    queryFn: authorsApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => authorsApi.create(data),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تمت إضافة المؤلف بنجاح' : 'Author created successfully', 'success');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
    onError: (err) => {
      setFormError(err.message);
      showToast(err.message, 'error');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => authorsApi.update(id, data),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم تحديث بيانات المؤلف بنجاح' : 'Author updated successfully', 'success');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
    onError: (err) => {
      setFormError(err.message);
      showToast(err.message, 'error');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => authorsApi.delete(id),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم حذف المؤلف بنجاح' : 'Author deleted successfully', 'success');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const openCreateModal = () => {
    setEditingAuthor(null);
    setFormName('');
    setFormBio('');
    setFormWebsite('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (author) => {
    setEditingAuthor(author);
    setFormName(author.name || '');
    setFormBio(author.bio || '');
    setFormWebsite(author.website || '');
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAuthor(null);
    setFormError('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError(language === 'ar' ? 'اسم المؤلف مطلوب' : 'Author name is required');
      return;
    }

    const payload = {
      name: formName.trim(),
      bio: formBio?.trim() || null,
      website: formWebsite?.trim() || null,
    };

    if (editingAuthor) {
      updateMutation.mutate({ id: editingAuthor.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredAuthors = authors.filter((author) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return author.name?.toLowerCase().includes(q) || author.bio?.toLowerCase().includes(q);
  });

  const columns = [
    {
      key: 'name',
      label: language === 'ar' ? 'الاسم والترجمة' : 'Author / Scholar',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Users size={18} color="var(--color-primary)" />
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
      key: 'bio',
      label: language === 'ar' ? 'النبذة والترجمة' : 'Biography',
      render: (v) => v ? (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {v}
        </span>
      ) : <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
    },
    {
      key: 'website',
      label: language === 'ar' ? 'الموقع الرسمي' : 'Website',
      render: (v) => v ? (
        <a href={v} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
          <Globe size={14} />
          <span>{v.replace(/^https?:\/\//, '')}</span>
        </a>
      ) : <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
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
          <h1>{t('admin.authorsManage')}</h1>
          <p>{language === 'ar' ? 'إدارة تراجم المؤلفين والمحققين والباحثين المسجلين في الفهرس' : 'Curate academic authority records, bios, and links for scholars'}</p>
        </div>
        <Button 
          iconLeft={<Plus size={18} />} 
          onClick={openCreateModal}
        >
          {language === 'ar' ? 'إضافة مؤلف' : 'Add Author'}
        </Button>
      </header>

      <div className={styles.searchBar}>
        <Input 
          placeholder={language === 'ar' ? 'بحث في المؤلفين...' : 'Search authors...'}
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
          data={filteredAuthors} 
          loading={isLoading} 
          emptyMessage={language === 'ar' ? 'لا يوجد مؤلفون مطابقون' : 'No authors found'}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingAuthor 
          ? (language === 'ar' ? 'تعديل بيانات المؤلف' : 'Edit Author')
          : (language === 'ar' ? 'إضافة مؤلف جديد' : 'New Author')
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
            label={language === 'ar' ? 'اسم المؤلف / العلم *' : 'Scholar Name *'}
            value={formName}
            onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
            error={formError}
            placeholder="e.g. ابن حجر العسقلاني / Bertrand Russell"
            required
            autoFocus
          />

          <div className={styles.textareaWrapper}>
            <label className={styles.label}>{language === 'ar' ? 'الترجمة / النبذة العلمية' : 'Scholarly Bio'}</label>
            <textarea 
              className={styles.textarea}
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              placeholder={language === 'ar' ? 'تاريخ الميلاد والوفاة، أبرز الإسهامات العلمية...' : 'Historical dates, academic disciplines, notable works...'}
              rows={3}
            />
          </div>

          <Input 
            label={language === 'ar' ? 'الموقع الشخصي أو صفحة التوثيق' : 'Website or Academic Profile'}
            value={formWebsite}
            onChange={(e) => setFormWebsite(e.target.value)}
            placeholder="https://..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={Boolean(deleteId)}
        title={language === 'ar' ? 'حذف المؤلف' : 'Delete Author'}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
