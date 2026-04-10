'use client';

import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { useTranslations } from '@/i18n/useTranslations';

export default function HomePage() {
  const { role, setRole, mounted } = useRole();
  const t = useTranslations('home');

  // Avoid hydration mismatch — render nothing role-dependent until mounted
  if (!mounted) return null;

  // Role selection
  if (!role) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ maxWidth: 640, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🐾</div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: 'var(--bark)', marginBottom: 8 }}>
              {t('welcome')}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{t('howWillYouUse')}</p>
          </div>

          <div className="grid2" style={{ gap: 20 }}>
            <button
              className="card"
              onClick={() => setRole('adopter')}
              style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid var(--line)', background: 'none', padding: 32, transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--leaf)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏠</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', color: 'var(--bark)', marginBottom: 8 }}>
                {t('wantToAdopt')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {t('wantToAdoptDesc')}
              </p>
            </button>

            <button
              className="card"
              onClick={() => setRole('volunteer')}
              style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid var(--line)', background: 'none', padding: 32, transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--sun)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤝</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', color: 'var(--bark)', marginBottom: 8 }}>
                {t('shelterVolunteer')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {t('shelterVolunteerDesc')}
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Adopter home
  if (role === 'adopter') {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '48px 0 40px', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🐾</div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--bark)', marginBottom: 12 }}>{t('findPerfectDog')}</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            {t('findPerfectDogDesc')}
          </p>
          <Link href="/quiz" className="btn btn-leaf" style={{ fontSize: '1rem', padding: '12px 32px' }}>
            {t('startQuiz')} →
          </Link>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="grid3" style={{ gap: 20 }}>
            {[
              { icon: '📋', title: t('tellAboutYourself'), desc: t('tellAboutYourselfDesc') },
              { icon: '🤖', title: t('aiFindsMatches'), desc: t('aiFindsMatchesDesc') },
              { icon: '📄', title: t('exportResults'), desc: t('exportResultsDesc') },
            ].map(step => (
              <div key={step.title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{step.icon}</div>
                <h3 style={{ fontSize: '1rem', color: 'var(--bark)', marginBottom: 6 }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Volunteer home
  return (
    <div className="page">
      <div style={{ textAlign: 'center', padding: '48px 0 40px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🤝</div>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--bark)', marginBottom: 12 }}>{t('volunteerPortal')}</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          {t('volunteerPortalDesc')}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/assess" className="btn btn-sun" style={{ fontSize: '1rem', padding: '12px 28px' }}>
            {t('assessADog')} →
          </Link>
          <Link href="/post-a-dog" className="btn btn-ghost">{t('postADog')}</Link>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="grid3" style={{ gap: 20 }}>
          {[
            { icon: '🤖', title: t('aiAssessment'), desc: t('aiAssessmentDesc') },
            { icon: '📸', title: t('photosListings'), desc: t('photosListingsDesc') },
            { icon: '🏡', title: t('shelterLinking'), desc: t('shelterLinkingDesc') },
          ].map(step => (
            <div key={step.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{step.icon}</div>
              <h3 style={{ fontSize: '1rem', color: 'var(--bark)', marginBottom: 6 }}>{step.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
