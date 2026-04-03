'use client';

import { useState } from 'react';

export function PreferencesStep({ data, onNext, onBack, firstName }) {
  const [form, setForm] = useState(data?.preferences || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

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

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-leaf" onClick={() => onNext({ preferences: form })}>
          {firstName ? `Find my matches, ${firstName} →` : 'Find my matches →'}
        </button>
      </div>
    </div>
  );
}
