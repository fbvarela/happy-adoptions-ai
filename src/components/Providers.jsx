'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { RoleProvider } from '@/context/RoleContext';
import { LocaleProvider } from '@/context/LocaleContext';

export function Providers({ children }) {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <RoleProvider>
              {children}
            </RoleProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
