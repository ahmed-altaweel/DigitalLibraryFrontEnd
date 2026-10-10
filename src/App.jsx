import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout/Layout.jsx';
import AdminLayout from './components/layout/AdminLayout/AdminLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute/ProtectedRoute.jsx';

import HomePage from './pages/public/HomePage.jsx';
import CatalogPage from './pages/public/CatalogPage.jsx';
import SearchResultsPage from './pages/public/SearchResultsPage.jsx';
import CategoryPage from './pages/public/CategoryPage.jsx';
import AuthorPage from './pages/public/AuthorPage.jsx';
import MaterialDetailPage from './pages/public/MaterialDetailPage.jsx';
import ReaderPage from './pages/public/ReaderPage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

import DashboardPage from './pages/member/DashboardPage.jsx';
import LibraryPage from './pages/member/LibraryPage.jsx';
import ReadingListsPage from './pages/member/ReadingListsPage.jsx';
import ReadingListDetailPage from './pages/member/ReadingListDetailPage.jsx';
import BookmarksPage from './pages/member/BookmarksPage.jsx';
import ReadingProgressPage from './pages/member/ReadingProgressPage.jsx';
import UserTagsPage from './pages/member/UserTagsPage.jsx';
import UserNotesPage from './pages/member/UserNotesPage.jsx';
import ContributionsPage from './pages/member/ContributionsPage.jsx';
import SettingsPage from './pages/member/SettingsPage.jsx';

import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminMaterialsPage from './pages/admin/AdminMaterialsPage.jsx';
import AdminMaterialCreatePage from './pages/admin/AdminMaterialCreatePage.jsx';
import AdminMaterialEditPage from './pages/admin/AdminMaterialEditPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminAuthorsPage from './pages/admin/AdminAuthorsPage.jsx';
import AdminTagsPage from './pages/admin/AdminTagsPage.jsx';
import AdminSuggestionsPage from './pages/admin/AdminSuggestionsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="categories/:slug" element={<CategoryPage />} />
        <Route path="authors/:slug" element={<AuthorPage />} />
        <Route path="materials/:slug" element={<MaterialDetailPage />} />
        <Route path="read/:id" element={<ReaderPage />} />
        
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
        <Route path="reading-lists" element={<ProtectedRoute><ReadingListsPage /></ProtectedRoute>} />
        <Route path="reading-lists/:id" element={<ProtectedRoute><ReadingListDetailPage /></ProtectedRoute>} />
        <Route path="bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
        <Route path="progress" element={<ProtectedRoute><ReadingProgressPage /></ProtectedRoute>} />
        <Route path="my-tags" element={<ProtectedRoute><UserTagsPage /></ProtectedRoute>} />
        <Route path="my-notes" element={<ProtectedRoute><UserNotesPage /></ProtectedRoute>} />
        <Route path="contributions" element={<ProtectedRoute><ContributionsPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['editor', 'admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="materials" element={<AdminMaterialsPage />} />
        <Route path="materials/new" element={<AdminMaterialCreatePage />} />
        <Route path="materials/:id/edit" element={<AdminMaterialEditPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="authors" element={<AdminAuthorsPage />} />
        <Route path="tags" element={<AdminTagsPage />} />
        <Route path="suggestions" element={<AdminSuggestionsPage />} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute roles={['admin']}><AdminAuditLogsPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
