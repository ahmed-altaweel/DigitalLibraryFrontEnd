import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListOrdered, Plus, Trash2, Globe, Lock, AlertCircle } from 'lucide-react';
import { readingListsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.jsx';

export default function ReadingListsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // 1. Fetch reading lists
  const { data: lists, isLoading, isError, refetch } = useQuery({
    queryKey: ['reading-lists', 'me'],
    queryFn: () => readingListsApi.getAll(),
  });

  // 2. Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => readingListsApi.create(data),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['reading-lists', 'me'] });
      setTitle('');
      setDescription('');
      setIsPublic(false);
      setCreateModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  // 3. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => readingListsApi.delete(id),
    onSuccess: () => {
      toast.info(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['reading-lists', 'me'] });
      setDeleteTargetId(null);
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      is_public: isPublic,
    });
  };

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }}>
              {t('member.readingListsTitle')}
            </h1>
          </div>
          <Button
            variant="primary"
            iconLeft={<Plus size={18} />}
            onClick={() => setCreateModalOpen(true)}
          >
            {t('member.createList')}
          </Button>
        </div>

        {isError && (
          <EmptyState
            icon={<AlertCircle size={36} color="var(--color-error)" />}
            title={t('common.error')}
            description="Failed to load reading lists."
            actionText={t('common.retry')}
            onAction={refetch}
          />
        )}

        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton height="1.5rem" width="70%" />
                <Skeleton height="0.875rem" width="90%" style={{ marginTop: 'var(--space-2)' }} />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && (!lists || lists.length === 0) && (
          <EmptyState
            icon={<ListOrdered size={40} />}
            title={t('member.readingListsTitle')}
            description="You have not created any reading lists yet. Group materials by topic, research project, or semester."
            actionText={t('member.createList')}
            onAction={() => setCreateModalOpen(true)}
          />
        )}

        {!isLoading && !isError && lists && lists.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {lists.map((list) => (
              <Card key={list.id}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', margin: 0, color: 'var(--color-primary)' }} dir="auto">
                      <Link to={`/reading-lists/${list.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {list.title}
                      </Link>
                    </h3>
                    <span title={list.is_public ? t('member.publicList') : t('member.privateList')}>
                      {list.is_public ? <Globe size={16} color="var(--color-info)" /> : <Lock size={16} color="var(--color-text-muted)" />}
                    </span>
                  </div>

                  {list.description && (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', margin: 0, lineHeight: 'var(--leading-relaxed)' }} dir="auto">
                      {list.description}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                    <Link to={`/reading-lists/${list.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="sm">
                        {t('common.view')}
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTargetId(list.id)}
                      aria-label={t('common.delete')}
                    >
                      <Trash2 size={16} color="var(--color-error)" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('member.createList')}
        maxWidth="500px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label={t('member.listTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Classical Islamic Philosophy"
            required
            autoFocus
          />

          <Input
            textarea
            rows={3}
            label={t('member.listDescription')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional syllabus or research objectives..."
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>{t('member.publicList')}</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending}>
              {t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => deleteMutation.mutate(deleteTargetId)}
        title={t('common.confirmDelete')}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        confirmVariant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
