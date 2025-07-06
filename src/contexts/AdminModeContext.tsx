import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminModeContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  canUseAdminMode: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

interface AdminModeProviderProps {
  children: React.ReactNode;
  userRole?: string;
}

export function AdminModeProvider({ children, userRole }: AdminModeProviderProps) {
  const [isAdminMode, setIsAdminMode] = useState(() => {
    const saved = localStorage.getItem('adminMode');
    return saved === 'true';
  });

  const canUseAdminMode = userRole === 'admin' || process.env.NODE_ENV === 'development';

  const toggleAdminMode = () => {
    if (!canUseAdminMode) return;
    
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    localStorage.setItem('adminMode', newMode.toString());
  };

  // Reset admin mode if user loses admin privileges
  useEffect(() => {
    if (!canUseAdminMode && isAdminMode) {
      setIsAdminMode(false);
      localStorage.setItem('adminMode', 'false');
    }
  }, [canUseAdminMode, isAdminMode]);

  const value: AdminModeContextType = {
    isAdminMode,
    toggleAdminMode,
    canUseAdminMode,
  };

  return (
    <AdminModeContext.Provider value={value}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = useContext(AdminModeContext);
  if (context === undefined) {
    throw new Error('useAdminMode must be used within an AdminModeProvider');
  }
  return context;
}