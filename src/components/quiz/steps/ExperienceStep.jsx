'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';

export function ExperienceStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.experience || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const t = useTranslations('quiz.experience');
  const tc = useTranslations('common');

  return (
    <div className="quiz-step">
      <h3>{t('title')}</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>{t('subtitle')}</p>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.firstTimeOwner} onChange={e => set('firstTimeOwner', e.target.checked)} />
        <div className="card-content"><span>🌱</span><span>{t('firstDog')}</span></div>
      </label>

      <div className="field">
        <label className="input-label">{t('previousDogs')}</label>
        <input
          className="input" type="number" min="0" max="50"
          value={form.previousDogs ?? ''}
          onChange={e => set('previousDogs', parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="field">
        <label className="input-label">{t('trainingExperience')}</label>
        <select className="input" value={form.trainingExperience || ''} onChange={e => set('trainingExperience', e.target.value)}>
          <option value="">{tc('select')}</option>
          <option value="none">{t('noTraining')}</option>
          <option value="basic">{t('basicTraining')}</option>
          <option value="experienced">{t('experiencedTrainer')}</option>
        </select>
      </div>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.openToSpecialNeeds} onChange={e => set('openToSpecialNeeds', e.target.checked)} />
        <div className="card-content"><span>💛</span><span>{t('specialNeeds')}</span></div>
      </label>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>{tc('back')}</button>
        <button className="btn btn-primary" onClick={() => onNext({ experience: form })}>{tc('continue')}</button>
      </div>
    </div>
  );
}
