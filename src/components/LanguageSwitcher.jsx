'use client';

import { useLocale } from '@/context/LocaleContext';

export function LanguageSwitcher() {
  const { locale, setLocale, mounted } = useLocale();

  if (!mounted) return null;

  const toggle = () => {
    setLocale(locale === 'en' ? 'es-ES' : 'en');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      style={{
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 'var(--radius-sm, 6px)',
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
