import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileEdit, CheckCircle2 } from 'lucide-react';
import { suggestionsApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Button from '../../components/common/Button/Button.jsx';

export default function SuggestCorrectionModal({ isOpen, onClose, material }) {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [suggestionType, setSuggestionType] = useState('metadata');
  const [fieldName, setFieldName] = useState('title');
  const [proposedValue, setProposedValue] = useState('');
  const [reason, setReason] = useState('');

  const typeOptions = [
    { value: 'metadata', label: t('suggestions.metadata') },
    { value: 'typo', label: t('suggestions.typo') },
    { value: 'attribution', label: t('suggestions.attribution') },
    { value: 'license', label: t('suggestions.license') },
    { value: 'other', label: t('suggestions.other') },
  ];

  const fieldOptions = [
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'isbn', label: 'ISBN' },
    { value: 'doi', label: 'DOI' },
    { value: 'page_count', label: 'Page Count' },
    { value: 'publication_date', label: 'Publication Date' },
    { value: 'license_type', label: 'License Type' },
    { value: 'other', label: 'Other' },
  ];

  const getCurrentFieldValue = () => {
    if (!material) return '';
    return material[fieldName] ? String(material[fieldName]) : '';
  };

  const mutation = useMutation({
    mutationFn: (data) => suggestionsApi.submit(material.id, data),
    onSuccess: () => {
      toast.success(t('suggestions.submittedSuccess'));
      queryClient.invalidateQueries({ queryKey: ['suggestions', 'me'] });
      setProposedValue('');
      setReason('');
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!proposedValue.trim()) return;

    mutation.mutate({
      suggestion_type: suggestionType,
      field_name: fieldName,
      current_value: getCurrentFieldValue(),
      proposed_value: proposedValue.trim(),
      reason: reason.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('suggestions.modalTitle')}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          {t('suggestions.modalDesc')}
        </p>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
            {t('suggestions.type')}
          </label>
          <Select
            options={typeOptions}
            value={suggestionType}
            onChange={(e) => setSuggestionType(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
            {t('suggestions.fieldName')}
          </label>
          <Select
            options={fieldOptions}
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
        </div>

        <Input
          label={t('suggestions.currentValue')}
          value={getCurrentFieldValue()}
          disabled
          readOnly
        />

        <Input
          label={t('suggestions.proposedValue')}
          value={proposedValue}
          onChange={(e) => setProposedValue(e.target.value)}
          placeholder="Enter the proposed correction..."
          required
        />

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
            {t('suggestions.reason')}
          </label>
          <Input
            textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Cite academic sources or provide context..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={mutation.isPending}>
            {t('suggestions.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
