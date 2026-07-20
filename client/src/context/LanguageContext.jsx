import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('locgovt_lang') || 'en';
  });

  const setLocale = useCallback((newLocale) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem('locgovt_lang', newLocale);
    }
  }, []);

  /**
   * Helper function to translate a key.
   * Supports placeholder replacement, e.g. t('dashWelcomeUser', { username: 'john' })
   */
  const t = useCallback((key, params = {}) => {
    const localeDict = translations[locale] || translations.en;
    let text = localeDict[key] || translations.en[key] || key;

    // Replace placeholders like {{username}}
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
    });

    return text;
  }, [locale]);

  const value = {
    locale,
    setLocale,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

export default LanguageContext;
