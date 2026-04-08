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

// Contact (name) is first so we can personalise the rest of the quiz
const STEPS = [
  { key: 'contact',    component: ContactStep,    title: "Let's get started" },
  { key: 'household',  component: HouseholdStep,  title: 'Your household' },
  { key: 'housing',    component: HousingStep,    title: 'Your home' },
  { key: 'lifestyle',  component: LifestyleStep,  title: 'Your lifestyle' },
  { key: 'experience', component: ExperienceStep, title: 'Your experience' },
  { key: 'preferences',component: PreferencesStep,title: 'Dog preferences' },
];

const DOG_FACTS = [
  "Dogs have been human companions for over 15,000 years.",
  "A dog's sense of smell is 10,000× stronger than a human's.",
  "Every dog's nose print is unique — like a fingerprint.",
  "Dogs can understand up to 250 words and gestures.",
  "Dogs dream just like we do.",
  "The Basenji is the only dog breed that doesn't bark.",
];

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shelterId = searchParams.get('shelter');
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [dogFact] = useState(() => DOG_FACTS[Math.floor(Math.random() * DOG_FACTS.length)]);

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
          {firstName ? `Finding your matches, ${firstName}…` : 'Finding your matches…'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Our AI is analysing compatibility right now.</p>
        <div className="card" style={{ maxWidth: 380, margin: '0 auto 24px', background: 'var(--cream)' }}>
          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            <strong>Did you know?</strong> {dogFact}
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
            Hi {firstName}! Step {currentStep + 1} of {STEPS.length} →
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {STEPS[currentStep].title}
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
            Matching against dogs from this shelter
          </p>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return <Suspense><QuizContent /></Suspense>;
}
