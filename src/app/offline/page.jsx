'use client';

export default function OfflinePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🐾</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', color: 'var(--bark)', marginBottom: 12 }}>You're offline</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Check your connection and try again.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    </div>
  );
}
