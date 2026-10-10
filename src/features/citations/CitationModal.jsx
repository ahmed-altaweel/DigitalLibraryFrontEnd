import React, { useState } from 'react';
import { Copy, Check, Download, BookOpen } from 'lucide-react';
import Modal from '../../components/common/Modal/Modal.jsx';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import styles from './CitationModal.module.css';

export default function CitationModal({ isOpen, onClose, material }) {
  const { t, language } = useTranslation();
  const toast = useToast();
  const [selectedFormat, setSelectedFormat] = useState('apa');
  const [copied, setCopied] = useState(false);

  if (!material) return null;

  const year = material.publication_date
    ? new Date(material.publication_date).getFullYear()
    : (material.published_at ? new Date(material.published_at).getFullYear() : 'n.d.');

  const title = material.title || 'Untitled';
  const authorName = material.author_names || material.authors?.[0]?.name || 'Unknown Author';
  const url = typeof window !== 'undefined' ? window.location.href : '';

  // Generate citations
  const citations = {
    apa: `${authorName}. (${year}). ${title}.${material.doi ? ` https://doi.org/${material.doi}` : ` ${url}`}`,
    mla: `${authorName}. "${title}." Digital Library, ${year !== 'n.d.' ? year : ''}, ${url}.`,
    chicago: `${authorName}. "${title}." Digital Library. Accessed ${new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}. ${url}.`,
    harvard: `${authorName}, ${year}. ${title}. [online] Digital Library. Available at: <${url}> [Accessed ${new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}].`,
    bibtex: `@article{${(material.slug || 'item').replace(/[^a-zA-Z0-9]/g, '_')}_${year},
  title = {${title}},
  author = {${authorName}},
  year = {${year !== 'n.d.' ? year : new Date().getFullYear()}},
  url = {${url}}${material.doi ? `,\n  doi = {${material.doi}}` : ''}${material.isbn ? `,\n  isbn = {${material.isbn}}` : ''}
}`,
  };

  const currentCitation = citations[selectedFormat] || citations.apa;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCitation);
      setCopied(true);
      toast.success(language === 'ar' ? 'تم نسخ الاستشهاد بنجاح' : 'Citation copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(language === 'ar' ? 'تعذر النسخ' : 'Failed to copy');
    }
  };

  const handleDownloadBib = () => {
    const element = document.createElement('a');
    const file = new Blob([citations.bibtex], { type: 'application/x-bibtex' });
    element.href = URL.createObjectURL(file);
    element.download = `${material.slug || 'citation'}.bib`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(language === 'ar' ? 'تم تنزيل ملف BibTeX' : 'BibTeX file downloaded');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ar' ? 'توليد الاستشهاد الأكاديمي' : 'Cite Resource'}
      maxWidth="620px"
    >
      <div className={styles.container}>
        <div className={styles.formatTabs} role="tablist">
          {[
            { id: 'apa', label: 'APA 7th' },
            { id: 'mla', label: 'MLA 9th' },
            { id: 'chicago', label: 'Chicago 17th' },
            { id: 'harvard', label: 'Harvard' },
            { id: 'bibtex', label: 'BibTeX' },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selectedFormat === tab.id}
              className={`${styles.tabBtn} ${selectedFormat === tab.id ? styles.tabActive : ''}`}
              onClick={() => setSelectedFormat(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={`${styles.citationBox} ${selectedFormat === 'bibtex' ? styles.monoBox : ''}`}
          dir="ltr"
        >
          {currentCitation}
        </div>

        <div className={styles.actionsRow}>
          {selectedFormat === 'bibtex' && (
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Download size={16} />}
              onClick={handleDownloadBib}
            >
              {language === 'ar' ? 'تنزيل .bib' : 'Export .bib'}
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            iconLeft={copied ? <Check size={16} /> : <Copy size={16} />}
            onClick={handleCopy}
          >
            {copied
              ? (language === 'ar' ? 'تم النسخ!' : 'Copied!')
              : (language === 'ar' ? 'نسخ الاستشهاد' : 'Copy Citation')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
