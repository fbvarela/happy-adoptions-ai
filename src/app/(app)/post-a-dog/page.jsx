'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { resizeImage } from '@/lib/resizeImage';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';

const BREEDS = [
  'Mixed / Unknown', 'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund', 'Boxer',
  'Siberian Husky', 'Chihuahua', 'Pit Bull / Staffy', 'Border Collie',
  'Cocker Spaniel', 'Shih Tzu', 'Yorkshire Terrier', 'Doberman',
  'Schnauzer', 'Dalmatian', 'Jack Russell Terrier', 'Pomeranian',
  'Great Dane', 'Maltese', 'French Bulldog', 'Corgi', 'Other',
];

const TEMPERAMENT_ENTRIES = [
  { key: 'goodWithKids', icon: '👶' },
  { key: 'goodWithDogs', icon: '🐕' },
  { key: 'goodWithCats', icon: '🐈' },
  { key: 'isCalm', icon: '😌' },
  { key: 'isPlayful', icon: '🎾' },
  { key: 'isTrained', icon: '🎓' },
  { key: 'tendsToEscape', icon: '🏃' },
  { key: 'isFearful', icon: '😨' },
];

export default function PostADogPage() {
  const { user, loading } = useAuth();
  const { showToast } = useApp();
  const router = useRouter();
  const t = useTranslations('postDog');
  const tc = useTranslations('common');
  const tt = useTranslations('temperament');
  const ta = useTranslations('assess');

  const [form, setForm] = useState({
    name: '', breed: '', sex: '', ageApprox: '', weight: '', color: '',
    description: '', location: '', contactEmail: '', contactPhone: '',
    origin: '', temperament: {}, photos: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(f => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const resized = await resizeImage(reader.result, 800, 0.8);
        resolve(resized);
      };
      reader.readAsDataURL(f);
    }))).then(dataUrls => {
      setForm(prev => ({ ...prev, photos: [...prev.photos, ...dataUrls].slice(0, 6) }));
    });
  };

  const removePhoto = (i) => setForm(prev => ({
    ...prev, photos: prev.photos.filter((_, idx) => idx !== i),
  }));

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleTemp = (key) => setForm(prev => ({
    ...prev,
    temperament: { ...prev.temperament, [key]: !prev.temperament[key] },
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sex || !form.contactEmail) {
      showToast(t('validationRequired'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/dog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ageApprox: form.ageApprox || null, origin: form.origin || null }),
      });
      if (!res.ok) throw new Error('Failed to post');
      const dog = await res.json();
      showToast(t('postSuccess'));
      router.push(`/dogs/${dog.id}`);
    } catch {
      showToast(t('postFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔑</div>
        <h2 style={{ color: 'var(--bark)', marginBottom: 12 }}>{t('signInRequired')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t('signInDescription')}</p>
        <Link href="/login" className="btn btn-primary">{tc('signIn')} →</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 className="page-title">{t('pageTitle')}</h1>
        <p className="page-sub">{t('pageDescription')}</p>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">{t('basicInfo')}</div>
            <div className="grid2">
              <div className="field">
                <label className="input-label">{t('nameRequired')}</label>
                <input className="input" type="text" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="field">
                <label className="input-label">{t('breedApprox')}</label>
                <select className="input" value={form.breed} onChange={e => set('breed', e.target.value)}>
                  <option value="">{tc('selectBreed')}</option>
                  {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="grid2">
              <div className="field">
                <label className="input-label">{t('sexRequired')}</label>
                <select className="input" value={form.sex} onChange={e => set('sex', e.target.value)} required>
                  <option value="">{tc('select')}</option>
                  <option value="male">{ta('sexMale')}</option>
                  <option value="female">{ta('sexFemale')}</option>
                </select>
              </div>
              <div className="field">
                <label className="input-label">{ta('ageApprox')}</label>
                <select className="input" value={form.ageApprox} onChange={e => set('ageApprox', e.target.value)}>
                  <option value="">{tc('select')}</option>
                  <option value="puppy">{ta('puppyUnder1')}</option>
                  <option value="1">{ta('year1')}</option>
                  <option value="2">{ta('year2')}</option>
                  <option value="3">{ta('year3')}</option>
                  <option value="4">{ta('year4')}</option>
                  <option value="5">{ta('year5')}</option>
                  <option value="6">{ta('year6')}</option>
                  <option value="7">{ta('year7')}</option>
                  <option value="8">{ta('year8')}</option>
                  <option value="9">{ta('year9')}</option>
                  <option value="10+">{ta('year10plus')}</option>
                </select>
              </div>
            </div>
            <div className="grid2">
              <div className="field">
                <label className="input-label">{ta('weightKg')}</label>
                <input className="input" type="number" min="0" step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} />
              </div>
              <div className="field">
                <label className="input-label">{t('colorLabel')}</label>
                <input className="input" type="text" placeholder={t('colorPlaceholder')} value={form.color} onChange={e => set('color', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label className="input-label">{ta('origin')}</label>
              <select className="input" value={form.origin} onChange={e => set('origin', e.target.value)}>
                <option value="">{tc('select')}</option>
                <option value="street">{ta('originStreet')}</option>
                <option value="shelter">{ta('originShelter')}</option>
                <option value="previous_owner">{ta('originPreviousOwner')}</option>
              </select>
            </div>
            <div className="field">
              <label className="input-label">{t('descriptionLabel')}</label>
              <textarea className="input" rows={4} placeholder={t('descriptionPlaceholder')} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">{t('photos')}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
              {t('photosDescription')}
            </p>
            {form.photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {form.photos.map((src, i) => (
                  <div key={i} style={{ position: 'relative', paddingTop: '75%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--line)' }}>
                    <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        background: 'rgba(0,0,0,0.55)', color: '#fff',
                        border: 'none', borderRadius: '50%', width: 22, height: 22,
                        cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1,
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            {form.photos.length < 6 && (
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} tabIndex={-1}>
                  {t('addPhotos')}
                </div>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />
              </label>
            )}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">{t('temperament')}</div>
            <div className="grid2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TEMPERAMENT_ENTRIES.map(({ key, icon }) => (
                <label key={key} className="checkbox-card">
                  <input type="checkbox" checked={!!form.temperament[key]} onChange={() => toggleTemp(key)} />
                  <div className="card-content">{icon} {tt(key)}</div>
                </label>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">{t('contactLocation')}</div>
            <div className="field">
              <label className="input-label">{t('yourLocation')}</label>
              <input className="input" type="text" placeholder={t('locationPlaceholder')} value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div className="field">
              <label className="input-label">{t('contactEmail')}</label>
              <input className="input" type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} required />
            </div>
            <div className="field">
              <label className="input-label">{t('contactPhone')}</label>
              <input className="input" type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-leaf" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {submitting ? t('posting') : `${t('postDog')} →`}
          </button>
        </form>
      </div>
    </div>
  );
}
