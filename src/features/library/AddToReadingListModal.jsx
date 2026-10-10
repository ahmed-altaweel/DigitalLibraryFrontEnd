import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, ListOrdered } from 'lucide-react';
import Modal from '../../components/common/Modal/Modal.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Spinner from '../../components/common/Spinner/Spinner.jsx';
import { readingListsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import styles from './AddToReadingListModal.module.css';

export default function AddToReadingListModal({ isOpen, onClose, materialId }) {
  const { t, language } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all reading lists for the current user
  const { data: readingLists = [], isLoading } = useQuery({
    queryKey: ['reading-lists', 'me'],
    queryFn: () => readingListsApi.getAll(),
    enabled: isOpen,
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: (title) => readingListsApi.create({ title, is_public: false }),
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ['reading-lists', 'me'] });
      setNewTitle('');
      setIsCreating(false);
      // Automatically add item to the new list
      addItemMutation.mutate({ listId: newList.id, materialId });
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  // Add item to list mutation
  const addItemMutation = useMutation({
    mutationFn: ({ listId, materialId }) =>
      readingListsApi.addItem(listId, { material_id: materialId }),
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تمت إضافة المادة إلى قائمة القراءة بنجاح' : 'Added to reading list successfully');
      queryClient.invalidateQueries({ queryKey: ['reading-lists', 'me'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createListMutation.mutate(newTitle.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ar' ? 'إضافة إلى قائمة قراءة' : 'Add to Reading List'}
      maxWidth="500px"
    >
      <div className={styles.container}>
        {/* Quick create inline form */}
        <form onSubmit={handleCreateSubmit} className={styles.createRow}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder={language === 'ar' ? 'اسم قائمة قراءة جديدة...' : 'New list title...'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="md"
            loading={createListMutation.isPending}
            disabled={!newTitle.trim()}
            iconLeft={<Plus size={16} />}
          >
            {language === 'ar' ? 'إنشاء' : 'Create'}
          </Button>
        </form>

        {/* Existing lists */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
            <Spinner size="md" />
          </div>
        ) : readingLists.length === 0 ? (
          <div className={styles.emptyState}>
            <ListOrdered size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.5 }} />
            <p>{language === 'ar' ? 'ليس لديك قوائم قراءة بعد. أنشئ قائمتك الأولى أعلاه.' : 'No reading lists yet. Create your first list above.'}</p>
          </div>
        ) : (
          <div className={styles.list}>
            {readingLists.map((list) => (
              <div key={list.id} className={styles.item}>
                <div className={styles.itemDetails}>
                  <span className={styles.itemTitle}>{list.title}</span>
                  {list.description && (
                    <span className={styles.itemSubtitle}>{list.description}</span>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addItemMutation.mutate({ listId: list.id, materialId })}
                  loading={addItemMutation.isPending}
                  iconLeft={<Plus size={14} />}
                >
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
