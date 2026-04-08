'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { resizeImage } from '@/lib/resizeImage';
import Link from 'next/link';

export default function PostADogPage() {
  const { user, loading } = useAuth();
  const { showToast } = useApp();
  const router = useRouter();

  const BREEDS = [
    'Mixed / Unknown', 'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
    'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund', 'Boxer',
    'Siberian Husky', 'Chihuahua', 'Pit Bull / Staffy', 'Border Collie',
    'Cocker Spaniel', 'Shih Tzu', 'Yorkshire Terrier', 'Doberman',
    'Schnauzer', 'Dalmatian', 'Jack Russell Terrier', 'Pomeranian',
    'Great Dane', 'Maltese', 'French Bulldog', 'Corgi', 'Other',
  ];

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
      showToast('Name, sex, and contact email are required', 'error');
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
      showToast('Dog posted successfully!');
      router.push(`/dogs/${dog.id}`);
    } catch {
      showToast('Failed to post. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔑</div>
        <h2 style={{ color: 'var(--bark)', marginBottom: 12 }}>Sign in to post a dog</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>You need an account to list a dog for adoption.</p>
        <Link href="/login" className="btn btn-primary">Sign in →</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 className="page-title">Post a dog for adoption</h1>
        <p className="page-sub">List your dog independently — no shelter required.</p>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Basic info</div>
            <div className="grid2">
              <div className="field">
                <label className="input-label">Name *</label>
                <input className="input" type="text" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="field">
                <label className="input-label">Breed (approx)</label>
                <select className="input" value={form.breed} onChange={e => set('breed', e.target.value)}>
                  <option value="">Select breed...</option>
                  {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="grid2">
              <div className="field">
                <label className="input-label">Sex *</label>
                <select className="input" value={form.sex} onChange={e => set('sex', e.target.value)} required>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="field">
                <label className="input-label">Age (approx)</label>
                <select className="input" value={form.ageApprox} onChange={e => set('ageApprox', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="puppy">Puppy (under 1 year)</option>
                  <option value="1">~1 year</option>
                  <option value="2">~2 years</option>
                  <option value="3">~3 years</option>
                  <option value="4">~4 years</option>
                  <option value="5">~5 years</option>
                  <option value="6">~6 years</option>
                  <option value="7">~7 years</option>
                  <option value="8">~8 years</option>
                  <option value="9">~9 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>
            <div className="grid2">
              <div className="field">
                <label className="input-label">Weight (kg)</label>
                <input className="input" type="number" min="0" step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} />
              </div>
              <div className="field">
                <label className="input-label">Color</label>
                <input className="input" type="text" placeholder="e.g. golden, black & white" value={form.color} onChange={e => set('color', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label className="input-label">Origin</label>
              <select className="input" value={form.origin} onChange={e => set('origin', e.target.value)}>
                <option value="">Select...</option>
                <option value="street">Street / stray</option>
                <option value="shelter">Shelter</option>
                <option value="previous_owner">Previous owner</option>
              </select>
            </div>
            <div className="field">
              <label className="input-label">Description</label>
              <textarea className="input" rows={4} placeholder="Tell adopters about this dog's personality, history, and needs..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Photos</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
              Add up to 6 photos. Clear photos increase adoption chances significantly.
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
                  + Add photos
                </div>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />
              </label>
            )}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Temperament</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'goodWithKids', label: '👶 Good with kids' },
                { key: 'goodWithDogs', label: '🐕 Good with other dogs' },
                { key: 'goodWithCats', label: '🐈 Good with cats' },
                { key: 'isCalm',       label: '😌 Calm / low energy' },
                { key: 'isPlayful',    label: '🎾 Playful / high energy' },
                { key: 'isTrained',    label: '🎓 Already trained' },
                { key: 'tendsToEscape', label: '🏃 Tendency to escape' },
                { key: 'isFearful',    label: '😨 Fearful' },
              ].map(({ key, label }) => (
                <label key={key} className="checkbox-card">
                  <input type="checkbox" checked={!!form.temperament[key]} onChange={() => toggleTemp(key)} />
                  <div className="card-content">{label}</div>
                </label>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Contact & location</div>
            <div className="field">
              <label className="input-label">Your location</label>
              <input className="input" type="text" placeholder="City, Country" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div className="field">
              <label className="input-label">Contact email *</label>
              <input className="input" type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} required />
            </div>
            <div className="field">
              <label className="input-label">Contact phone (optional)</label>
              <input className="input" type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-leaf" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {submitting ? 'Posting...' : 'Post dog for adoption →'}
          </button>
        </form>
      </div>
    </div>
  );
}
