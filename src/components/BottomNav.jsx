'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { useTranslations } from '@/i18n/useTranslations';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { role, mounted } = useRole();
  const t = useTranslations('nav');
  const tc = useTranslations('common');

  const ADOPTER_ITEMS = [
    { href: '/',        icon: '🏠', label: t('home') },
    { href: '/quiz',    icon: '🐾', label: t('find') },
    { href: '/results', icon: '📄', label: t('results') },
  ];

  const VOLUNTEER_ITEMS = [
    { href: '/',           icon: '🏠', label: t('home') },
    { href: '/assess',     icon: '🤖', label: t('assess') },
    { href: '/post-a-dog', icon: '📋', label: t('post') },
    { href: '/shelters',   icon: '🏡', label: t('shelters') },
  ];

  const baseItems = role === 'volunteer' ? VOLUNTEER_ITEMS : ADOPTER_ITEMS;

  const items = [...baseItems, {
    href: user ? '/dashboard' : '/login',
    icon: '👤',
    label: user ? t('account') : tc('signIn'),
  }];

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
