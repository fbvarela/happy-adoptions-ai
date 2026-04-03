'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(null); // 'adopter' | 'volunteer' | null
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('adoption_role');
    if (saved === 'adopter' || saved === 'volunteer') setRoleState(saved);
    setMounted(true);
  }, []);

  const setRole = (r) => {
    localStorage.setItem('adoption_role', r);
    setRoleState(r);
  };

  const clearRole = () => {
    localStorage.removeItem('adoption_role');
    setRoleState(null);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, mounted }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
