'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');
  const hasError = searchParams.get('error') === 'true';
  const t = useTranslations('results');
  const tc = useTranslations('common');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasError) { setLoading(false); return; }
    if (!sessionId || sessionId === 'undefined') { router.push('/quiz'); return; }

    const saved = sessionStorage.getItem('adoptionsResult');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.sessionId === sessionId) { setResult(data); setLoading(false); return; }
      } catch {}
    }

    fetch(`/api/match/${sessionId}`)
      .then(r => r.json())
      .then(data => { setResult(data.result || data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId, hasError, router]);

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
      </div>
    );
  }

  if (hasError || !result) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
        <h2 style={{ color: 'var(--bark)', marginBottom: 12 }}>{t('somethingWrong')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t('couldntGenerate')}</p>
        <Link href="/quiz" className="btn btn-primary">{t('retakeQuiz')}</Link>
      </div>
    );
  }

  const exportActions = (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
      <button className="btn btn-primary" onClick={() => window.print()}>{tc('printSavePdf')}</button>
      <Link href="/quiz" className="btn btn-ghost">← {t('retakeQuiz')}</Link>
    </div>
  );

  // Ideal mode (no real dogs — returns idealProfile)
  if (result.idealProfile) {
    const { idealProfile } = result;
    return (
      <div className="page">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎯</div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--bark)', marginBottom: 8 }}>{t('idealDogProfile')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{idealProfile.summary}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {idealProfile.recommendations?.map((rec, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: i === 0 ? 'var(--leaf)' : 'var(--sun)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', fontWeight: 700, flexShrink: 0,
                  }}>#{i + 1}</div>
                  <div>
                    <div className="dog-name">{rec.type}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <div className="match-bar-track">
                        <div className={`match-bar-fill ${rec.matchPercentage >= 80 ? 'high' : 'medium'}`}
                          style={{ width: `${rec.matchPercentage}%` }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: rec.matchPercentage >= 80 ? 'var(--leaf)' : 'var(--sun)', minWidth: 40 }}>
                        {rec.matchPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
                {rec.reasons?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {rec.reasons.map((r, j) => (
                      <span key={j} className="badge badge-leaf" style={{ fontSize: '0.75rem' }}>✓ {r}</span>
                    ))}
                  </div>
                )}
                {rec.considerations?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {rec.considerations.map((c, j) => (
                      <span key={j} className="badge badge-sun" style={{ fontSize: '0.75rem' }}>ℹ {c}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {idealProfile.tips?.length > 0 && (
            <div className="card" style={{ background: 'var(--cream)' }}>
              <h3 style={{ color: 'var(--bark)', marginBottom: 12 }}>{t('shelterVisitTips')}</h3>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {idealProfile.tips.map((tip, i) => (
                  <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {exportActions}
        </div>
      </div>
    );
  }

  // Real dog matches
  const matches = result.matches || [];

  return (
    <div className="page">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--bark)', marginBottom: 8 }}>
            {matches.length === 1 ? t('matchesFound', { count: 1 }) : t('matchesFoundPlural', { count: matches.length })}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>{t('rankedByCompatibility')}</p>
        </div>

        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t('noDogsMatched')}</p>
            <Link href="/shelters" className="btn btn-primary">{t('browseShelters')}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {matches.map((match, i) => (
              <Link key={match.dogId} href={`/dogs/${match.dogId}`} className="dog-card" style={{ border: i === 0 ? '2px solid var(--leaf)' : undefined, textDecoration: 'none' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: i === 0 ? 'var(--leaf)' : 'var(--sun)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', fontWeight: 700, flexShrink: 0,
                  }}>#{i + 1}</div>
                  {match.photo ? (
                    <img src={match.photo} alt={match.name} style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div className="dog-avatar" style={{ width: 56, height: 56, fontSize: '1.8rem' }}>🐕</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dog-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.name || tc('unknown')}</div>
                    <div className="dog-meta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.breed || tc('mixed')} · {match.sex}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <div className="match-bar-track">
                        <div className={`match-bar-fill ${match.matchPercentage >= 80 ? 'high' : 'medium'}`}
                          style={{ width: `${match.matchPercentage}%` }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: match.matchPercentage >= 80 ? 'var(--leaf)' : 'var(--sun)', minWidth: 40 }}>
                        {match.matchPercentage}%
                      </span>
                    </div>
                    {match.summary && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>{match.summary}</p>
                    )}
                    {match.reasons?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {match.reasons.slice(0, 3).map((r, j) => (
                          <span key={j} className="badge badge-leaf" style={{ fontSize: '0.7rem' }}>✓ {r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Photo-based visual matches */}
        {result.photoMatches?.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--bark)', marginBottom: 4 }}>{t('visuallySimilar')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('basedOnPhoto')}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {result.photoMatches.map((pm) => (
                <Link key={pm.dogId} href={`/dogs/${pm.dogId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {pm.photo ? (
                      <img src={pm.photo} alt={pm.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: 140, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🐕</div>
                    )}
                    <div style={{ padding: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ color: 'var(--bark)', fontSize: '0.9rem' }}>{pm.name}</strong>
                        <span className="badge badge-leaf" style={{ fontSize: '0.7rem' }}>{pm.similarity}%</span>
                      </div>
                      {pm.breed && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{pm.breed}</p>}
                      {pm.matchedTraits?.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                          {pm.matchedTraits.slice(0, 2).map((tt, i) => (
                            <span key={i} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--cream)', padding: '2px 5px', borderRadius: 3 }}>{tt}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {exportActions}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense><ResultsContent /></Suspense>;
}
