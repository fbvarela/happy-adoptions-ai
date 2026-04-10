'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';

export function HouseholdStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.household || {});
  const toggle = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const t = useTranslations('quiz.household');
  const tc = useTranslations('common');

  return (
    <div className="quiz-step">
      <h3>{t('title')}</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>{t('subtitle')}</p>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasKids} onChange={e => toggle('hasKids', e.target.checked)} />
        <div className="card-content"><span>👶</span><span>{t('childrenInHome')}</span></div>
      </label>

      {form.hasKids && (
        <div className="follow-up">
          <label className="input-label">{t('childrenAges')}</label>
          <input
            className="input"
            type="text"
            placeholder={t('childrenAgesPlaceholder')}
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
        <div className="card-content"><span>🐕</span><span>{t('otherDogs')}</span></div>
      </label>

      {form.hasDogs && (
        <div className="follow-up">
          <label className="input-label">{t('howManyDogs')}</label>
          <input
            className="input" type="number" min="1" max="10"
            value={form.dogCount || 1}
            onChange={e => setForm(prev => ({ ...prev, dogCount: parseInt(e.target.value) || 1 }))}
          />
        </div>
      )}

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasCats} onChange={e => toggle('hasCats', e.target.checked)} />
        <div className="card-content"><span>🐈</span><span>{t('catsAtHome')}</span></div>
      </label>

      <div className="field">
        <label className="input-label">{t('otherPets')}</label>
        <input
          className="input" type="text"
          placeholder={t('otherPetsPlaceholder')}
          value={form.otherPets || ''}
          onChange={e => setForm(prev => ({ ...prev, otherPets: e.target.value }))}
        />
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>{tc('back')}</button>
        <button className="btn btn-primary" onClick={() => onNext({ household: form })}>{tc('continue')}</button>
      </div>
    </div>
  );
}
