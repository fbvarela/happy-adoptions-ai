'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useTranslations } from '@/i18n/useTranslations';

function ProfileSection({ title, data, labels }) {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(labels).filter(([key]) => data[key] !== undefined && data[key] !== '' && data[key] !== null);
  if (entries.length === 0) return null;

  const tf = useTranslations('formatValues');

  function formatValue(val) {
    if (val === true) return tf('yes') || 'Yes';
    if (val === false) return tf('no') || 'No';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'number') return String(val);
    const translated = tf(val);
    return (translated && translated !== `formatValues.${val}`) ? translated : (val || '—');
  }

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="grid2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 8 }}>
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
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

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
    { id: 'profile',   label: `👤 ${t('profile')}` },
    { id: 'favorites', label: `❤️ ${t('favorites')} (${favorites.length})` },
    { id: 'listings',  label: `📋 ${t('myListings')} (${myListings.length})` },
  ];

  return (
    <div className="page">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              {profile?.profile_data?.contact?.name ? t('hiName', { name: profile.profile_data.contact.name }) : t('myProfile')}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>{tc('signOut')}</button>
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
                <ProfileSection title={t('contact')} data={profile.profile_data.contact} labels={{
                  name: t('name'), email: t('email'), location: t('location'), notes: t('notes'),
                }} />
                <ProfileSection title={t('household')} data={profile.profile_data.household} labels={{
                  hasKids: t('childrenAtHome'), kidsAges: t('kidsAges'), hasDogs: t('otherDogs'), dogCount: t('numberOfDogs'), hasCats: t('catsAtHome'), otherPets: t('otherPets'),
                }} />
                <ProfileSection title={t('housing')} data={profile.profile_data.housing} labels={{
                  type: t('housingType'), outdoorSpace: t('outdoorSpace'), hasAllergies: t('dogAllergies'), rentalRestrictions: t('rentalRestrictions'), rentalDetails: t('restrictionDetails'),
                }} />
                <ProfileSection title={t('lifestyle')} data={profile.profile_data.lifestyle} labels={{
                  activityLevel: t('activityLevel'), workSchedule: t('workSchedule'), aloneTimeHours: t('hoursAlone'), hasDogWalker: t('dogWalker'),
                }} />
                <ProfileSection title={t('experience')} data={profile.profile_data.experience} labels={{
                  firstTimeOwner: t('firstTimeOwner'), previousDogs: t('previousDogs'), trainingExperience: t('trainingExperience'), openToSpecialNeeds: t('openToSpecialNeeds'),
                }} />
                <ProfileSection title={t('preferences')} data={profile.profile_data.preferences} labels={{
                  size: t('preferredSize'), age: t('preferredAge'), energyLevel: t('energyLevel'), mustBeGoodWithKids: t('mustGoodKids'), mustBeGoodWithDogs: t('mustGoodDogs'), mustBeGoodWithCats: t('mustGoodCats'), mustBeTrained: t('mustTrained'),
                }} />
                <Link href="/quiz" className="btn btn-ghost btn-sm">{t('retakeQuiz')}</Link>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', background: 'var(--cream)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
                <h3 style={{ color: 'var(--bark)', marginBottom: 8 }}>{t('noProfileYet')}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t('noProfileDesc')}</p>
                <Link href="/quiz" className="btn btn-primary">{t('startQuiz')} →</Link>
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
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t('noFavorites')}</p>
                <Link href="/quiz" className="btn btn-primary">{t('findMatches')} →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {favorites.map(fav => (
                  <Link key={fav.id} href={`/dogs/${fav.dog_post_id}`} className="dog-card" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div className="dog-avatar" style={{ fontSize: '1.8rem' }}>🐕</div>
                      <div>
                        <div className="dog-name">{fav.name || tc('unknown')}</div>
                        <div className="dog-meta">{fav.breed || tc('mixed')} · {fav.sex}</div>
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
              <Link href="/post-a-dog" className="btn btn-primary btn-sm">{t('postADog')}</Link>
            </div>
            {myListings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', background: 'var(--cream)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t('noListings')}</p>
                <Link href="/post-a-dog" className="btn btn-primary">{t('postDog')} →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myListings.map(dog => (
                  <div key={dog.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div className="dog-avatar" style={{ fontSize: '1.8rem' }}>🐕</div>
                    <div style={{ flex: 1 }}>
                      <div className="dog-name">{dog.name}</div>
                      <div className="dog-meta">{dog.breed || tc('mixed')} · {dog.sex}</div>
                    </div>
                    <span className={`badge ${dog.status === 'available' ? 'badge-leaf' : 'badge-clay'}`}>
                      {dog.status}
                    </span>
                    <Link href={`/dogs/${dog.id}`} className="btn btn-ghost btn-sm">{tc('view')}</Link>
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
