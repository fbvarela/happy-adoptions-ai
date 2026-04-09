'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { RoleProvider } from '@/context/RoleContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <RoleProvider>
            {children}
          </RoleProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
