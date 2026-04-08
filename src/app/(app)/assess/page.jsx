'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const BREEDS = [
  'Mixed / Unknown', 'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund', 'Boxer',
  'Siberian Husky', 'Chihuahua', 'Pit Bull / Staffy', 'Border Collie',
  'Cocker Spaniel', 'Shih Tzu', 'Yorkshire Terrier', 'Doberman',
  'Schnauzer', 'Dalmatian', 'Jack Russell Terrier', 'Pomeranian',
  'Great Dane', 'Maltese', 'French Bulldog', 'Corgi', 'Other',
];

const TEMPERAMENT_OPTIONS = [
  { key: 'goodWithKids',  label: '👶 Good with kids' },
  { key: 'goodWithDogs',  label: '🐕 Good with other dogs' },
  { key: 'goodWithCats',  label: '🐈 Good with cats' },
  { key: 'isCalm',        label: '😌 Calm / low energy' },
  { key: 'isPlayful',     label: '🎾 Playful / high energy' },
  { key: 'isTrained',     label: '🎓 Already trained' },
  { key: 'isAnxious',     label: '😰 Anxious / nervous' },
  { key: 'needsExperience', label: '🏅 Needs experienced owner' },
  { key: 'tendsToEscape', label: '🏃 Tendency to escape' },
  { key: 'isFearful',     label: '😨 Fearful' },
];

function AssessmentResult({ result, dogName, onReset }) {
  const { idealAdopter } = result;

  const handlePrint = () => window.print();

  const experienceColors = { beginner: 'var(--leaf)', intermediate: 'var(--sun)', experienced: 'var(--clay)' };
  const activityColors = { low: 'var(--leaf)', medium: 'var(--sun)', high: 'var(--clay)' };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎯</div>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--bark)', marginBottom: 8 }}>
          Ideal adopter profile{dogName ? ` for ${dogName}` : ''}
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>{idealAdopter.summary}</p>
      </div>

      {idealAdopter.matchScore && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--cream)' }}>
          <div className="card-title">At a glance</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {idealAdopter.matchScore.experienceRequired && (
              <span className="badge" style={{ background: experienceColors[idealAdopter.matchScore.experienceRequired], color: '#fff', fontSize: '0.8rem' }}>
                Experience: {idealAdopter.matchScore.experienceRequired}
              </span>
            )}
            {idealAdopter.matchScore.activityLevel && (
              <span className="badge" style={{ background: activityColors[idealAdopter.matchScore.activityLevel], color: '#fff', fontSize: '0.8rem' }}>
                Activity: {idealAdopter.matchScore.activityLevel}
              </span>
            )}
            {idealAdopter.matchScore.spaceRequired && (
              <span className="badge" style={{ background: 'var(--bark)', color: '#fff', fontSize: '0.8rem' }}>
                Space: {idealAdopter.matchScore.spaceRequired.replace(/-/g, ' ')}
              </span>
            )}
          </div>
        </div>
      )}

      {idealAdopter.requirements?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Requirements</div>
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
          <div className="card-title" style={{ color: 'var(--clay)' }}>Deal-breakers</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {idealAdopter.dealBreakers.map((db, i) => (
              <span key={i} className="badge badge-clay" style={{ fontSize: '0.8rem' }}>✗ {db}</span>
            ))}
          </div>
        </div>
      )}

      {idealAdopter.screeningTips?.length > 0 && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--cream)' }}>
          <div className="card-title">Screening tips for your team</div>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {idealAdopter.screeningTips.map((tip, i) => (
              <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handlePrint}>Print / Save PDF</button>
        <button className="btn btn-ghost" onClick={onReset}>Assess another dog</button>
        <Link href="/post-a-dog" className="btn btn-ghost">Post this dog →</Link>
      </div>
    </div>
  );
}

export default function AssessPage() {
  const { user, loading } = useAuth();

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
        <h2 style={{ color: 'var(--bark)', marginBottom: 12 }}>Sign in to assess dogs</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Volunteer accounts let you save assessments, post dogs, and link to your shelter.
        </p>
        <Link href="/login" className="btn btn-primary">Sign in →</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 className="page-title">AI Dog Assessment</h1>
        <p className="page-sub">
          Enter this dog&apos;s profile and our AI will generate an ideal adopter description —
          perfect for screening applicants and writing adoption listings.
        </p>

        {result ? (
          <AssessmentResult
            result={result}
            dogName={form.name}
            onReset={() => { setResult(null); setForm({ name: '', breed: '', sex: '', ageApprox: '', weight: '', description: '', specialNeeds: false, origin: '', temperament: {} }); }}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">Basic info</div>
              <div className="grid2">
                <div className="field">
                  <label className="input-label">Name</label>
                  <input className="input" type="text" placeholder="e.g. Luna" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="field">
                  <label className="input-label">Breed (approx) *</label>
                  <select className="input" value={form.breed} onChange={e => set('breed', e.target.value)} required>
                    <option value="">Select breed...</option>
                    {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid2">
                <div className="field">
                  <label className="input-label">Sex</label>
                  <select className="input" value={form.sex} onChange={e => set('sex', e.target.value)}>
                    <option value="">Unknown</option>
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
              <div className="field">
                <label className="input-label">Weight (kg)</label>
                <input className="input" type="number" min="0" step="0.1" placeholder="e.g. 15.5" value={form.weight} onChange={e => set('weight', e.target.value)} />
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
                <label className="input-label">Description / history</label>
                <textarea
                  className="input" rows={4}
                  placeholder="Describe this dog's personality, background, known trauma, behaviour at the shelter..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </div>
              <label className="checkbox-card">
                <input type="checkbox" checked={form.specialNeeds} onChange={e => set('specialNeeds', e.target.checked)} />
                <div className="card-content">🏥 Has special needs or medical requirements</div>
              </label>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">Temperament</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                {TEMPERAMENT_OPTIONS.map(({ key, label }) => (
                  <label key={key} className="checkbox-card">
                    <input type="checkbox" checked={!!form.temperament[key]} onChange={() => toggleTemp(key)} />
                    <div className="card-content">{label}</div>
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
              {submitting ? 'Generating assessment…' : 'Generate ideal adopter profile →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
