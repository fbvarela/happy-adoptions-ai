'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';

export function ContactStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.contact || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const t = useTranslations('quiz.contact');
  const tc = useTranslations('common');

  return (
    <div className="quiz-step">
      <h3>{t('title')}</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>
        {t('intro')}
      </p>

      <div className="field">
        <label className="input-label">{t('yourName')}</label>
        <input
          className="input"
          type="text"
          placeholder={t('firstName')}
          value={form.name || ''}
          onChange={e => set('name', e.target.value)}
          autoFocus
        />
      </div>

      <div className="field">
        <label className="input-label">{t('emailOptional')}</label>
        <input
          className="input"
          type="email"
          placeholder={t('emailPlaceholder')}
          value={form.email || ''}
          onChange={e => set('email', e.target.value)}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
          {t('emailHelper')}
        </span>
      </div>

      <div className="field">
        <label className="input-label">{t('cityRegion')}</label>
        <input
          className="input"
          type="text"
          placeholder={t('cityPlaceholder')}
          value={form.location || ''}
          onChange={e => set('location', e.target.value)}
        />
      </div>

      <div className="field">
        <label className="input-label">{t('anythingElse')}</label>
        <textarea
          className="input"
          placeholder={t('anythingElsePlaceholder')}
          value={form.notes || ''}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>{tc('back')}</button>
        <button className="btn btn-primary" onClick={() => onNext({ contact: form })}>
          {form.name ? `${t('letsGoName', { name: form.name.split(' ')[0] })} →` : `${t('continueArrow')} →`}
        </button>
      </div>
    </div>
  );
}
