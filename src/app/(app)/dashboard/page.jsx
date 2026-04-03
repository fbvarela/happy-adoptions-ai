'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { showToast } = useApp();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/profile').then(r => r.json()).then(setProfile).catch(() => {});
    fetch('/api/favorites').then(r => r.json()).then(setFavorites).catch(() => {});
    fetch('/api/dog-posts?mine=true').then(r => r.json()).then(setMyListings).catch(() => {});
  }, [user]);

  if (loading || !user) {
    return <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }} /></div>;
  }

  const TABS = [
    { id: 'profile',   label: '👤 Profile' },
    { id: 'favorites', label: `❤️ Favorites (${favorites.length})` },
    { id: 'listings',  label: `📋 My listings (${myListings.length})` },
  ];

  return (
    <div className="page">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              {profile?.profile_data?.contact?.name ? `Hi, ${profile.profile_data.contact.name}!` : 'My Profile'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1.5px solid var(--line)', paddingBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 16px', fontSize: '0.9rem',
                color: activeTab === tab.id ? 'var(--bark)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 400,
                borderBottom: activeTab === tab.id ? '2px solid var(--bark)' : '2px solid transparent',
                marginBottom: -1.5, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div>
            {profile?.profile_data ? (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-title">Saved adopter profile</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                  This is the profile we use to find your matches.
                </p>
                <pre style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--cream)', padding: 12, borderRadius: 'var(--radius-sm)', overflow: 'auto' }}>
                  {JSON.stringify(profile.profile_data, null, 2)}
                </pre>
                <Link href="/quiz" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>Retake quiz to update</Link>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', background: 'var(--cream)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
                <h3 style={{ color: 'var(--bark)', marginBottom: 8 }}>No profile yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Take the quiz to build your adopter profile and get matched with dogs.</p>
                <Link href="/quiz" className="btn btn-primary">Start the quiz →</Link>
              </div>
            )}
          </div>
        )}

        {/* Favorites tab */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', background: 'var(--cream)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>🤍</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No saved dogs yet. Browse listings and save the ones you like.</p>
                <Link href="/quiz" className="btn btn-primary">Find matches →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {favorites.map(fav => (
                  <Link key={fav.id} href={`/dogs/${fav.dog_post_id}`} className="dog-card" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div className="dog-avatar" style={{ fontSize: '1.8rem' }}>🐕</div>
                      <div>
                        <div className="dog-name">{fav.name || 'Unknown'}</div>
                        <div className="dog-meta">{fav.breed || 'Mixed'} · {fav.sex}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '1.3rem', color: 'var(--text-muted)' }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My listings tab */}
        {activeTab === 'listings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Link href="/post-a-dog" className="btn btn-primary btn-sm">+ Post a dog</Link>
            </div>
            {myListings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', background: 'var(--cream)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>You haven&apos;t posted any dogs yet.</p>
                <Link href="/post-a-dog" className="btn btn-primary">Post a dog →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myListings.map(dog => (
                  <div key={dog.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div className="dog-avatar" style={{ fontSize: '1.8rem' }}>🐕</div>
                    <div style={{ flex: 1 }}>
                      <div className="dog-name">{dog.name}</div>
                      <div className="dog-meta">{dog.breed || 'Mixed'} · {dog.sex}</div>
                    </div>
                    <span className={`badge ${dog.status === 'available' ? 'badge-leaf' : 'badge-clay'}`}>
                      {dog.status}
                    </span>
                    <Link href={`/dogs/${dog.id}`} className="btn btn-ghost btn-sm">View</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
