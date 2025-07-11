import { supabase } from '@/integrations/supabase/client';

// Quick fix for auth loading issues
export async function fixAuthLoading() {
  console.log('🔧 Fixing auth loading issue...');
  
  try {
    // Sign out to clear any problematic sessions
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
    } else {
      console.log('✅ Signed out successfully');
    }
    
    // Clear all local storage related to auth
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed ${key}`);
    });
    
    // Clear session storage too
    sessionStorage.clear();
    
    console.log('✅ Auth data cleared. Refreshing page...');
    
    // Reload the page
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('Error fixing auth:', error);
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).fixAuthLoading = fixAuthLoading;
  console.log('💡 Auth fix available: fixAuthLoading()');
}