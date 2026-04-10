'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContactStep } from '@/components/quiz/steps/ContactStep';
import { HouseholdStep } from '@/components/quiz/steps/HouseholdStep';
import { HousingStep } from '@/components/quiz/steps/HousingStep';
import { LifestyleStep } from '@/components/quiz/steps/LifestyleStep';
import { ExperienceStep } from '@/components/quiz/steps/ExperienceStep';
import { PreferencesStep } from '@/components/quiz/steps/PreferencesStep';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/i18n/useTranslations';
import { useLocale } from '@/context/LocaleContext';

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shelterId = searchParams.get('shelter');
  const { user } = useAuth();
  const t = useTranslations('quiz');
  const { locale } = useLocale();

  const STEPS = [
    { key: 'contact',    component: ContactStep,    titleKey: 'contact' },
    { key: 'household',  component: HouseholdStep,  titleKey: 'household' },
    { key: 'housing',    component: HousingStep,    titleKey: 'housing' },
    { key: 'lifestyle',  component: LifestyleStep,  titleKey: 'lifestyle' },
    { key: 'experience', component: ExperienceStep, titleKey: 'experience' },
    { key: 'preferences',component: PreferencesStep,titleKey: 'preferences' },
  ];

  const dogFacts = t('dogFacts');

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [dogFact] = useState(() => {
    const facts = Array.isArray(dogFacts) ? dogFacts : [];
    return facts[Math.floor(Math.random() * facts.length)] || '';
  });

  // On mount: restore from sessionStorage, then overlay saved DB profile (if logged in)
  useEffect(() => {
    const saved = sessionStorage.getItem('adoptionsQuiz');
    if (saved) {
      try {
        const { answers: a, step } = JSON.parse(saved);
        setAnswers(a || {});
        setCurrentStep(step || 0);
        return; // In-progress session takes priority
      } catch {}
    }
    // No in-progress session — pre-fill from saved profile
    if (user) {
      fetch('/api/profile')
        .then(r => r.json())
        .then(data => {
          if (data?.profile_data) setAnswers(data.profile_data);
        })
        .catch(() => {});
    }
  }, [user]);

  // Auto-save progress to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem('adoptionsQuiz', JSON.stringify({ answers, step: currentStep }));
  }, [answers, currentStep]);

  // Derive first name from answers for personalization
  const firstName = answers?.contact?.name?.split(' ')[0] || null;

  const handleNext = (stepData) => {
    setAnswers(prev => ({ ...prev, ...stepData }));
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
    else router.push('/');
  };

  // Called from the last step's Continue button
  const handleComplete = async (finalData) => {
    setLoading(true);
    const allAnswers = { ...answers, ...finalData };

    // Persist profile to DB (fire and forget — don't block the match)
    if (user) {
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allAnswers),
      }).catch(() => {});
    }

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: allAnswers,
          shelterId: shelterId || null,
          referencePhoto: allAnswers.referencePhoto || null,
          locale,
        }),
      });
      const data = await res.json();

      sessionStorage.removeItem('adoptionsQuiz');
      sessionStorage.setItem('adoptionsResult', JSON.stringify(data));
      router.push(`/results?session=${data.sessionId}`);
    } catch {
      router.push('/results?error=true');
    } finally {
      setLoading(false);
    }
  };

  const StepComponent = STEPS[currentStep].component;
  const isLastStep = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>🐕</div>
        <h2 style={{ color: 'var(--bark)', marginBottom: 12 }}>
          {firstName ? t('findingMatchesName', { name: firstName }) : t('findingMatches')}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t('aiAnalysing')}</p>
        <div className="card" style={{ maxWidth: 380, margin: '0 auto 24px', background: 'var(--cream)' }}>
          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            <strong>{t('didYouKnow')}</strong> {dogFact}
          </p>
        </div>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        {/* Personalised heading */}
        {firstName && currentStep > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>
            {t('hiStep', { name: firstName, step: currentStep + 1, total: STEPS.length })} →
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t(`steps.${STEPS[currentStep].titleKey}`)}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--leaf)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Step */}
        <div className="card">
          <StepComponent
            data={answers}
            onNext={isLastStep ? handleComplete : handleNext}
            onBack={handleBack}
            onComplete={handleComplete}
            firstName={firstName}
          />
        </div>

        {shelterId && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 12 }}>
            {t('matchingAgainstShelter')}
          </p>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return <Suspense><QuizContent /></Suspense>;
}
