'use client';

import { useState } from 'react';

export function HouseholdStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.household || {});

  const toggle = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="quiz-step">
      <h3>Tell us about your household</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>Who lives at home with you?</p>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasKids} onChange={e => toggle('hasKids', e.target.checked)} />
        <div className="card-content"><span>👶</span><span>Children in the home</span></div>
      </label>

      {form.hasKids && (
        <div className="follow-up">
          <label className="input-label">Ages of children (comma separated)</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. 3, 7, 12"
            value={form.kidsAges?.join(', ') || ''}
            onChange={e => setForm(prev => ({
              ...prev,
              kidsAges: e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)),
            }))}
          />
        </div>
      )}

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasDogs} onChange={e => toggle('hasDogs', e.target.checked)} />
        <div className="card-content"><span>🐕</span><span>Other dogs at home</span></div>
      </label>

      {form.hasDogs && (
        <div className="follow-up">
          <label className="input-label">How many dogs?</label>
          <input
            className="input" type="number" min="1" max="10"
            value={form.dogCount || 1}
            onChange={e => setForm(prev => ({ ...prev, dogCount: parseInt(e.target.value) || 1 }))}
          />
        </div>
      )}

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasCats} onChange={e => toggle('hasCats', e.target.checked)} />
        <div className="card-content"><span>🐈</span><span>Cats at home</span></div>
      </label>

      <div className="field">
        <label className="input-label">Other pets (optional)</label>
        <input
          className="input" type="text"
          placeholder="e.g. rabbit, birds..."
          value={form.otherPets || ''}
          onChange={e => setForm(prev => ({ ...prev, otherPets: e.target.value }))}
        />
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={() => onNext({ household: form })}>Continue</button>
      </div>
    </div>
  );
}
