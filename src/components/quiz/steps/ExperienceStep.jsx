'use client';

import { useState } from 'react';

export function ExperienceStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.experience || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="quiz-step">
      <h3>Your experience with dogs</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>Helps us find a dog that fits your confidence level.</p>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.firstTimeOwner} onChange={e => set('firstTimeOwner', e.target.checked)} />
        <div className="card-content"><span>🌱</span><span>This is my first dog</span></div>
      </label>

      <div className="field">
        <label className="input-label">How many dogs have you owned before?</label>
        <input
          className="input" type="number" min="0" max="50"
          value={form.previousDogs ?? ''}
          onChange={e => set('previousDogs', parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="field">
        <label className="input-label">Training experience</label>
        <select className="input" value={form.trainingExperience || ''} onChange={e => set('trainingExperience', e.target.value)}>
          <option value="">Select...</option>
          <option value="none">None — happy to learn</option>
          <option value="basic">Basic commands only</option>
          <option value="experienced">Experienced trainer</option>
        </select>
      </div>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.openToSpecialNeeds} onChange={e => set('openToSpecialNeeds', e.target.checked)} />
        <div className="card-content"><span>💛</span><span>Open to dogs with special needs</span></div>
      </label>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={() => onNext({ experience: form })}>Continue</button>
      </div>
    </div>
  );
}
