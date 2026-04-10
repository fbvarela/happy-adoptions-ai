'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';

export function HousingStep({ data, onNext, onBack }) {
  const [form, setForm] = useState(data?.housing || {});
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const t = useTranslations('quiz.housing');
  const tc = useTranslations('common');

  return (
    <div className="quiz-step">
      <h3>{t('title')}</h3>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>{t('subtitle')}</p>

      <div className="field">
        <label className="input-label">{t('housingType')}</label>
        <select className="input" value={form.type || ''} onChange={e => set('type', e.target.value)}>
          <option value="">{tc('select')}</option>
          <option value="house">{t('houseWithYard')}</option>
          <option value="house_no_yard">{t('houseNoYard')}</option>
          <option value="apartment">{t('apartment')}</option>
          <option value="condo">{t('condo')}</option>
        </select>
      </div>

      <div className="field">
        <label className="input-label">{t('outdoorSpace')}</label>
        <select className="input" value={form.outdoorSpace || ''} onChange={e => set('outdoorSpace', e.target.value)}>
          <option value="">{tc('select')}</option>
          <option value="large_yard">{t('largeYard')}</option>
          <option value="small_yard">{t('smallYard')}</option>
          <option value="balcony">{t('balcony')}</option>
          <option value="none">{t('noOutdoor')}</option>
        </select>
      </div>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.hasAllergies} onChange={e => set('hasAllergies', e.target.checked)} />
        <div className="card-content"><span>🤧</span><span>{t('allergies')}</span></div>
      </label>

      <label className="checkbox-card">
        <input type="checkbox" checked={!!form.rentalRestrictions} onChange={e => set('rentalRestrictions', e.target.checked)} />
        <div className="card-content"><span>🏢</span><span>{t('rentalRestrictions')}</span></div>
      </label>

      {form.rentalRestrictions && (
        <div className="follow-up">
          <label className="input-label">{t('describeRestrictions')}</label>
          <input
            className="input" type="text"
            placeholder={t('restrictionsPlaceholder')}
            value={form.rentalDetails || ''}
            onChange={e => set('rentalDetails', e.target.value)}
          />
        </div>
      )}

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onBack}>{tc('back')}</button>
        <button className="btn btn-primary" onClick={() => onNext({ housing: form })}>{tc('continue')}</button>
      </div>
    </div>
  );
}
