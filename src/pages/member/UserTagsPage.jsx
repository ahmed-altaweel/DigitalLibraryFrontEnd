import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag as TagIcon, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { userTagsApi, materialsApi } from '../../services/api.js';
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

export default function UserTagsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [tagName, setTagName] = useState('');

  // 1. Fetch user tags
  const { data: tags, isLoading: isTagsLoading, isError, refetch } = useQuery({
    queryKey: ['user-tags', 'me'],
    queryFn: () => userTagsApi.getAll(),
  });

  // 2. Fetch materials for assigning tags
  const { data: materialsData, isLoading: isMatsLoading } = useQuery({
    queryKey: ['materials', 'all_for_tags'],
    queryFn: () => materialsApi.getAll({ page: 1, size: 50, status: 'published' }),
  });

  const materials = materialsData?.items || [];
  const isLoading = isTagsLoading || isMatsLoading;

  // 3. Add Tag Mutation
  const addMutation = useMutation({
    mutationFn: (data) => userTagsApi.add(data),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['user-tags', 'me'] });
      setTagName('');
      setSelectedMaterialId('');
      setAddModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  // 4. Remove Tag Mutation
  const removeMutation = useMutation({
    mutationFn: (id) => userTagsApi.remove(id),
    onSuccess: () => {
      toast.info(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['user-tags', 'me'] });
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!tagName.trim() || !selectedMaterialId) return;

    addMutation.mutate({
      material_id: selectedMaterialId,
      tag_name: tagName.trim().toLowerCase(),
    });
  };

  const items = tags || [];

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }}>
              {t('member.tagsTitle')}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
              Organize your research materials with custom classification tags.
            </p>
          </div>
          <Button
            variant="primary"
            iconLeft={<Plus size={18} />}
            onClick={() => setAddModalOpen(true)}
          >
            {t('common.add')}
          </Button>
        </div>

        {isError && (
          <EmptyState
            icon={<AlertCircle size={36} color="var(--color-error)" />}
            title={t('common.error')}
            description="Failed to load personal tags."
            actionText={t('common.retry')}
            onAction={refetch}
          />
        )}

        {isLoading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} width="120px" height="36px" style={{ borderRadius: 'var(--radius-full)' }} />
            ))}
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon={<TagIcon size={40} />}
            title="No Personal Tags Yet"
            description="Attach custom research tags to materials in your library."
            actionText={t('common.add')}
            onAction={() => setAddModalOpen(true)}
          />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {items.map((tItem) => {
              const matchedMat = materials.find((m) => m.id === tItem.material_id);
              const materialTitle = matchedMat?.title || `Material #${tItem.material_id?.slice(0, 8)}`;

              return (
                <div
                  key={tItem.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <TagIcon size={14} color="var(--color-accent)" />
                  <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                    #{tItem.tag_name}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }} title={materialTitle}>
                    ({materialTitle.slice(0, 16)}...)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(tItem.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)' }}
                    aria-label={`Remove tag ${tItem.tag_name}`}
                  >
                    <Trash2 size={13} color="var(--color-error)" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Tag Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Personal Research Tag"
        maxWidth="460px"
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
            label="Tag Name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="e.g. epistemology, primary-source"
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={addMutation.isPending} disabled={!selectedMaterialId || !tagName.trim()}>
              {t('common.add')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
