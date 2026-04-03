'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shelters')
      .then(r => r.json())
      .then(setShelters)
      .catch(() => setShelters([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Shelters</h1>
      <p className="page-sub">Shelters connected to Happy Adoptions. Start the quiz linked to a specific shelter to match against their dogs.</p>

      {loading ? (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }} />
        </div>
      ) : shelters.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, background: 'var(--cream)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏡</div>
          <h3 style={{ color: 'var(--bark)', marginBottom: 8 }}>No shelters connected yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Shelters register through Happy Shelter AI. You can still use the quiz to get matched with independent listings.
          </p>
          <Link href="/quiz" className="btn btn-primary">Start the quiz →</Link>
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
                  <span className="badge">{shelter.dog_count} dogs available</span>
                )}
                <Link href={`/quiz?shelter=${shelter.id}`} className="btn btn-primary btn-sm">
                  Find my match →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
