import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowLeft,
  BookmarkPlus,
  Sun,
  Moon,
  BookMarked,
  Download,
  AlertCircle
} from 'lucide-react';
import { materialsApi, assetsApi, readingProgressApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Spinner from '../../components/common/Spinner/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState/EmptyState.jsx';
import AddBookmarkModal from '../../features/reader/AddBookmarkModal.jsx';
import styles from './ReaderPage.module.css';

export default function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isRTL } = useTranslation();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.4);
  const [rendering, setRendering] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);

  // 1. Fetch Material Info
  const { data: material, isLoading: isMaterialLoading } = useQuery({
    queryKey: ['material', id],
    queryFn: () => materialsApi.getByIdOrSlug(id),
  });

  // 2. Fetch Assets for Material
  const { data: assets } = useQuery({
    queryKey: ['material', 'assets', material?.id],
    queryFn: () => assetsApi.getForMaterial(material.id),
    enabled: !!material?.id,
  });

  const primaryAsset = (assets || []).find((a) => a.is_primary) || (assets || [])[0];

  // 3. Resume reading progress if authenticated
  useEffect(() => {
    if (!isAuthenticated || !material?.id) return;
    readingProgressApi.getForMaterial(material.id)
      .then((progress) => {
        if (progress?.current_page && progress.current_page > 1) {
          setPageNum(progress.current_page);
        }
      })
      .catch(() => {
        // No progress record yet
      });
  }, [isAuthenticated, material?.id]);

  // 4. Lazy-load PDF.js and initialize document
  useEffect(() => {
    let isCancelled = false;

    async function loadPdfDocument() {
      if (!material) return;
      setLoadingPdf(true);
      setLoadError(null);

      try {
        // Dynamically import PDF.js
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        let pdfSource = null;

        if (primaryAsset) {
          // Download real binary asset from backend with cookies
          const res = await fetch(assetsApi.getDownloadUrl(primaryAsset.id), {
            credentials: 'include',
          });
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            pdfSource = { data: arrayBuffer };
          }
        }

        // Fallback to external URL or sample if no primary asset uploaded yet
        if (!pdfSource) {
          if (material.external_url && material.external_url.endsWith('.pdf')) {
            pdfSource = material.external_url;
          } else {
            // Scholarly demonstration PDF
            pdfSource = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
          }
        }

        const loadingTask = pdfjsLib.getDocument(pdfSource);
        const loadedDoc = await loadingTask.promise;

        if (!isCancelled) {
          setPdfDoc(loadedDoc);
          setLoadingPdf(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setLoadError(err.message || 'Failed to load PDF');
          setLoadingPdf(false);
        }
      }
    }

    loadPdfDocument();

    return () => {
      isCancelled = true;
    };
  }, [material, primaryAsset]);

  // 5. Render page to Canvas
  const renderPage = useCallback((num) => {
    if (!pdfDoc || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    setRendering(true);
    pdfDoc.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = { canvasContext: ctx, viewport };
      const task = page.render(renderContext);
      renderTaskRef.current = task;

      task.promise
        .then(() => setRendering(false))
        .catch((err) => {
          if (err?.name !== 'RenderingCancelledException') {
            console.error('Page render error:', err);
          }
          setRendering(false);
        });
    });
  }, [pdfDoc, scale]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum);
    }
  }, [pdfDoc, pageNum, scale, renderPage]);

  // 6. Debounced reading progress auto-save
  const saveProgress = useCallback((newPage, totalPages) => {
    if (!isAuthenticated || !material?.id) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      readingProgressApi.update(material.id, {
        current_page: newPage,
        total_pages: totalPages,
        status: newPage >= totalPages ? 'completed' : 'in_progress',
      }).catch(() => {
        // Ignore progress save network glitch silently
      });
    }, 1500); // 1.5s debounce
  }, [isAuthenticated, material?.id]);

  const handlePageChange = (newPage) => {
    if (!pdfDoc) return;
    const clamped = Math.max(1, Math.min(newPage, pdfDoc.numPages));
    setPageNum(clamped);
    saveProgress(clamped, pdfDoc.numPages);
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(jumpPageInput, 10);
    if (!isNaN(parsed)) {
      handlePageChange(parsed);
      setJumpPageInput('');
    }
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('sepia');
    else setTheme('light');
  };

  if (isMaterialLoading || loadingPdf) {
    return (
      <div className={styles.centerScreen}>
        <Spinner size="lg" color="var(--color-primary)" />
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-serif)' }}>
          {t('reader.loadingPdf')}
        </p>
      </div>
    );
  }

  if (loadError || !pdfDoc) {
    return (
      <div className={styles.centerScreen}>
        <EmptyState
          icon={<AlertCircle size={40} color="var(--color-error)" />}
          title={t('common.error')}
          description={t('reader.pdfError')}
          actionText={t('common.back')}
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className={styles.reader} data-theme={theme}>
      {/* Distraction-Free Header Toolbar */}
      <header className={styles.toolbar}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => navigate(-1)}
            aria-label={t('reader.closeReader')}
            title={t('reader.closeReader')}
          >
            <ArrowLeft size={18} className={isRTL ? 'mirror-rtl' : ''} />
          </button>
          <span className={styles.materialTitle} dir="auto">
            {material?.title}
          </span>
        </div>

        {/* Page Navigation & Jump */}
        <div className={styles.centerNav}>
          <button
            type="button"
            className={styles.toolBtn}
            disabled={pageNum <= 1 || rendering}
            onClick={() => handlePageChange(pageNum - 1)}
            aria-label="Previous page"
          >
            <PrevIcon size={18} />
          </button>

          <form onSubmit={handleJumpSubmit} className={styles.jumpForm}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.pageInput}
              value={jumpPageInput !== '' ? jumpPageInput : pageNum}
              onFocus={() => setJumpPageInput(String(pageNum))}
              onChange={(e) => setJumpPageInput(e.target.value)}
              onBlur={() => setJumpPageInput('')}
              aria-label="Current page number"
            />
            <span className={styles.pageDivider}>/</span>
            <span className={styles.totalPages}>{pdfDoc.numPages}</span>
          </form>

          <button
            type="button"
            className={styles.toolBtn}
            disabled={pageNum >= pdfDoc.numPages || rendering}
            onClick={() => handlePageChange(pageNum + 1)}
            aria-label="Next page"
          >
            <NextIcon size={18} />
          </button>
        </div>

        {/* Actions & Utilities */}
        <div className={styles.right}>
          {/* Zoom Controls */}
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => setScale((s) => Math.max(0.8, s - 0.2))}
            aria-label={t('reader.zoomOut')}
            title={t('reader.zoomOut')}
          >
            <ZoomOut size={18} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            aria-label={t('reader.zoomIn')}
            title={t('reader.zoomIn')}
          >
            <ZoomIn size={18} />
          </button>

          {/* Theme Selector */}
          <button
            type="button"
            className={styles.toolBtn}
            onClick={cycleTheme}
            aria-label="Toggle reader theme"
            title={`Reader Theme: ${theme}`}
          >
            {theme === 'light' && <Sun size={18} />}
            {theme === 'dark' && <Moon size={18} />}
            {theme === 'sepia' && <BookMarked size={18} />}
          </button>

          {/* Bookmark Current Page */}
          {isAuthenticated && (
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.bookmarkBtn}`}
              onClick={() => setBookmarkModalOpen(true)}
              aria-label={t('reader.addBookmark')}
              title={t('reader.addBookmark')}
            >
              <BookmarkPlus size={18} />
            </button>
          )}

          {/* Fullscreen */}
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      </header>

      {/* Reader Document Canvas Area */}
      <main className={styles.canvasArea}>
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} className={styles.pdfCanvas} />
        </div>
      </main>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        isOpen={bookmarkModalOpen}
        onClose={() => setBookmarkModalOpen(false)}
        materialId={material?.id}
        pageNumber={pageNum}
      />
    </div>
  );
}
