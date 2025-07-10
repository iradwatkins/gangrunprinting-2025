// Manual cleanup utility for authentication issues
// Can be run from browser console: window.cleanupAuth()

import { supabase } from '@/integrations/supabase/client';

export async function cleanupAuth() {
  console.log('🧹 Starting authentication cleanup...');
  
  // 1. Clear all Supabase-related localStorage
  const keysToRemove: string[] = [];
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
      keysToRemove.push(key);
    }
  });
  
  console.log(`Found ${keysToRemove.length} auth-related keys to clear`);
  keysToRemove.forEach(key => {
    console.log(`  - Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  // 2. Clear sessionStorage
  sessionStorage.clear();
  console.log('✅ Cleared sessionStorage');
  
  // 3. Sign out from Supabase
  try {
    await supabase.auth.signOut();
    console.log('✅ Signed out from Supabase');
  } catch (error) {
    console.error('Error signing out:', error);
  }
  
  // 4. Clear any admin mode flags
  localStorage.removeItem('adminMode');
  console.log('✅ Cleared admin mode');
  
  // 5. Reload the page to reset all state
  console.log('🔄 Reloading page in 2 seconds...');
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).cleanupAuth = cleanupAuth;
}