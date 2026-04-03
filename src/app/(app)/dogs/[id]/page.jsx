'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

export default function DogProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useApp();

  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    fetch(`/api/dog-posts/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setDog)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleFavorite = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogPostId: id }),
      });
      setFavorited(true);
      showToast('Added to favorites!');
    } catch {
      showToast('Failed to save favorite', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
      </div>
    );
  }

  if (!dog) return null;

  const t = dog.temperament || {};

  return (
    <div className="page">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: 20 }}>
          ← Back
        </button>

        {/* Header */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <div className="dog-avatar" style={{ width: 80, height: 80, fontSize: '2.5rem' }}>🐕</div>
            <div style={{ flex: 1 }}>
              <div className="dog-name" style={{ fontSize: '1.6rem' }}>{dog.name}</div>
              <div className="dog-meta" style={{ marginTop: 4 }}>
                {dog.breed || 'Mixed'} · {dog.sex} · {dog.age_months ? `${Math.floor(dog.age_months / 12)}y ${dog.age_months % 12}m` : 'Age unknown'}
                {dog.weight ? ` · ${dog.weight}kg` : ''}
              </div>
              {dog.location && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  📍 {dog.location}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {t.goodWithKids && <span className="badge badge-leaf">👶 Good with kids</span>}
            {t.goodWithDogs && <span className="badge badge-leaf">🐕 Good with dogs</span>}
            {t.goodWithCats && <span className="badge badge-leaf">🐈 Good with cats</span>}
            {t.isCalm      && <span className="badge badge-sun">😌 Calm</span>}
            {t.isPlayful   && <span className="badge badge-sun">🎾 Playful</span>}
            {dog.special_needs && <span className="badge badge-clay">💛 Special needs</span>}
          </div>
        </div>

        {/* Description */}
        {dog.description && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">About {dog.name}</div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{dog.description}</p>
          </div>
        )}

        {/* Contact */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Contact</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
            Interested in {dog.name}? Reach out to the owner directly.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {dog.contact_email && (
              <a href={`mailto:${dog.contact_email}?subject=Interested in adopting ${dog.name}`} className="btn btn-leaf">
                ✉️ Email owner
              </a>
            )}
            {dog.contact_phone && (
              <a href={`tel:${dog.contact_phone}`} className="btn btn-ghost">
                📞 Call
              </a>
            )}
            <button className="btn btn-ghost" onClick={handleFavorite} disabled={favorited}>
              {favorited ? '❤️ Saved' : '🤍 Save'}
            </button>
          </div>
        </div>

        {/* CTA if not matched yet */}
        <div className="card" style={{ background: 'var(--cream)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: '0.9rem' }}>
            Not sure if {dog.name} is right for you?
          </p>
          <Link href="/quiz" className="btn btn-primary">Take the matching quiz →</Link>
        </div>
      </div>
    </div>
  );
}
