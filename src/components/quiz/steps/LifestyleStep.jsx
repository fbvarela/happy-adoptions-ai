'use client';

import { useState } from 'react';

export function LifestyleStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.lifestyle || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="quiz-step">
      <h3>Your lifestyle</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>How do you spend your days?</p>

      <div className="field">
        <label className="input-label">Activity level</label>
        <select className="input" value={form.activityLevel || ''} onChange={e => set('activityLevel', e.target.value)}>
          <option value="">Select...</option>
          <option value="sedentary">Mostly at home / low activity</option>
          <option value="moderate">Moderate — daily walks</option>
          <option value="active">Active — runs, hikes</option>
          <option value="very_active">Very active — outdoors daily</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">Work schedule</label>
        <select className="input" value={form.workSchedule || ''} onChange={e => set('workSchedule', e.target.value)}>
          <option value="">Select...</option>
          <option value="home_all_day">Work from home / stay at home</option>
          <option value="part_time">Out of home part-time</option>
          <option value="full_time_out">Out of home full-time</option>
          <option value="frequent_travel">Frequent traveler</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">Hours dog would be alone per day</label>
        <input
          className="input" type="number" min="0" max="24"
          value={form.aloneTimeHours ?? ''}
          onChange={e => set('aloneTimeHours', parseInt(e.target.value) || 0)}
        />
      </div>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasDogWalker} onChange={e => set('hasDogWalker', e.target.checked)} />
        <div className="card-content"><span>🦮</span><span>Will use a dog walker or doggy daycare</span></div>
      </label>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={() => onNext({ lifestyle: form })}>Continue</button>
      </div>
    </div>
  );
}
