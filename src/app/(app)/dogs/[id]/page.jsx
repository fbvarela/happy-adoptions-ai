'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useTranslations } from '@/i18n/useTranslations';

export default function DogProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useApp();
  const t = useTranslations('dogDetail');
  const tt = useTranslations('temperament');
  const tc = useTranslations('common');

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
      showToast(t('addedToFavorites'));
    } catch {
      showToast(t('failedToSave'), 'error');
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

  const temp = dog.temperament || {};

  return (
    <div className="page">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: 20 }}>
          ← {t('back')}
        </button>

        {/* Header */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <div className="dog-avatar" style={{ width: 80, height: 80, fontSize: '2.5rem' }}>🐕</div>
            <div style={{ flex: 1 }}>
              <div className="dog-name" style={{ fontSize: '1.6rem' }}>{dog.name}</div>
              <div className="dog-meta" style={{ marginTop: 4 }}>
                {dog.breed || tc('mixed')} · {dog.sex} · {dog.age_months ? `${Math.floor(dog.age_months / 12)}y ${dog.age_months % 12}m` : tc('unknown')}
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
            {temp.goodWithKids && <span className="badge badge-leaf">👶 {tt('goodWithKids')}</span>}
            {temp.goodWithDogs && <span className="badge badge-leaf">🐕 {tt('goodWithDogs')}</span>}
            {temp.goodWithCats && <span className="badge badge-leaf">🐈 {tt('goodWithCats')}</span>}
            {temp.isCalm      && <span className="badge badge-sun">😌 {tt('calm')}</span>}
            {temp.isPlayful   && <span className="badge badge-sun">🎾 {tt('playful')}</span>}
            {dog.special_needs && <span className="badge badge-clay">💛 {tt('specialNeeds')}</span>}
          </div>
        </div>

        {/* Description */}
        {dog.description && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">{t('about', { name: dog.name })}</div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{dog.description}</p>
          </div>
        )}

        {/* Contact */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">{t('contact')}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
            {t('interestedIn', { name: dog.name })}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {dog.contact_email && (
              <a href={`mailto:${dog.contact_email}?subject=Interested in adopting ${dog.name}`} className="btn btn-leaf">
                ✉️ {t('emailOwner')}
              </a>
            )}
            {dog.contact_phone && (
              <a href={`tel:${dog.contact_phone}`} className="btn btn-ghost">
                📞 {t('call')}
              </a>
            )}
            <button className="btn btn-ghost" onClick={handleFavorite} disabled={favorited}>
              {favorited ? `❤️ ${tc('saved')}` : `🤍 ${tc('save')}`}
            </button>
          </div>
        </div>

        {/* CTA if not matched yet */}
        <div className="card" style={{ background: 'var(--cream)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: '0.9rem' }}>
            {t('notSure', { name: dog.name })}
          </p>
          <Link href="/quiz" className="btn btn-primary">{t('takeQuiz')} →</Link>
        </div>
      </div>
    </div>
  );
}
