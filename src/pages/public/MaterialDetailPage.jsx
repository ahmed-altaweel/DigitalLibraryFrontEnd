import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  BookmarkPlus,
  BookmarkCheck,
  Download,
  AlertTriangle,
  Eye,
  FileText,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Share2,
  FileCode,
  ListOrdered
} from 'lucide-react';
import { materialsApi, libraryApi, assetsApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import CoverPlaceholder from '../../components/common/CoverPlaceholder/CoverPlaceholder.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import MaterialCard from '../../components/catalog/MaterialCard/MaterialCard.jsx';
import SuggestCorrectionModal from '../../features/suggestions/SuggestCorrectionModal.jsx';
import CitationModal from '../../features/citations/CitationModal.jsx';
import AddToReadingListModal from '../../features/library/AddToReadingListModal.jsx';
import styles from './MaterialDetailPage.module.css';

export default function MaterialDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, language } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [citationModalOpen, setCitationModalOpen] = useState(false);
  const [readingListModalOpen, setReadingListModalOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: material?.title,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(language === 'ar' ? 'تم نسخ الرابط إلى الحافظة' : 'Link copied to clipboard');
      } catch {
        toast.error(language === 'ar' ? 'تعذر نسخ الرابط' : 'Failed to copy link');
      }
    }
  };

  // 1. Fetch Material Detail
  const {
    data: material,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['material', slug],
    queryFn: () => materialsApi.getByIdOrSlug(slug),
  });

  // 2. Fetch User Library to check if saved
  const { data: libraryData } = useQuery({
    queryKey: ['library', 'me'],
    queryFn: () => libraryApi.getLibrary({ page: 1, size: 100 }),
    enabled: isAuthenticated && !!material?.id,
  });

  const isSavedInLibrary = (libraryData?.items || []).some(
    (item) => item.material_id === material?.id
  );

  // 3. Fetch Material Assets (for PDF reader and download)
  const { data: assets } = useQuery({
    queryKey: ['material', 'assets', material?.id],
    queryFn: () => assetsApi.getForMaterial(material.id),
    enabled: !!material?.id,
  });

  const primaryAsset = (assets || []).find((a) => a.is_primary) || (assets || [])[0];

  // 4. Fetch Related Materials
  const { data: relatedMaterials } = useQuery({
    queryKey: ['materials', 'related', material?.id],
    queryFn: () => materialsApi.getRelated(material.id),
    enabled: !!material?.id,
  });

  // 5. Add / Remove Library Mutation
  const libraryMutation = useMutation({
    mutationFn: async () => {
      if (isSavedInLibrary) {
        return libraryApi.remove(material.id);
      } else {
        return libraryApi.add(material.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'me'] });
      if (isSavedInLibrary) {
        toast.info(t('material.removeFromLibrary'));
      } else {
        toast.success(t('material.inLibrary'));
      }
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const handleLibraryToggle = () => {
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    libraryMutation.mutate();
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(num || 0);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <Skeleton height="2rem" width="60%" />
            <Skeleton height="1.5rem" width="40%" style={{ marginTop: 'var(--space-3)' }} />
            <Skeleton height="150px" style={{ marginTop: 'var(--space-6)' }} />
          </div>
          <aside className={styles.sidebar}>
            <Skeleton height="320px" />
          </aside>
        </div>
      </div>
    );
  }

  if (isError || !material) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon={<AlertTriangle size={40} color="var(--color-error)" />}
          title="Material Not Found"
          description="The requested scholarly resource could not be found or has not been published yet."
          actionText={t('nav.catalog')}
          onAction={() => navigate('/catalog')}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.catalog'), href: '/catalog' },
          { label: material.title },
        ]}
      />

      <div className={styles.layout}>
        {/* Main Content Column */}
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.badges}>
              <Badge variant="accent" size="md">
                {t(`catalog.${material.content_type?.toLowerCase()}`) || material.content_type}
              </Badge>
              {material.language && (
                <Badge variant="default" size="md">
                  {material.language.toUpperCase()}
                </Badge>
              )}
              {material.license_type && (
                <Badge variant="info" size="md">
                  {material.license_type}
                </Badge>
              )}
            </div>

            <h1 className={styles.title} dir="auto">
              {material.title}
            </h1>
          </div>

          {/* Description */}
          {material.description && (
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{t('catalog.subtitle')}</h2>
              <div className={styles.description} dir="auto">
                {material.description}
              </div>
            </section>
          )}

          {/* Bibliographic Metadata Table */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>{t('common.details')}</h2>
            <div className={styles.metadataGrid}>
              {material.publication_date && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('material.publicationDate')}</span>
                  <span className={styles.metaValue}>{material.publication_date}</span>
                </div>
              )}
              {material.isbn && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('material.isbn')}</span>
                  <span className={styles.metaValue}>{material.isbn}</span>
                </div>
              )}
              {material.doi && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('material.doi')}</span>
                  <span className={styles.metaValue}>{material.doi}</span>
                </div>
              )}
              {material.page_count && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('material.pages')}</span>
                  <span className={styles.metaValue}>{formatNumber(material.page_count)}</span>
                </div>
              )}
              {material.license_notes && (
                <div className={styles.metaItem} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.metaLabel}>{t('material.licenseNotes')}</span>
                  <span className={styles.metaValue}>{material.license_notes}</span>
                </div>
              )}
            </div>
          </section>

          {/* Related Materials Section */}
          {relatedMaterials && relatedMaterials.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{t('material.relatedMaterials')}</h2>
              <div className={styles.relatedGrid}>
                {relatedMaterials.slice(0, 3).map((item) => (
                  <MaterialCard key={item.id} material={item} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Actions Column */}
        <aside className={styles.sidebar}>
          <div className={styles.coverWrapper}>
            {material.cover_image_url ? (
              <img
                src={material.cover_image_url}
                alt={material.title}
                className={styles.coverImg}
              />
            ) : (
              <CoverPlaceholder
                title={material.title}
                contentType={material.content_type}
                height={280}
              />
            )}
          </div>

          <div className={styles.actions}>
            {/* Read Button */}
            <Button
              fullWidth
              variant="primary"
              size="lg"
              iconLeft={<BookOpen size={20} />}
              onClick={() => navigate(`/read/${material.id}`)}
            >
              {t('material.readNow')}
            </Button>

            {/* Download Primary Asset Button (if backend permits) */}
            {primaryAsset && (
              <a
                href={assetsApi.getDownloadUrl(primaryAsset.id)}
                download={primaryAsset.original_filename}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  fullWidth
                  variant="outline"
                  size="md"
                  iconLeft={<Download size={18} />}
                >
                  {t('material.downloadPdf')}
                </Button>
              </a>
            )}

            {/* External URL if provided */}
            {material.external_url && (
              <a
                href={material.external_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  fullWidth
                  variant="ghost"
                  size="md"
                  iconLeft={<ExternalLink size={18} />}
                >
                  {t('material.externalResource')}
                </Button>
              </a>
            )}

            {/* Save to Personal Library */}
            <Button
              fullWidth
              variant={isSavedInLibrary ? 'secondary' : 'outline'}
              size="md"
              iconLeft={isSavedInLibrary ? <BookmarkCheck size={18} /> : <BookmarkPlus size={18} />}
              onClick={handleLibraryToggle}
              loading={libraryMutation.isPending}
            >
              {isSavedInLibrary ? t('material.inLibrary') : t('material.addToLibrary')}
            </Button>

            {/* Add to Reading List */}
            {isAuthenticated && (
              <Button
                fullWidth
                variant="outline"
                size="md"
                iconLeft={<ListOrdered size={18} />}
                onClick={() => setReadingListModalOpen(true)}
              >
                {language === 'ar' ? 'إضافة إلى قائمة قراءة' : 'Add to Reading List'}
              </Button>
            )}

            {/* Academic Citation Generator */}
            <Button
              fullWidth
              variant="outline"
              size="md"
              iconLeft={<FileCode size={18} />}
              onClick={() => setCitationModalOpen(true)}
            >
              {language === 'ar' ? 'توليد الاستشهاد الأكاديمي' : 'Cite Resource'}
            </Button>

            {/* Share Link */}
            <Button
              fullWidth
              variant="ghost"
              size="sm"
              iconLeft={<Share2 size={16} />}
              onClick={handleShare}
            >
              {language === 'ar' ? 'مشاركة المادة' : 'Share Resource'}
            </Button>

            {/* Suggest Correction Flow */}
            {isAuthenticated && (
              <Button
                fullWidth
                variant="ghost"
                size="sm"
                iconLeft={<AlertTriangle size={16} />}
                onClick={() => setSuggestModalOpen(true)}
              >
                {t('material.suggestCorrection')}
              </Button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className={styles.statsCard}>
            <div className={styles.statItem}>
              <Eye size={18} className={styles.statIcon} />
              <span>{formatNumber(material.view_count)} {t('material.views')}</span>
            </div>
            {material.download_count > 0 && (
              <div className={styles.statItem}>
                <Download size={18} className={styles.statIcon} />
                <span>{formatNumber(material.download_count)} {t('material.downloads')}</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Suggestion Modal */}
      <SuggestCorrectionModal
        isOpen={suggestModalOpen}
        onClose={() => setSuggestModalOpen(false)}
        material={material}
      />

      {/* Citation Generator Modal */}
      <CitationModal
        isOpen={citationModalOpen}
        onClose={() => setCitationModalOpen(false)}
        material={material}
      />

      {/* Add To Reading List Modal */}
      <AddToReadingListModal
        isOpen={readingListModalOpen}
        onClose={() => setReadingListModalOpen(false)}
        materialId={material.id}
      />
    </div>
  );
}
