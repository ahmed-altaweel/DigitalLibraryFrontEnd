import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('library_theme');
    if (saved && ['light', 'dark', 'sepia'].includes(saved)) {
      return saved;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('library_theme', theme);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (['light', 'dark', 'sepia'].includes(newTheme)) {
      setThemeState(newTheme);
    }
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    isDark: theme === 'dark',
    isSepia: theme === 'sepia',
    isLight: theme === 'light',
  }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
