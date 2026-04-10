'use client';

import { useState, useRef } from 'react';
import { resizeImage } from '@/lib/resizeImage';
import { useTranslations } from '@/i18n/useTranslations';

export function PreferencesStep({ data, onNext, onBack, firstName }) {
  const [form, setForm] = useState(data?.preferences || {});
  const [photo, setPhoto] = useState(data?.referencePhoto || null);
  const fileRef = useRef(null);
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const t = useTranslations('quiz.preferences');
  const tc = useTranslations('common');

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
      <h3>{t('title')}</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>{t('subtitle')}</p>

      <div className="field">
        <label className="input-label">{t('preferredSize')}</label>
        <select className="input" value={form.size || ''} onChange={e => set('size', e.target.value)}>
          <option value="">{tc('noPreference')}</option>
          <option value="small">{t('small')}</option>
          <option value="medium">{t('medium')}</option>
          <option value="large">{t('large')}</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">{t('preferredAge')}</label>
        <select className="input" value={form.age || ''} onChange={e => set('age', e.target.value)}>
          <option value="">{tc('noPreference')}</option>
          <option value="puppy">{t('puppy')}</option>
          <option value="young">{t('young')}</option>
          <option value="adult">{t('adult')}</option>
          <option value="senior">{t('senior')}</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">{t('energyLevel')}</label>
        <select className="input" value={form.energyLevel || ''} onChange={e => set('energyLevel', e.target.value)}>
          <option value="">{tc('noPreference')}</option>
          <option value="low">{t('lowEnergy')}</option>
          <option value="medium">{t('mediumEnergy')}</option>
          <option value="high">{t('highEnergy')}</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label className="checkbox-card">
          <input type="checkbox" checked={!!form.mustBeGoodWithKids} onChange={e => set('mustBeGoodWithKids', e.target.checked)} />
          <div className="card-content">{t('goodWithKids')}</div>
        </label>
        <label className="checkbox-card">
          <input type="checkbox" checked={!!form.mustBeGoodWithDogs} onChange={e => set('mustBeGoodWithDogs', e.target.checked)} />
          <div className="card-content">{t('goodWithDogs')}</div>
        </label>
        <label className="checkbox-card">
          <input type="checkbox" checked={!!form.mustBeGoodWithCats} onChange={e => set('mustBeGoodWithCats', e.target.checked)} />
          <div className="card-content">{t('goodWithCats')}</div>
        </label>
        <label className="checkbox-card">
          <input type="checkbox" checked={!!form.mustBeTrained} onChange={e => set('mustBeTrained', e.target.checked)} />
          <div className="card-content">{t('mustBeTrained')}</div>
        </label>
      </div>

      {/* Optional reference photo */}
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <label className="input-label">{t('referencePhoto')}</label>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 10 }}>
          {t('referencePhotoDesc')}
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
            <div className="btn btn-ghost btn-sm" tabIndex={-1}>📷 {t('uploadPhoto')}</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </label>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>{tc('back')}</button>
        <button className="btn btn-leaf" onClick={() => onNext({ preferences: form, referencePhoto: photo || null })}>
          {firstName ? `${t('findMatchesName', { name: firstName })} →` : `${t('findMatches')} →`}
        </button>
      </div>
    </div>
  );
}
