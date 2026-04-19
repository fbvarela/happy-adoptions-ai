'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { useTranslations } from '@/i18n/useTranslations';
import { useLocale } from '@/context/LocaleContext';

const enableDevAuth = process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN === 'true';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | reset-sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const authError = searchParams.get('error');
  const { role, setRole } = useRole();
  const t = useTranslations('login');
  const { locale } = useLocale();

  const [devMode, setDevMode] = useState('signin'); // signin | signup | reset
  const [devEmail, setDevEmail] = useState('');
  const [devPassword, setDevPassword] = useState('');

  const setDevModeSafe = (mode) => {
    setDevMode(mode);
    setErrorMsg('');
    setStatus('idle');
  };

  const handleDevAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus('loading');

    if (devMode === 'reset') {
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: devEmail }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? 'Could not send reset email');
        setStatus('reset-sent');
      } catch (err) {
        setErrorMsg(err.message);
        setStatus('error');
      }
      return;
    }

    try {
      const endpoint = devMode === 'signup' ? '/api/auth/dev-signup' : '/api/auth/signin-password';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: devEmail, password: devPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Authentication failed');
      window.location.href = '/dashboard';
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send link');
      if (data.devRedirect) {
        router.push(data.devRedirect);
        return;
      }
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
            {t('title')}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('subtitle')}</p>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          <button
            className={`btn btn-sm ${role === 'adopter' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setRole('adopter')}
          >
            🏠 {t('adopter')}
          </button>
          <button
            className={`btn btn-sm ${role === 'volunteer' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setRole('volunteer')}
          >
            🤝 {t('volunteer')}
          </button>
        </div>

        <div className="card">
          {authError && (
            <div style={{ background: '#fef0e8', border: '1px solid var(--clay)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, color: 'var(--clay)', fontSize: '0.9rem' }}>
              {authError === 'expired_link' ? t('expiredLink') : t('signInFailed')}
            </div>
          )}

          {enableDevAuth && status === 'reset-sent' ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📬</div>
              <h3 style={{ color: 'var(--bark)', marginBottom: 8 }}>Check your email</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                If an account exists for <strong>{devEmail}</strong>, we sent a password-reset link.
              </p>
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 16 }}
                onClick={() => { setStatus('idle'); setDevModeSafe('signin'); setDevPassword(''); }}
              >
                Back to sign in
              </button>
            </div>
          ) : enableDevAuth ? (
            <form onSubmit={handleDevAuth}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 8,
                  padding: 4,
                  marginBottom: 16,
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  background: 'var(--bg)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setDevModeSafe('signin')}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    background: devMode === 'signin' ? 'var(--surface, #fff)' : 'transparent',
                    color: devMode === 'signin' ? 'var(--bark)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setDevModeSafe('signup')}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    background: devMode === 'signup' ? 'var(--surface, #fff)' : 'transparent',
                    color: devMode === 'signup' ? 'var(--bark)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Create account
                </button>
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="devEmail">{t('email')}</label>
                <input
                  id="devEmail"
                  name="devEmail"
                  type="email"
                  autoComplete="email"
                  className="input"
                  placeholder="you@example.com"
                  required
                  value={devEmail}
                  onChange={(e) => { setDevEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                />
              </div>

              {devMode !== 'reset' && (
                <div className="field" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="input-label" htmlFor="devPassword">{t('password')}</label>
                    {devMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setDevModeSafe('reset')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    id="devPassword"
                    name="devPassword"
                    type="password"
                    autoComplete={devMode === 'signup' ? 'new-password' : 'current-password'}
                    className="input"
                    required
                    minLength={6}
                    value={devPassword}
                    onChange={(e) => { setDevPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
                  />
                  {devMode === 'signup' && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      At least 6 characters.
                    </p>
                  )}
                </div>
              )}

              {devMode === 'reset' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Enter your account email and we&apos;ll send a link to set a new password.
                </p>
              )}

              {status === 'error' && errorMsg && (
                <p style={{ color: 'var(--clay)', fontSize: '0.85rem', marginBottom: 12 }}>{errorMsg}</p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={status === 'loading'}
              >
                {status === 'loading'
                  ? devMode === 'signup'
                    ? 'Creating account…'
                    : devMode === 'reset'
                      ? 'Sending link…'
                      : 'Signing in…'
                  : devMode === 'signup'
                    ? 'Create account'
                    : devMode === 'reset'
                      ? 'Send reset link'
                      : 'Sign in'}
              </button>

              {devMode === 'reset' && (
                <button
                  type="button"
                  onClick={() => setDevModeSafe('signin')}
                  className="btn btn-ghost"
                  style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                >
                  Back to sign in
                </button>
              )}
            </form>
          ) : status === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📬</div>
              <h3 style={{ color: 'var(--bark)', marginBottom: 8 }}>{t('checkEmail')}</h3>
              <p
                style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
                dangerouslySetInnerHTML={{ __html: t('sentLink', { email }) }}
              />
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => setStatus('idle')}>
                {t('tryDifferentEmail')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="input-label">{t('emailAddress')}</label>
                <input
                  className="input"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                {status === 'loading' ? t('sending') : `${t('sendMagicLink')} →`}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 16 }}>
          {t('noPasswordNeeded')}
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
