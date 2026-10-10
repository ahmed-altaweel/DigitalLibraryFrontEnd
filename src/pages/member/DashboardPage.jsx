import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Library,
  BookOpen,
  Clock,
  Bookmark,
  ArrowRight,
  ListOrdered,
  FileEdit,
  Play
} from 'lucide-react';
import { libraryApi, readingListsApi, readingProgressApi, bookmarksApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../i18n/index.jsx';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Card from '../../components/common/Card/Card.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Skeleton from '../../components/common/Skeleton/Skeleton.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();

  // 1. Fetch real user metrics
  const { data: libraryData, isLoading: libLoading } = useQuery({
    queryKey: ['library', 'me'],
    queryFn: () => libraryApi.getLibrary({ page: 1, size: 100 }),
  });

  const { data: readingLists, isLoading: listsLoading } = useQuery({
    queryKey: ['reading-lists', 'me'],
    queryFn: () => readingListsApi.getAll(),
  });

  const { data: progressItems, isLoading: progLoading } = useQuery({
    queryKey: ['reading-progress', 'me'],
    queryFn: () => readingProgressApi.getAll(),
  });

  const { data: bookmarksList, isLoading: bmLoading } = useQuery({
    queryKey: ['bookmarks', 'me'],
    queryFn: () => bookmarksApi.getAll(),
  });

  const libraryCount = libraryData?.items?.length || 0;
  const listsCount = readingLists?.length || 0;
  const inProgressList = (progressItems || []).filter((p) => p.status === 'in_progress' || (p.completion_percentage > 0 && p.completion_percentage < 100));
  const bookmarksCount = bookmarksList?.length || 0;

  return (
    <div style={{ maxWidth: 'var(--container-max)', marginInline: 'auto', display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', margin: 0 }} dir="auto">
            {t('nav.dashboard')} — {user?.full_name || user?.username}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
            {t('common.appTagline')}
          </p>
        </div>

        {/* Real Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-lg)' }}>
                <Library size={24} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)' }}>
                  {libLoading ? <Skeleton width="2rem" height="1.5rem" /> : libraryCount}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                  {t('nav.myLibrary')}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', borderRadius: 'var(--radius-lg)' }}>
                <ListOrdered size={24} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)' }}>
                  {listsLoading ? <Skeleton width="2rem" height="1.5rem" /> : listsCount}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                  {t('member.readingListsTitle')}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', borderRadius: 'var(--radius-lg)' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)' }}>
                  {progLoading ? <Skeleton width="2rem" height="1.5rem" /> : inProgressList.length}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                  {t('member.progressTitle')}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-lg)' }}>
                <Bookmark size={24} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)' }}>
                  {bmLoading ? <Skeleton width="2rem" height="1.5rem" /> : bookmarksCount}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                  {t('member.bookmarksTitle')}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Current Reading In-Progress Section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', color: 'var(--color-primary)', margin: 0 }}>
              {t('member.progressTitle')}
            </h2>
            <Link to="/progress" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-accent)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', textDecoration: 'none' }}>
              <span>{t('common.all')}</span>
              <ArrowRight size={14} className={isRTL ? 'mirror-rtl' : ''} />
            </Link>
          </div>

          {inProgressList.length === 0 ? (
            <Card>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                {t('member.emptyLibrary')}
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {inProgressList.slice(0, 3).map((item) => (
                <Card key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 var(--space-1)' }}>
                        Material #{item.material_id?.slice(0, 8)}
                      </h4>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', margin: 0 }}>
                        {t('common.page')} {item.current_page || 1} {item.total_pages ? `${t('common.of')} ${item.total_pages}` : ''} • {Math.round(item.completion_percentage || 0)}%
                      </p>
                    </div>

                    <Link to={`/read/${item.material_id}`} style={{ textDecoration: 'none' }}>
                      <Button size="sm" variant="primary" iconLeft={<Play size={14} />}>
                        {t('material.readNow')}
                      </Button>
                    </Link>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: 'var(--radius-full)', marginTop: 'var(--space-3)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, item.completion_percentage || 0))}%`,
                        height: '100%',
                        background: 'var(--color-accent)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
