import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const translations = {
  en: enTranslations,
  ar: arTranslations,
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('library_lang');
    if (saved && (saved === 'ar' || saved === 'en')) {
      return saved;
    }
    // Default to Arabic as primary scholarly language
    return 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    localStorage.setItem('library_lang', language);
  }, [language, dir]);

  const setLanguage = useCallback((lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguageState(lang);
    }
  }, []);

  const t = useCallback((path, params = {}) => {
    const keys = path.split('.');
    let current = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return path; // Return raw key if missing
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    // Replace {{param}} placeholders
    return Object.entries(params).reduce((str, [paramKey, val]) => {
      return str.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(val));
    }, current);
  }, [language]);

  const value = useMemo(() => ({
    language,
    dir,
    isRTL: dir === 'rtl',
    setLanguage,
    t,
  }), [language, dir, setLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
