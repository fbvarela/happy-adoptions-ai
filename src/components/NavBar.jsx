'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from '@/i18n/useTranslations';

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { role, clearRole, mounted } = useRole();
  const t = useTranslations('nav');
  const tc = useTranslations('common');

  const ADOPTER_NAV = [
    { href: '/',       icon: '🏠', label: t('home') },
    { href: '/quiz',   icon: '🐾', label: t('findADog') },
    { href: '/results',icon: '📄', label: t('myResults') },
    { href: '/dashboard', icon: '👤', label: t('myAccount'), authRequired: true },
  ];

  const VOLUNTEER_NAV = [
    { href: '/',          icon: '🏠', label: t('home') },
    { href: '/assess',    icon: '🤖', label: t('assessADog') },
    { href: '/post-a-dog',icon: '📋', label: t('postADog') },
    { href: '/shelters',  icon: '🏡', label: t('shelters') },
    { href: '/dashboard', icon: '👤', label: t('myAccount'), authRequired: true },
  ];

  const items = role === 'volunteer' ? VOLUNTEER_NAV : ADOPTER_NAV;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="sidebar-nav">
        <div className="sidebar-logo">🐾 {t('logo')}</div>

        {mounted && role && (
          <div style={{ padding: '0 16px 12px', marginTop: -4 }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              background: role === 'volunteer' ? 'var(--sun-light, #fff7e6)' : 'var(--leaf-light, #edf7ee)',
              padding: '2px 8px', borderRadius: 99,
            }}>
              {role === 'volunteer' ? `🤝 ${t('volunteer')}` : `🏠 ${t('adopter')}`}
            </span>
          </div>
        )}

        <div className="sidebar-items">
          <div className="sidebar-section">{role === 'volunteer' ? t('volunteer') : t('adopt')}</div>
          {items.filter(i => !i.authRequired || user).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sideitem ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="sideitem-icon">{item.icon}</span>
              <span className="sideitem-label">{item.label}</span>
            </Link>
          ))}
          {!user && (
            <Link href="/login" className={`sideitem ${pathname === '/login' ? 'active' : ''}`}>
              <span className="sideitem-icon">🔑</span>
              <span className="sideitem-label">{tc('signIn')}</span>
            </Link>
          )}
        </div>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-footer-row">
              <button className="sidebar-logout-btn" onClick={logout}>
                {user.email} · {tc('signOut')}
              </button>
            </div>
          )}
          {mounted && role && (
            <div className="sidebar-footer-row" style={{ marginTop: 8 }}>
              <button
                className="sidebar-logout-btn"
                onClick={clearRole}
                style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                {tc('switchRole')}
              </button>
            </div>
          )}
          <div className="sidebar-footer-row" style={{ marginTop: 8, justifyContent: 'flex-start', gap: 8 }}>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="nav-mobile-bar">
        <div className="nav-logo">🐾 {t('logo')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageSwitcher />
          <ThemeToggle />
          {!user && (
            <Link href="/login" className="btn btn-sm btn-sun">{tc('signIn')}</Link>
          )}
        </div>
      </div>
    </>
  );
}
