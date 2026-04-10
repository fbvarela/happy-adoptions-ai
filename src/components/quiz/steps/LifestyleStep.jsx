'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';

export function LifestyleStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.lifestyle || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const t = useTranslations('quiz.lifestyle');
  const tc = useTranslations('common');

  return (
    <div className="quiz-step">
      <h3>{t('title')}</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>{t('subtitle')}</p>

      <div className="field">
        <label className="input-label">{t('activityLevel')}</label>
        <select className="input" value={form.activityLevel || ''} onChange={e => set('activityLevel', e.target.value)}>
          <option value="">{tc('select')}</option>
          <option value="sedentary">{t('sedentary')}</option>
          <option value="moderate">{t('moderate')}</option>
          <option value="active">{t('active')}</option>
          <option value="very_active">{t('veryActive')}</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">{t('workSchedule')}</label>
        <select className="input" value={form.workSchedule || ''} onChange={e => set('workSchedule', e.target.value)}>
          <option value="">{tc('select')}</option>
          <option value="home_all_day">{t('homeAllDay')}</option>
          <option value="part_time">{t('partTime')}</option>
          <option value="full_time_out">{t('fullTimeOut')}</option>
          <option value="frequent_travel">{t('frequentTravel')}</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">{t('hoursAlone')}</label>
        <input
          className="input" type="number" min="0" max="24"
          value={form.aloneTimeHours ?? ''}
          onChange={e => set('aloneTimeHours', parseInt(e.target.value) || 0)}
        />
      </div>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasDogWalker} onChange={e => set('hasDogWalker', e.target.checked)} />
        <div className="card-content"><span>🦮</span><span>{t('dogWalker')}</span></div>
      </label>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>{tc('back')}</button>
        <button className="btn btn-primary" onClick={() => onNext({ lifestyle: form })}>{tc('continue')}</button>
      </div>
    </div>
  );
}
