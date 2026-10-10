import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Toast from '../components/common/Toast/Toast.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', action = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({
    success: (msg, action) => addToast(msg, 'success', action),
    error: (msg, action) => addToast(msg, 'error', action),
    info: (msg, action) => addToast(msg, 'info', action),
    warning: (msg, action) => addToast(msg, 'warning', action),
    removeToast,
  }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <aside
        aria-label="Notifications"
        aria-live="polite"
        style={{
          position: 'fixed',
          insetBlockEnd: 'var(--space-6)',
          insetInlineEnd: 'var(--space-6)',
          zIndex: 'var(--z-toast)',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 'var(--space-2)',
          maxWidth: '420px',
          width: 'calc(100% - var(--space-8))',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast
              type={t.type}
              message={t.message}
              action={t.action}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
