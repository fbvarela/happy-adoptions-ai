'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';

const ADOPTER_ITEMS = [
  { href: '/',        icon: '🏠', label: 'Home' },
  { href: '/quiz',    icon: '🐾', label: 'Find' },
  { href: '/results', icon: '📄', label: 'Results' },
];

const VOLUNTEER_ITEMS = [
  { href: '/',           icon: '🏠', label: 'Home' },
  { href: '/assess',     icon: '🤖', label: 'Assess' },
  { href: '/post-a-dog', icon: '📋', label: 'Post' },
  { href: '/shelters',   icon: '🏡', label: 'Shelters' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { role, mounted } = useRole();

  const baseItems = role === 'volunteer' ? VOLUNTEER_ITEMS : ADOPTER_ITEMS;

  const items = role === 'volunteer'
    ? [...baseItems, { href: user ? '/dashboard' : '/login', icon: '👤', label: user ? 'Account' : 'Sign in' }]
    : baseItems;

  if (!mounted) return <nav className="bottom-nav" />;

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`bottom-nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
