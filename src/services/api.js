const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(message, status = 500, data = null, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
  }
}

// Single-flight lock mutex for silent refresh
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(error) {
  refreshSubscribers.forEach((cb) => cb(error));
  refreshSubscribers = [];
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function normalizeError(status, errorData) {
  let message = 'An unexpected error occurred';
  const fieldErrors = {};

  if (!errorData) {
    return new ApiError(message, status);
  }

  if (typeof errorData === 'string') {
    return new ApiError(errorData, status);
  }

  // Check for FastAPI validation error array (status 422)
  if (Array.isArray(errorData.detail)) {
    message = 'Please correct the highlighted fields';
    errorData.detail.forEach((err) => {
      const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'general';
      fieldErrors[field] = err.msg || 'Invalid field';
    });
  } else if (typeof errorData.detail === 'string') {
    message = errorData.detail;
  } else if (errorData.message) {
    message = errorData.message;
  }

  return new ApiError(message, status, errorData, fieldErrors);
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    ...(options.headers || {}),
  };

  // Add Content-Type unless body is FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach CSRF header if token cookie exists
  const csrfToken = getCookie('csrf_token');
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const config = {
    credentials: 'include', // Always send and receive HTTP-only cookies
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized with silent refresh
    if (response.status === 401) {
      const isAuthRoute = endpoint.includes('/auth/login') ||
                          endpoint.includes('/auth/register') ||
                          endpoint.includes('/auth/refresh') ||
                          endpoint.includes('/auth/forgot-password') ||
                          endpoint.includes('/auth/reset-password');

      if (!isAuthRoute) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });

            if (!refreshRes.ok) {
              throw new Error('Refresh failed');
            }

            isRefreshing = false;
            onRefreshed(null); // Notify queued requests
          } catch (refreshErr) {
            isRefreshing = false;
            onRefreshed(refreshErr);

            // Redirect to login preserving return URL
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
              window.location.href = `/login?returnUrl=${currentPath}`;
            }
            throw new ApiError('Session expired. Please sign in again.', 401);
          }
        }

        // Wait for token refresh to finish then retry
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((err) => {
            if (err) {
              reject(new ApiError('Session expired', 401));
            } else {
              resolve(request(endpoint, options));
            }
          });
        });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw normalizeError(response.status, errorData);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network connection error', 0);
  }
}

function buildQuery(params) {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

// ============================================================================
// API Service Modules
// ============================================================================

export const authApi = {
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/auth/me/change-password', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
};

export const materialsApi = {
  getAll: (params = {}) => request(`/materials/${buildQuery(params)}`),
  getByIdOrSlug: (idOrSlug) => request(`/materials/${idOrSlug}`),
  create: (data) => request('/materials/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/materials/${id}`, { method: 'DELETE' }),
  publish: (id) => request(`/materials/${id}/publish`, { method: 'POST' }),
  unpublish: (id) => request(`/materials/${id}/unpublish`, { method: 'POST' }),
  archive: (id) => request(`/materials/${id}/archive`, { method: 'POST' }),
  getRelated: (id) => request(`/materials/${id}/related`),
};

export const assetsApi = {
  getForMaterial: (materialId) => request(`/materials/${materialId}/assets`),
  upload: (materialId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/materials/${materialId}/assets`, { method: 'POST', body: formData });
  },
  getDownloadUrl: (assetId) => `${API_BASE}/assets/${assetId}/download`,
  delete: (assetId) => request(`/assets/${assetId}`, { method: 'DELETE' }),
};

export const authorsApi = {
  getAll: () => request('/authors/'),
  create: (data) => request('/authors/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/authors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/authors/${id}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  getAll: () => request('/categories/'),
  create: (data) => request('/categories/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
};

export const tagsApi = {
  getAll: () => request('/tags/'),
  create: (data) => request('/tags/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/tags/${id}`, { method: 'DELETE' }),
};

export const libraryApi = {
  getLibrary: (params = {}) => request(`/me/library${buildQuery(params)}`),
  add: (materialId) => request('/me/library', { method: 'POST', body: JSON.stringify({ material_id: materialId }) }),
  remove: (materialId) => request(`/me/library/${materialId}`, { method: 'DELETE' }),
};

export const readingListsApi = {
  getAll: () => request('/me/reading-lists'),
  getById: (id) => request(`/me/reading-lists/${id}`),
  create: (data) => request('/me/reading-lists', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/me/reading-lists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/me/reading-lists/${id}`, { method: 'DELETE' }),
  addItem: (id, data) => request(`/me/reading-lists/${id}/items`, { method: 'POST', body: JSON.stringify(data) }),
  removeItem: (listId, itemId) => request(`/me/reading-lists/${listId}/items/${itemId}`, { method: 'DELETE' }),
  reorder: (id, items) => request(`/me/reading-lists/${id}/reorder`, { method: 'PUT', body: JSON.stringify({ items }) }),
};

export const readingProgressApi = {
  getAll: () => request('/me/reading-progress'),
  getForMaterial: (materialId) => request(`/me/reading-progress/${materialId}`),
  update: (materialId, data) => request(`/me/reading-progress/${materialId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const bookmarksApi = {
  getAll: () => request('/me/bookmarks'),
  getForMaterial: (materialId) => request(`/me/bookmarks/material/${materialId}`),
  create: (data) => request('/me/bookmarks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/me/bookmarks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/me/bookmarks/${id}`, { method: 'DELETE' }),
};

export const userTagsApi = {
  getAll: () => request('/me/tags'),
  add: (data) => request('/me/tags', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id) => request(`/me/tags/${id}`, { method: 'DELETE' }),
};

export const notesApi = {
  getAll: () => request('/me/notes'),
  getForMaterial: (materialId) => request(`/me/notes/material/${materialId}`),
  create: (data) => request('/me/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/me/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/me/notes/${id}`, { method: 'DELETE' }),
};

export const suggestionsApi = {
  submit: (materialId, data) => request(`/materials/${materialId}/suggestions`, { method: 'POST', body: JSON.stringify(data) }),
  getMySubmissions: (params = {}) => request(`/me/suggestions${buildQuery(params)}`),
  withdraw: (id) => request(`/me/suggestions/${id}/withdraw`, { method: 'PUT' }),
};

export const adminApi = {
  getStats: () => request('/admin/stats'),
  getUsers: (params = {}) => request(`/admin/users${buildQuery(params)}`),
  updateUserRoles: (userId, roles) => request(`/admin/users/${userId}/roles`, { method: 'PUT', body: JSON.stringify({ roles }) }),
  deactivateUser: (userId) => request(`/admin/users/${userId}/deactivate`, { method: 'PUT' }),
  getPendingSuggestions: (params = {}) => request(`/admin/suggestions${buildQuery(params)}`),
  reviewSuggestion: (id, action, notes) => request(`/admin/suggestions/${id}/review`, { method: 'PUT', body: JSON.stringify({ action, notes }) }),
  getAuditLogs: (params = {}) => request(`/admin/audit-logs${buildQuery(params)}`),
};
