import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ListOrdered,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  BookOpen,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { readingListsApi, materialsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';

export default function ReadingListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  // 1. Fetch reading list detail
  const { data: listData, isLoading, isError, refetch } = useQuery({
    queryKey: ['reading-lists', id],
    queryFn: () => readingListsApi.getById(id),
  });

  const list = listData?.list;
  const items = (listData?.items || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // 2. Fetch available materials for selection
  const { data: allMaterialsData } = useQuery({
    queryKey: ['materials', 'all_for_lists'],
    queryFn: () => materialsApi.getAll({ page: 1, size: 50, status: 'published' }),
  });

  const allMaterials = allMaterialsData?.items || [];

  // 3. Add Item Mutation
  const addItemMutation = useMutation({
    mutationFn: (data) => readingListsApi.addItem(id, data),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['reading-lists', id] });
      setSelectedMaterialId('');
      setItemNotes('');
      setAddItemModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  // 4. Remove Item Mutation
  const removeItemMutation = useMutation({
    mutationFn: (itemId) => readingListsApi.removeItem(id, itemId),
    onSuccess: () => {
      toast.info(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['reading-lists', id] });
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  // 5. Reorder Mutation
  const reorderMutation = useMutation({
    mutationFn: (newOrders) => readingListsApi.reorder(id, newOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-lists', id] });
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      item_id: item.id,
      order: idx + 1,
    }));

    reorderMutation.mutate(payload);
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!selectedMaterialId) return;

    addItemMutation.mutate({
      material_id: selectedMaterialId,
      display_order: items.length + 1,
      notes: itemNotes.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Skeleton height="2rem" width="50%" />
          <Skeleton height="1rem" width="70%" style={{ marginTop: 'var(--space-2)' }} />
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !list) {
    return (
      <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', padding: 'var(--space-16) var(--space-4)' }}>
        <EmptyState
          icon={<AlertCircle size={36} color="var(--color-error)" />}
          title="Reading List Not Found"
          description="The requested reading list does not exist."
          actionText={t('common.back')}
          onAction={() => navigate('/reading-lists')}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Breadcrumb
          items={[
            { label: t('nav.home'), href: '/' },
            { label: t('member.readingListsTitle'), href: '/reading-lists' },
            { label: list.title },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBlock: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }} dir="auto">
              {list.title}
            </h1>
            {list.description && (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-2) 0 0', maxWidth: '70ch' }} dir="auto">
                {list.description}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            iconLeft={<Plus size={18} />}
            onClick={() => setAddItemModalOpen(true)}
          >
            {t('common.add')}
          </Button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ListOrdered size={36} />}
            title="List is Empty"
            description="Add books, papers, or articles to this reading list."
            actionText={t('common.add')}
            onAction={() => setAddItemModalOpen(true)}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {items.map((item, index) => {
              const matchedMat = allMaterials.find((m) => m.id === item.material_id);
              const title = matchedMat?.title || `Material #${item.material_id?.slice(0, 8)}`;
              const slug = matchedMat?.slug || item.material_id;

              return (
                <Card key={item.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)', width: '24px' }}>
                        #{index + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', margin: 0, color: 'var(--color-primary)' }} dir="auto">
                          <Link to={`/materials/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {title}
                          </Link>
                        </h4>
                        {item.notes && (
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0' }}>
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {/* Move Up / Down */}
                      <button
                        type="button"
                        disabled={index === 0 || reorderMutation.isPending}
                        onClick={() => handleMove(index, -1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', color: 'var(--color-text-secondary)' }}
                        aria-label="Move item up"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        type="button"
                        disabled={index === items.length - 1 || reorderMutation.isPending}
                        onClick={() => handleMove(index, 1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', color: 'var(--color-text-secondary)' }}
                        aria-label="Move item down"
                      >
                        <ArrowDown size={16} />
                      </button>

                      <Link to={`/read/${item.material_id}`} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="outline" iconLeft={<BookOpen size={14} />}>
                          {t('material.readNow')}
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        loading={removeItemMutation.isPending && removeItemMutation.variables === item.id}
                        aria-label={t('common.remove')}
                      >
                        <Trash2 size={16} color="var(--color-error)" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Item to List Modal */}
      <Modal
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        title="Add Material to Reading List"
        maxWidth="500px"
      >
        <form onSubmit={handleAddItemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
              Select Scholarly Material
            </label>
            <Select
              options={allMaterials.map((m) => ({ value: m.id, label: m.title }))}
              placeholder="Choose a material..."
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
            />
          </div>

          <Input
            textarea
            rows={2}
            label="Reading Notes or Assignment (Optional)"
            value={itemNotes}
            onChange={(e) => setItemNotes(e.target.value)}
            placeholder="e.g. Read chapters 1-3 for week 2 seminar"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button type="button" variant="outline" onClick={() => setAddItemModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={addItemMutation.isPending} disabled={!selectedMaterialId}>
              {t('common.add')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
