'use client';

import { useTranslations } from '@/i18n/useTranslations';

export default function OfflinePage() {
  const t = useTranslations('offline');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🐾</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', color: 'var(--bark)', marginBottom: 12 }}>{t('title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          {t('description')}
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          {t('tryAgain')}
        </button>
      </div>
    </div>
  );
}
