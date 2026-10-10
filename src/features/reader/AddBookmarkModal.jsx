import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Check } from 'lucide-react';
import { bookmarksApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Button from '../../components/common/Button/Button.jsx';

const BOOKMARK_COLORS = ['#B58900', '#1A2F4C', '#2D6A4F', '#B91C1C', '#6B21A8'];

export default function AddBookmarkModal({ isOpen, onClose, materialId, pageNumber }) {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [color, setColor] = useState(BOOKMARK_COLORS[0]);

  const mutation = useMutation({
    mutationFn: (data) => bookmarksApi.create(data),
    onSuccess: () => {
      toast.success(t('reader.bookmarkSaved', { page: pageNumber }));
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'material', materialId] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'me'] });
      setTitle('');
      setNote('');
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      material_id: materialId,
      page_number: pageNumber,
      title: title.trim() || `Bookmark on Page ${pageNumber}`,
      note: note.trim() || undefined,
      color,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('reader.addBookmark')} — ${t('common.page')} ${pageNumber}`}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Page ${pageNumber} Highlight`}
        />

        <Input
          textarea
          rows={3}
          label="Scholarly Annotation / Note (Optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add an excerpt or note to remember..."
        />

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
            Color Accent
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {BOOKMARK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '2px solid var(--color-border-focus)' : '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                }}
              >
                {color === c && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={mutation.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
