'use client';

import { useState } from 'react';

export function HousingStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.housing || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="quiz-step">
      <h3>Your home</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>Help us understand your living space.</p>

      <div className="field">
        <label className="input-label">Housing type</label>
        <select className="input" value={form.type || ''} onChange={e => set('type', e.target.value)}>
          <option value="">Select...</option>
          <option value="house">House with yard</option>
          <option value="house_no_yard">House without yard</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo / townhouse</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">Outdoor space</label>
        <select className="input" value={form.outdoorSpace || ''} onChange={e => set('outdoorSpace', e.target.value)}>
          <option value="">Select...</option>
          <option value="large_yard">Large fenced yard</option>
          <option value="small_yard">Small yard or garden</option>
          <option value="balcony">Balcony only</option>
          <option value="none">No outdoor space</option>
        </select>
      </div>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasAllergies} onChange={e => set('hasAllergies', e.target.checked)} />
        <div className="card-content"><span>🤧</span><span>Someone at home has dog allergies</span></div>
      </label>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.rentalRestrictions} onChange={e => set('rentalRestrictions', e.target.checked)} />
        <div className="card-content"><span>🏢</span><span>Rental with breed/size restrictions</span></div>
      </label>

      {form.rentalRestrictions && (
        <div className="follow-up">
          <label className="input-label">Describe restrictions (optional)</label>
          <input
            className="input" type="text"
            placeholder="e.g. no dogs over 20kg"
            value={form.rentalDetails || ''}
            onChange={e => set('rentalDetails', e.target.value)}
          />
        </div>
      )}

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={() => onNext({ housing: form })}>Continue</button>
      </div>
    </div>
  );
}
