'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

const FORMAT_VALUE = {
  house: 'House with yard', house_no_yard: 'House without yard', apartment: 'Apartment', condo: 'Condo / townhouse',
  large_yard: 'Large fenced yard', small_yard: 'Small yard or garden', balcony: 'Balcony only', none: 'No outdoor space',
  sedentary: 'Low activity', moderate: 'Moderate — daily walks', active: 'Active — runs, hikes', very_active: 'Very active — outdoors daily',
  home_all_day: 'Work from home', part_time: 'Out part-time', full_time_out: 'Out full-time', frequent_travel: 'Frequent traveler',
  basic: 'Basic commands', experienced: 'Experienced trainer',
  small: 'Small (under 10kg)', medium: 'Medium (10–25kg)', large: 'Large (25kg+)',
  puppy: 'Puppy (under 1 year)', young: 'Young (1–3 years)', adult: 'Adult (3–8 years)', senior: 'Senior (8+ years)',
  low: 'Low energy', high: 'High energy',
};

function formatValue(val) {
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'number') return String(val);
  return FORMAT_VALUE[val] || val || '—';
}

function ProfileSection({ title, data, labels }) {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(labels).filter(([key]) => data[key] !== undefined && data[key] !== '' && data[key] !== null);
  if (entries.length === 0) return null;
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 8 }}>
        {entries.map(([key, label]) => (
          <div key={key}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
            <div style={{ fontSize: '0.9rem', color: 'var(--bark)', fontWeight: 500 }}>{formatValue(data[key])}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                <ProfileSection title="Contact" data={profile.profile_data.contact} labels={{
                  name: 'Name', email: 'Email', location: 'Location', notes: 'Notes',
                }} />
                <ProfileSection title="Household" data={profile.profile_data.household} labels={{
                  hasKids: 'Children at home', kidsAges: 'Kids ages', hasDogs: 'Other dogs', dogCount: 'Number of dogs', hasCats: 'Cats at home', otherPets: 'Other pets',
                }} />
                <ProfileSection title="Housing" data={profile.profile_data.housing} labels={{
                  type: 'Housing type', outdoorSpace: 'Outdoor space', hasAllergies: 'Dog allergies', rentalRestrictions: 'Rental restrictions', rentalDetails: 'Restriction details',
                }} />
                <ProfileSection title="Lifestyle" data={profile.profile_data.lifestyle} labels={{
                  activityLevel: 'Activity level', workSchedule: 'Work schedule', aloneTimeHours: 'Hours alone per day', hasDogWalker: 'Dog walker / daycare',
                }} />
                <ProfileSection title="Experience" data={profile.profile_data.experience} labels={{
                  firstTimeOwner: 'First-time owner', previousDogs: 'Previous dogs', trainingExperience: 'Training experience', openToSpecialNeeds: 'Open to special needs',
                }} />
                <ProfileSection title="Preferences" data={profile.profile_data.preferences} labels={{
                  size: 'Preferred size', age: 'Preferred age', energyLevel: 'Energy level', mustBeGoodWithKids: 'Must be good with kids', mustBeGoodWithDogs: 'Must be good with dogs', mustBeGoodWithCats: 'Must be good with cats', mustBeTrained: 'Must be trained',
                }} />
                <Link href="/quiz" className="btn btn-ghost btn-sm">Retake quiz to update</Link>
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
