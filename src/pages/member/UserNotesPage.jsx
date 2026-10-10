import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StickyNote, Plus, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { notesApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function UserNotesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [content, setContent] = useState('');

  // 1. Fetch user notes
  const { data: notes, isLoading: isNotesLoading, isError, refetch } = useQuery({
    queryKey: ['notes', 'me'],
    queryFn: () => notesApi.getAll(),
  });

  // 2. Fetch materials for note assignment
  const { data: materialsData, isLoading: isMatsLoading } = useQuery({
    queryKey: ['materials', 'all_for_notes'],
    queryFn: () => materialsApi.getAll({ page: 1, size: 50, status: 'published' }),
  });

  const materials = materialsData?.items || [];
  const isLoading = isNotesLoading || isMatsLoading;

  // 3. Create Note Mutation
  const createMutation = useMutation({
    mutationFn: (data) => notesApi.create(data),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['notes', 'me'] });
      setContent('');
      setPageNumber('');
      setSelectedMaterialId('');
      setCreateModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  // 4. Delete Note Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => notesApi.delete(id),
    onSuccess: () => {
      toast.info(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['notes', 'me'] });
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedMaterialId) return;

    createMutation.mutate({
      material_id: selectedMaterialId,
      content: content.trim(),
      page_number: pageNumber ? parseInt(pageNumber, 10) : undefined,
    });
  };

  const items = notes || [];

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }}>
              {t('member.notesTitle')}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
              Your scholarly thoughts, critical marginalia, and research excerpts.
            </p>
          </div>
          <Button
            variant="primary"
            iconLeft={<Plus size={18} />}
            onClick={() => setCreateModalOpen(true)}
          >
            {t('common.add')}
          </Button>
        </div>

        {isError && (
          <EmptyState
            icon={<AlertCircle size={36} color="var(--color-error)" />}
            title={t('common.error')}
            description="Failed to load personal notes."
            actionText={t('common.retry')}
            onAction={refetch}
          />
        )}

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <Skeleton height="1.25rem" width="50%" />
                <Skeleton height="3rem" style={{ marginTop: 'var(--space-3)' }} />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon={<StickyNote size={40} />}
            title="No Scholarly Notes Yet"
            description="Record annotations and thoughts as you examine documents in the library."
            actionText={t('common.add')}
            onAction={() => setCreateModalOpen(true)}
          />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {items.map((note) => {
              const matchedMat = materials.find((m) => m.id === note.material_id);
              const materialTitle = matchedMat?.title || `Material #${note.material_id?.slice(0, 8)}`;

              return (
                <Card key={note.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', margin: 0, color: 'var(--color-primary)' }} dir="auto">
                          {materialTitle}
                        </h4>
                        {note.page_number && (
                          <span style={{ fontSize: 'var(--text-xs)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'var(--font-semibold)' }}>
                            P. {note.page_number}
                          </span>
                        )}
                      </div>

                      <p style={{ color: 'var(--color-text)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', margin: 0, whiteSpace: 'pre-wrap' }} dir="auto">
                        {note.content}
                      </p>

                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0' }}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(note.id)}
                      loading={deleteMutation.isPending && deleteMutation.variables === note.id}
                      aria-label={t('common.delete')}
                    >
                      <Trash2 size={16} color="var(--color-error)" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Scholarly Note"
        maxWidth="520px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
              Select Scholarly Material
            </label>
            <Select
              options={materials.map((m) => ({ value: m.id, label: m.title }))}
              placeholder="Choose a material..."
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
            />
          </div>

          <Input
            label="Page Number (Optional)"
            type="number"
            min="1"
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            placeholder="e.g. 42"
          />

          <Input
            textarea
            rows={4}
            label="Note Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your observation or transcription..."
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending} disabled={!selectedMaterialId || !content.trim()}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
