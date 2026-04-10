'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';

export default function SheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('shelters');

  useEffect(() => {
    fetch('/api/shelters')
      .then(r => r.json())
      .then(setShelters)
      .catch(() => setShelters([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">{t('pageTitle')}</h1>
      <p className="page-sub">{t('pageDescription')}</p>

      {loading ? (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }} />
        </div>
      ) : shelters.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, background: 'var(--cream)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏡</div>
          <h3 style={{ color: 'var(--bark)', marginBottom: 8 }}>{t('noShelters')}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            {t('noSheltersDesc')}
          </p>
          <Link href="/quiz" className="btn btn-primary">{t('startQuiz')} →</Link>
        </div>
      ) : (
        <div className="grid2" style={{ gap: 20 }}>
          {shelters.map(shelter => (
            <div key={shelter.id} className="card">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'var(--cream)', border: '2px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', flexShrink: 0,
                }}>
                  {shelter.logo_url ? <img src={shelter.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : '🏡'}
                </div>
                <div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--bark)', fontSize: '1.1rem' }}>
                    {shelter.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    📍 {shelter.city}{shelter.country ? `, ${shelter.country}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                {shelter.dog_count > 0 && (
                  <span className="badge">{t('dogsAvailable', { count: shelter.dog_count })}</span>
                )}
                <Link href={`/quiz?shelter=${shelter.id}`} className="btn btn-primary btn-sm">
                  {t('findMyMatch')} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
