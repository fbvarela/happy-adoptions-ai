'use client';

import Link from 'next/link';
import { useRole } from '@/context/RoleContext';

export default function HomePage() {
  const { role, setRole, mounted } = useRole();

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
              Welcome to Happy Adoptions AI
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>How will you be using the app today?</p>
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
                I want to adopt
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Take a short quiz and our AI will match you with dogs that fit your lifestyle. No account needed.
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
                I&apos;m a shelter volunteer
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Manage dogs, add photos, link your shelter, and use AI to build ideal adopter profiles for each dog.
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
          <h1 style={{ fontSize: '2.2rem', color: 'var(--bark)', marginBottom: 12 }}>Find your perfect dog</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            Answer a few questions about your lifestyle and our AI will match you with dogs available for adoption.
            No account needed — your data stays on your device.
          </p>
          <Link href="/quiz" className="btn btn-leaf" style={{ fontSize: '1rem', padding: '12px 32px' }}>
            Start the quiz →
          </Link>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="grid3" style={{ gap: 20 }}>
            {[
              { icon: '📋', title: 'Tell us about yourself', desc: 'Your home, lifestyle, experience, and what you\'re looking for.' },
              { icon: '🤖', title: 'AI finds your matches', desc: 'Our AI scores compatibility between your profile and available dogs.' },
              { icon: '📄', title: 'Export your results', desc: 'Print or save your match report to take to any shelter.' },
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
        <h1 style={{ fontSize: '2.2rem', color: 'var(--bark)', marginBottom: 12 }}>Volunteer portal</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          Manage dogs in your shelter, run AI assessments to build ideal adopter profiles, and share listings.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/assess" className="btn btn-sun" style={{ fontSize: '1rem', padding: '12px 28px' }}>
            Assess a dog →
          </Link>
          <Link href="/post-a-dog" className="btn btn-ghost">Post a dog</Link>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="grid3" style={{ gap: 20 }}>
          {[
            { icon: '🤖', title: 'AI assessment', desc: 'Enter a dog\'s profile and get an AI-generated ideal adopter match — instantly.' },
            { icon: '📸', title: 'Photos & listings', desc: 'Post dogs with photos, temperament notes, and shelter links.' },
            { icon: '🏡', title: 'Shelter linking', desc: 'Link your account to your shelter so adopters can find your dogs.' },
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
