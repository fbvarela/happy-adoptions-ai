'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { RoleProvider } from '@/context/RoleContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <AppProvider>
        <RoleProvider>
          {children}
        </RoleProvider>
      </AppProvider>
    </AuthProvider>
  );
}
