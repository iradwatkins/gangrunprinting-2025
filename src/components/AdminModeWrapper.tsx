import React from 'react';

interface AdminModeWrapperProps {
  children: React.ReactNode;
}

// Simplified wrapper - no longer needed since we use separate routes
export function AdminModeWrapper({ children }: AdminModeWrapperProps) {
  return <>{children}</>;
}