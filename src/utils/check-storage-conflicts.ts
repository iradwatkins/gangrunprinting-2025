// Diagnostic utility to check for localStorage conflicts with Docker Supabase

export function checkStorageConflicts() {
  console.log('=== Checking for Storage Conflicts ===');
  
  // Check all localStorage keys
  const localStorageKeys = Object.keys(localStorage);
  console.log('localStorage keys:', localStorageKeys);
  
  // Look for Supabase auth keys
  const supabaseKeys = localStorageKeys.filter(key => 
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('sb-')
  );
  
  console.log('Supabase-related keys:', supabaseKeys);
  
  // Check each Supabase key
  supabaseKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`\nKey: ${key}`);
    
    try {
      const parsed = JSON.parse(value || '{}');
      
      // Check for localhost URLs in the data
      const stringified = JSON.stringify(parsed);
      if (stringified.includes('localhost') || 
          stringified.includes('127.0.0.1') || 
          stringified.includes(':54321') ||
          stringified.includes(':54322')) {
        console.warn('⚠️  Found localhost reference in:', key);
        console.log('Data:', parsed);
      } else if (stringified.includes('dprvugzbsqcufitbxkda.supabase.co')) {
        console.log('✅ Using production Supabase');
      }
      
      // Check for session expiry
      if (parsed.expires_at) {
        const expiresAt = new Date(parsed.expires_at * 1000);
        const now = new Date();
        if (expiresAt < now) {
          console.warn('⚠️  Session expired at:', expiresAt);
        } else {
          console.log('✅ Session valid until:', expiresAt);
        }
      }
    } catch (e) {
      console.log('Could not parse value');
    }
  });
  
  // Check for conflicting auth tokens
  const authTokenKey = 'sb-dprvugzbsqcufitbxkda-auth-token';
  const localAuthTokenKey = 'sb-localhost-auth-token';
  
  if (localStorage.getItem(localAuthTokenKey)) {
    console.warn('\n⚠️  Found localhost auth token! This might cause conflicts.');
    console.log('Recommendation: Clear this token');
  }
  
  console.log('\n=== End Storage Check ===');
}

// Function to clear potentially conflicting storage
export function clearConflictingStorage() {
  const keysToRemove: string[] = [];
  
  Object.keys(localStorage).forEach(key => {
    // Remove any localhost-related Supabase keys
    if ((key.includes('sb-localhost') || 
         key.includes('sb-127.0.0.1') ||
         key.includes('sb-:54321') ||
         key.includes('sb-:54322'))) {
      keysToRemove.push(key);
    }
  });
  
  if (keysToRemove.length > 0) {
    console.log('Removing conflicting keys:', keysToRemove);
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  }
  
  return false;
}