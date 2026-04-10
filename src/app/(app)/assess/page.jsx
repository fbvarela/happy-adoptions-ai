'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/i18n/useTranslations';
import { useLocale } from '@/context/LocaleContext';

const BREEDS = [
  'Mixed / Unknown', 'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund', 'Boxer',
  'Siberian Husky', 'Chihuahua', 'Pit Bull / Staffy', 'Border Collie',
  'Cocker Spaniel', 'Shih Tzu', 'Yorkshire Terrier', 'Doberman',
  'Schnauzer', 'Dalmatian', 'Jack Russell Terrier', 'Pomeranian',
  'Great Dane', 'Maltese', 'French Bulldog', 'Corgi', 'Other',
];

const TEMPERAMENT_KEYS = [
  'goodWithKids', 'goodWithDogs', 'goodWithCats', 'isCalm',
  'isPlayful', 'isTrained', 'isAnxious', 'needsExperience',
  'tendsToEscape', 'isFearful',
];

const TEMPERAMENT_ICONS = {
  goodWithKids: '👶', goodWithDogs: '🐕', goodWithCats: '🐈', isCalm: '😌',
  isPlayful: '🎾', isTrained: '🎓', isAnxious: '😰', needsExperience: '🏅',
  tendsToEscape: '🏃', isFearful: '😨',
};

