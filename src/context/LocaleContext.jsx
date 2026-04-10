'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultLocale, locales } from '@/i18n/config';

const LocaleContext = createContext({ locale: defaultLocale, setLocale: () => {} });

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('adoptions_locale');
    if (stored && locales.includes(stored)) {
      setLocaleState(stored);
    } else {
      // Detect from browser
      const browserLang = navigator.language;
      if (browserLang.startsWith('es')) {
        setLocaleState('es-ES');
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem('adoptions_locale', newLocale);
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, mounted }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
