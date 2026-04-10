'use client';

import { useCallback } from 'react';
import { useLocale } from '@/context/LocaleContext';
import en from '@/messages/en.json';
import esES from '@/messages/es-ES.json';

const messages = { 'en': en, 'es-ES': esES };

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * Client-side translation hook. Usage:
 *   const t = useTranslations('quiz');
 *   t('title') → looks up messages[locale].quiz.title
 *   t('greeting', { name: 'Luna' }) → replaces {name} with 'Luna'
 */
export function useTranslations(namespace) {
  const { locale } = useLocale();

  const t = useCallback((key, params) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const msg = messages[locale] || messages['en'];
    let value = getNestedValue(msg, fullKey);

    // Fallback to English
    if (value === undefined) {
      value = getNestedValue(messages['en'], fullKey);
    }

    // Still nothing — return key
    if (value === undefined) return fullKey;

    // Interpolate params
    if (params && typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    }

    return value;
  }, [locale, namespace]);

  return t;
}
