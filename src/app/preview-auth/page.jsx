'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PreviewAuthForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get('next') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/preview-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, next }),
    });

    if (res.ok) {
      router.replace(next);
    } else {
      setError('Wrong password.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🐾</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', color: 'var(--bark)', marginBottom: 6 }}>
            Happy Adoptions AI
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Preview access — enter the password to continue.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Preview password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && (
              <p style={{ color: 'var(--clay)', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>
            )}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Checking...' : 'Enter →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PreviewAuthPage() {
  return (
    <Suspense>
      <PreviewAuthForm />
    </Suspense>
  );
}
