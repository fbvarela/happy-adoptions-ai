'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRole } from '@/context/RoleContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const { role, setRole } = useRole();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send link');
      setStatus('sent');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🐾</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', color: 'var(--bark)', marginBottom: 6 }}>
            Happy Adoptions AI
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to save your matches and profile.</p>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          <button
            className={`btn btn-sm ${role === 'adopter' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setRole('adopter')}
          >
            🏠 Adopter
          </button>
          <button
            className={`btn btn-sm ${role === 'volunteer' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setRole('volunteer')}
          >
            🤝 Volunteer
          </button>
        </div>

        <div className="card">
          {authError && (
            <div style={{ background: '#fef0e8', border: '1px solid var(--clay)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, color: 'var(--clay)', fontSize: '0.9rem' }}>
              {authError === 'expired_link' ? 'This link has expired. Request a new one.' : 'Sign-in failed. Please try again.'}
            </div>
          )}

          {status === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📬</div>
              <h3 style={{ color: 'var(--bark)', marginBottom: 8 }}>Check your email</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                We sent a sign-in link to <strong>{email}</strong>. It expires in 1 hour.
              </p>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => setStatus('idle')}>
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="input-label">Email address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {status === 'error' && (
                <p style={{ color: 'var(--clay)', fontSize: '0.85rem', marginBottom: 12 }}>{errorMsg}</p>
              )}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={status === 'loading'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {status === 'loading' ? 'Sending...' : 'Send magic link →'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 16 }}>
          No password needed. We&apos;ll email you a one-click sign-in link.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
