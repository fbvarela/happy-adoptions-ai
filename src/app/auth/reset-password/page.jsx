'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Reset link is missing its token. Request a new one.');
      setState('error');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setState('error');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      setState('error');
      return;
    }

    setState('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to update password');
      setState('done');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update password.');
      setState('error');
    }
  };

  const wrapper = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: 'var(--bg)',
  };

  if (!token) {
    return (
      <div style={wrapper}>
        <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.4rem', color: 'var(--bark)', marginBottom: 8 }}>
            Reset link missing
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
            This reset link is invalid. Request a new one from the sign-in page.
          </p>
          <a href="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div style={wrapper}>
        <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.4rem', color: 'var(--bark)', marginBottom: 8 }}>
            Password updated
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Redirecting you…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapper}>
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🐾</div>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.4rem', color: 'var(--bark)', marginBottom: 4 }}>
            Choose a new password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="input-label" htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input"
              required
              minLength={6}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (state === 'error') setState('idle'); }}
            />
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="input-label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className="input"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); if (state === 'error') setState('idle'); }}
            />
          </div>
          {state === 'error' && message && (
            <p style={{ color: 'var(--clay)', fontSize: '0.85rem', marginBottom: 12 }}>{message}</p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={state === 'loading'}
          >
            {state === 'loading' ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
