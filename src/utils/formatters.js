/**
 * Format a date string into a readable format
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(d);
}

/**
 * Format a date with time
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Format file size in human-readable format
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (!bytes) return '';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  
  return `${size} ${units[i]}`;
}

/**
 * Truncate text to a maximum length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Generate a URL-safe slug from text
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get initials from a name
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get a display label for a content type
 * @param {string} type
 * @returns {string}
 */
export function getContentTypeLabel(type) {
  const labels = {
    book: 'Book',
    article: 'Article',
    paper: 'Paper',
    tutorial: 'Tutorial',
    notes: 'Notes',
    reference: 'Reference',
  };
  return labels[type] || type;
}

/**
 * Get a color for a content type
 * @param {string} type
 * @returns {string}
 */
export function getContentTypeColor(type) {
  const colors = {
    book: '#1a56db',
    article: '#059669',
    paper: '#7c3aed',
    tutorial: '#d97706',
    notes: '#dc2626',
    reference: '#6b7280',
  };
  return colors[type] || '#6b7280';
}

/**
 * Get gradient background for content type (used as cover placeholder)
 * @param {string} type
 * @returns {string}
 */
export function getContentTypeGradient(type) {
  const gradients = {
    book: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    article: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    paper: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    tutorial: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    notes: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    reference: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  };
  return gradients[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

/**
 * Get status badge variant
 * @param {string} status
 * @returns {string}
 */
export function getStatusVariant(status) {
  const variants = {
    published: 'success',
    draft: 'warning',
    archived: 'default',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    withdrawn: 'default',
    in_progress: 'info',
    completed: 'success',
    not_started: 'default',
    abandoned: 'error',
  };
  return variants[status] || 'default';
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a status string for display
 * @param {string} status
 * @returns {string}
 */
export function formatStatus(status) {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
