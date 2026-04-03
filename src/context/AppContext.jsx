'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [shelters, setShelters] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/shelters')
      .then(r => r.json())
      .then(setShelters)
      .catch(() => setShelters([]));
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <AppContext.Provider value={{ shelters, showToast }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#d94f3d' : 'var(--bark)',
          color: '#fff', padding: '10px 20px', borderRadius: 99,
          fontSize: '0.9rem', zIndex: 999, boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.2s',
        }}>
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
