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
    const canUseAdminMode = userRole === 'admin' || process.env.NODE_ENV === 'development';
    
    // If user is admin and no preference is saved, default to admin mode
    if (canUseAdminMode && saved === null) {
      return true;
    }
    
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

  // Set default admin mode for admin users
  useEffect(() => {
    if (canUseAdminMode && localStorage.getItem('adminMode') === null) {
      setIsAdminMode(true);
      localStorage.setItem('adminMode', 'true');
    }
  }, [canUseAdminMode]);

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