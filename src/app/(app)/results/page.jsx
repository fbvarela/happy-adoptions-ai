'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');
  const hasError = searchParams.get('error') === 'true';

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasError) { setLoading(false); return; }
    if (!sessionId) { router.push('/quiz'); return; }

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
        <h2 style={{ color: 'var(--bark)', marginBottom: 12 }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>We couldn&apos;t generate your matches. Try again.</p>
        <Link href="/quiz" className="btn btn-primary">Retake quiz</Link>
      </div>
    );
  }

  const exportActions = (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
      <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
      <Link href="/quiz" className="btn btn-ghost">← Retake quiz</Link>
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
            <h2 style={{ fontSize: '1.8rem', color: 'var(--bark)', marginBottom: 8 }}>Your ideal dog profile</h2>
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
              <h3 style={{ color: 'var(--bark)', marginBottom: 12 }}>Tips for your shelter visit</h3>
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
            {matches.length} match{matches.length !== 1 ? 'es' : ''} found
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Ranked by compatibility with your profile</p>
        </div>

        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No dogs matched your criteria right now.</p>
            <Link href="/shelters" className="btn btn-primary">Browse shelters</Link>
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
                  <div className="dog-avatar" style={{ width: 56, height: 56, fontSize: '1.8rem' }}>🐕</div>
                  <div style={{ flex: 1 }}>
                    <div className="dog-name">{match.name || 'Unknown'}</div>
                    <div className="dog-meta">{match.breed || 'Mixed'} · {match.sex}</div>
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

        {exportActions}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense><ResultsContent /></Suspense>;
}
