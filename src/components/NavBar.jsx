'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';

const ADOPTER_NAV = [
  { href: '/',       icon: '🏠', label: 'Home' },
  { href: '/quiz',   icon: '🐾', label: 'Find a Dog' },
  { href: '/results',icon: '📄', label: 'My Results' },
];

const VOLUNTEER_NAV = [
  { href: '/',          icon: '🏠', label: 'Home' },
  { href: '/assess',    icon: '🤖', label: 'Assess a Dog' },
  { href: '/post-a-dog',icon: '📋', label: 'Post a Dog' },
  { href: '/shelters',  icon: '🏡', label: 'Shelters' },
  { href: '/dashboard', icon: '👤', label: 'My Account', authRequired: true },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { role, clearRole, mounted } = useRole();

  const items = role === 'volunteer' ? VOLUNTEER_NAV : ADOPTER_NAV;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="sidebar-nav">
        <div className="sidebar-logo">🐾 Happy Adoptions</div>

        {mounted && role && (
          <div style={{ padding: '0 16px 12px', marginTop: -4 }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              background: role === 'volunteer' ? 'var(--sun-light, #fff7e6)' : 'var(--leaf-light, #edf7ee)',
              padding: '2px 8px', borderRadius: 99,
            }}>
              {role === 'volunteer' ? '🤝 Volunteer' : '🏠 Adopter'}
            </span>
          </div>
        )}

        <div className="sidebar-items">
          <div className="sidebar-section">{role === 'volunteer' ? 'Volunteer' : 'Adopt'}</div>
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
          {role === 'volunteer' && !user && (
            <Link href="/login" className={`sideitem ${pathname === '/login' ? 'active' : ''}`}>
              <span className="sideitem-icon">🔑</span>
              <span className="sideitem-label">Sign In</span>
            </Link>
          )}
        </div>

        <div className="sidebar-footer">
          {user && role === 'volunteer' && (
            <div className="sidebar-footer-row">
              <button className="sidebar-logout-btn" onClick={logout}>
                {user.email} · Sign out
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
                Switch role
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="nav-mobile-bar">
        <div className="nav-logo">🐾 Happy Adoptions</div>
        {role === 'volunteer' && !user && (
          <Link href="/login" className="btn btn-sm btn-sun">Sign In</Link>
        )}
      </div>
    </>
  );
}