function AssessmentResult({ result, dogName, onReset, t, tc }) {
  const { idealAdopter } = result;

  const experienceColors = { beginner: 'var(--leaf)', intermediate: 'var(--sun)', experienced: 'var(--clay)' };
  const activityColors = { low: 'var(--leaf)', medium: 'var(--sun)', high: 'var(--clay)' };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎯</div>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--bark)', marginBottom: 8 }}>
          {t('idealAdopterProfile')}{dogName ? ` ${t('forDog', { name: dogName })}` : ''}
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>{idealAdopter.summary}</p>
      </div>

      {idealAdopter.matchScore && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--cream)' }}>
          <div className="card-title">{t('atAGlance')}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {idealAdopter.matchScore.experienceRequired && (
              <span className="badge" style={{ background: experienceColors[idealAdopter.matchScore.experienceRequired], color: '#fff', fontSize: '0.8rem' }}>
                {t('experience')}: {idealAdopter.matchScore.experienceRequired}
              </span>
            )}
            {idealAdopter.matchScore.activityLevel && (
              <span className="badge" style={{ background: activityColors[idealAdopter.matchScore.activityLevel], color: '#fff', fontSize: '0.8rem' }}>
                {t('activity')}: {idealAdopter.matchScore.activityLevel}
              </span>
            )}
            {idealAdopter.matchScore.spaceRequired && (
              <span className="badge" style={{ background: 'var(--bark)', color: '#fff', fontSize: '0.8rem' }}>
                {t('space')}: {idealAdopter.matchScore.spaceRequired.replace(/-/g, ' ')}
              </span>
            )}
          </div>
        </div>
      )}

      {idealAdopter.requirements?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">{t('requirements')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {idealAdopter.requirements.map((req, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span className="badge badge-leaf" style={{ flexShrink: 0, fontSize: '0.75rem', marginTop: 2 }}>✓</span>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--bark)', fontSize: '0.9rem' }}>{req.label}</span>
                  {req.reason && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0 0' }}>{req.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {idealAdopter.dealBreakers?.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--clay-light, #f5d5c8)' }}>
          <div className="card-title" style={{ color: 'var(--clay)' }}>{t('dealBreakers')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {idealAdopter.dealBreakers.map((db, i) => (
              <span key={i} className="badge badge-clay" style={{ fontSize: '0.8rem' }}>✗ {db}</span>
            ))}
          </div>
        </div>
      )}

      {idealAdopter.screeningTips?.length > 0 && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--cream)' }}>
          <div className="card-title">{t('screeningTips')}</div>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {idealAdopter.screeningTips.map((tip, i) => (
              <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>{tc('printSavePdf')}</button>
        <button className="btn btn-ghost" onClick={onReset}>{t('assessAnother')}</button>
        <Link href="/post-a-dog" className="btn btn-ghost">{t('postThisDog')} →</Link>
      </div>
    </div>
  );
}

export default function AssessPage() {
  const { user, loading } = useAuth();
  const t = useTranslations('assess');
  const tc = useTranslations('common');
  const tt = useTranslations('temperament');
  const { locale } = useLocale();

  const [form, setForm] = useState({
    name: '', breed: '', sex: '', ageApprox: '', weight: '',
    description: '', specialNeeds: false, origin: '', temperament: {},
  });
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleTemp = (key) => setForm(prev => ({
    ...prev,
    temperament: { ...prev.temperament, [key]: !prev.temperament[key] },
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ageApprox: form.ageApprox || null,
          weight: form.weight ? parseFloat(form.weight) : null,
          origin: form.origin || null,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assessment failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔑</div>
        <h2 style={{ color: 'var(--bark)', marginBottom: 12 }}>{t('signInRequired')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          {t('signInDescription')}
        </p>
        <Link href="/login" className="btn btn-primary">{tc('signIn')} →</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 className="page-title">{t('pageTitle')}</h1>
        <p className="page-sub">{t('pageDescription')}</p>

        {result ? (
          <AssessmentResult
            result={result}
            dogName={form.name}
            onReset={() => { setResult(null); setForm({ name: '', breed: '', sex: '', ageApprox: '', weight: '', description: '', specialNeeds: false, origin: '', temperament: {} }); }}
            t={t}
            tc={tc}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">{t('basicInfo')}</div>
              <div className="grid2">
                <div className="field">
                  <label className="input-label">{t('name')}</label>
                  <input className="input" type="text" placeholder={t('namePlaceholder')} value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="field">
                  <label className="input-label">{t('breedRequired')}</label>
                  <select className="input" value={form.breed} onChange={e => set('breed', e.target.value)} required>
                    <option value="">{tc('selectBreed')}</option>
                    {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid2">
                <div className="field">
                  <label className="input-label">{t('sex')}</label>
                  <select className="input" value={form.sex} onChange={e => set('sex', e.target.value)}>
                    <option value="">{t('sexUnknown')}</option>
                    <option value="male">{t('sexMale')}</option>
                    <option value="female">{t('sexFemale')}</option>
                  </select>
                </div>
                <div className="field">
                  <label className="input-label">{t('ageApprox')}</label>
                  <select className="input" value={form.ageApprox} onChange={e => set('ageApprox', e.target.value)}>
                    <option value="">{tc('select')}</option>
                    <option value="puppy">{t('puppyUnder1')}</option>
                    <option value="1">{t('year1')}</option>
                    <option value="2">{t('year2')}</option>
                    <option value="3">{t('year3')}</option>
                    <option value="4">{t('year4')}</option>
                    <option value="5">{t('year5')}</option>
                    <option value="6">{t('year6')}</option>
                    <option value="7">{t('year7')}</option>
                    <option value="8">{t('year8')}</option>
                    <option value="9">{t('year9')}</option>
                    <option value="10+">{t('year10plus')}</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="input-label">{t('weightKg')}</label>
                <input className="input" type="number" min="0" step="0.1" placeholder={t('weightPlaceholder')} value={form.weight} onChange={e => set('weight', e.target.value)} />
              </div>
              <div className="field">
                <label className="input-label">{t('origin')}</label>
                <select className="input" value={form.origin} onChange={e => set('origin', e.target.value)}>
                  <option value="">{tc('select')}</option>
                  <option value="street">{t('originStreet')}</option>
                  <option value="shelter">{t('originShelter')}</option>
                  <option value="previous_owner">{t('originPreviousOwner')}</option>
                </select>
              </div>
              <div className="field">
                <label className="input-label">{t('descriptionHistory')}</label>
                <textarea
                  className="input" rows={4}
                  placeholder={t('descriptionPlaceholder')}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </div>
              <label className="checkbox-card">
                <input type="checkbox" checked={form.specialNeeds} onChange={e => set('specialNeeds', e.target.checked)} />
                <div className="card-content">🏥 {t('specialNeeds')}</div>
              </label>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">{t('temperament')}</div>
              <div className="grid2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                {TEMPERAMENT_KEYS.map(key => (
                  <label key={key} className="checkbox-card">
                    <input type="checkbox" checked={!!form.temperament[key]} onChange={() => toggleTemp(key)} />
                    <div className="card-content">{TEMPERAMENT_ICONS[key]} {tt(key)}</div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--clay)', marginBottom: 12, fontSize: '0.9rem' }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-sun"
              disabled={submitting}
              style={{ width: '100%', justifyContent: 'center', padding: 12 }}
            >
              {submitting ? t('generatingAssessment') : `${t('generateProfile')} →`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
