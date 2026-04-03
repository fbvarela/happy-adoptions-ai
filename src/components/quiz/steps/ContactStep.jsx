'use client';

import { useState } from 'react';

// ContactStep is now FIRST in the quiz so we can personalize from step 2 onwards.
// It collects name, email, and location — all optional except name for personalization.
export function ContactStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.contact || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="quiz-step">
      <h3>Let&apos;s get started</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>
        Tell us a little about yourself so we can personalise your experience.
        Everything is optional — fill in what you&apos;re comfortable with.
      </p>

      <div className="field">
        <label className="input-label">Your name</label>
        <input
          className="input"
          type="text"
          placeholder="First name"
          value={form.name || ''}
          onChange={e => set('name', e.target.value)}
          autoFocus
        />
      </div>

      <div className="field">
        <label className="input-label">Email (optional)</label>
        <input
          className="input"
          type="email"
          placeholder="you@example.com"
          value={form.email || ''}
          onChange={e => set('email', e.target.value)}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
          Shelters can contact you about your matches.
        </span>
      </div>

      <div className="field">
        <label className="input-label">City / region (optional)</label>
        <input
          className="input"
          type="text"
          placeholder="e.g. Lisbon, Portugal"
          value={form.location || ''}
          onChange={e => set('location', e.target.value)}
        />
      </div>

      <div className="field">
        <label className="input-label">Anything else we should know? (optional)</label>
        <textarea
          className="input"
          placeholder="Any extra info about your home, schedule, or what you&apos;re looking for..."
          value={form.notes || ''}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={() => onNext({ contact: form })}>
          {form.name ? `Let's go, ${form.name.split(' ')[0]}! →` : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
