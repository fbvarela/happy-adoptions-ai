'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { useTranslations } from '@/i18n/useTranslations';
import { useLocale } from '@/context/LocaleContext';

const enableTestLogin = process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN === 'true';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const authError = searchParams.get('error');
  const { role, setRole } = useRole();
  const t = useTranslations('login');
  const { locale } = useLocale();

  const handleTestLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus('loading');
    const form = e.currentTarget;
    const testEmail = form.elements.namedItem('testEmail').value;
    const testPassword = form.elements.namedItem('testPassword').value;
    try {
      const res = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Test login failed.');
      router.push('/dashboard');
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

          {enableTestLogin && (
            <form onSubmit={handleTestLogin} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, marginBottom: 12 }}>
                🛠 {t('testLogin')}
              </p>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="testEmail">{t('email')}</label>
                <input id="testEmail" name="testEmail" type="email" className="input" required />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="testPassword">{t('password')}</label>
                <input id="testPassword" name="testPassword" type="password" className="input" required />
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
                {status === 'loading' ? t('signingIn') : t('signInTestUser')}
              </button>
            </form>
          )}

          {status === 'sent' ? (
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
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus={!enableTestLogin}
                />
              </div>
              {status === 'error' && !enableTestLogin && (
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
