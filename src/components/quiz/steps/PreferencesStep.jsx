'use client';

import { useState, useRef } from 'react';
import { resizeImage } from '@/lib/resizeImage';

export function PreferencesStep({ data, onNext, onBack, firstName }) {
  const [form, setForm] = useState(data?.preferences || {});
  const [photo, setPhoto] = useState(data?.referencePhoto || null);
  const fileRef = useRef(null);
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const resized = await resizeImage(reader.result, 512, 0.7);
      setPhoto(resized);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="quiz-step">
      <h3>Dog preferences</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>Any preferences? We'll factor these in but won't limit your matches.</p>

      <div className="field">
        <label className="input-label">Preferred size</label>
        <select className="input" value={form.size || ''} onChange={e => set('size', e.target.value)}>
          <option value="">No preference</option>
          <option value="small">Small (under 10kg)</option>
          <option value="medium">Medium (10–25kg)</option>
          <option value="large">Large (25kg+)</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">Preferred age</label>
        <select className="input" value={form.age || ''} onChange={e => set('age', e.target.value)}>
          <option value="">No preference</option>
          <option value="puppy">Puppy (under 1 year)</option>
          <option value="young">Young (1–3 years)</option>
          <option value="adult">Adult (3–8 years)</option>
          <option value="senior">Senior (8+ years)</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">Energy level preference</label>
        <select className="input" value={form.energyLevel || ''} onChange={e => set('energyLevel', e.target.value)}>
          <option value="">No preference</option>
          <option value="low">Low energy / calm</option>
          <option value="medium">Medium energy</option>
          <option value="high">High energy / playful</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label className="checkbox-card">
          <input type="checkbox" checked={!!form.mustBeGoodWithKids} onChange={e => set('mustBeGoodWithKids', e.target.checked)} />
          <div className="card-content">Must be good with kids</div>
        </label>
        <label className="checkbox-card">
          <input type="checkbox" checked={!!form.mustBeGoodWithDogs} onChange={e => set('mustBeGoodWithDogs', e.target.checked)} />
          <div className="card-content">Must be good with other dogs</div>
        </label>
        <label className="checkbox-card">
          <input type="checkbox" checked={!!form.mustBeGoodWithCats} onChange={e => set('mustBeGoodWithCats', e.target.checked)} />
          <div className="card-content">Must be good with cats</div>
        </label>
        <label className="checkbox-card">
          <input type="checkbox" checked={!!form.mustBeTrained} onChange={e => set('mustBeTrained', e.target.checked)} />
          <div className="card-content">Must already be trained</div>
        </label>
      </div>

      {/* Optional reference photo */}
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <label className="input-label">Have a dog in mind? Upload a photo (optional)</label>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 10 }}>
          We&apos;ll use AI to find visually similar dogs in our listings.
        </p>
        {photo ? (
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
            <img src={photo} alt="Reference" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
            <button
              type="button"
              onClick={removePhoto}
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                border: 'none', borderRadius: '50%', width: 22, height: 22,
                cursor: 'pointer', fontSize: '0.75rem',
              }}
            >x</button>
          </div>
        ) : (
          <label style={{ display: 'block', cursor: 'pointer' }}>
            <div className="btn btn-ghost btn-sm" tabIndex={-1}>📷 Upload photo</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </label>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-leaf" onClick={() => onNext({ preferences: form, referencePhoto: photo || null })}>
          {firstName ? `Find my matches, ${firstName} →` : 'Find my matches →'}
        </button>
      </div>
    </div>
  );
}
