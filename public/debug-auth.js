// Browser Console Authentication Debugger
// Paste this into your browser console to get immediate auth debugging info

(function() {
  console.log('🔍 Authentication Debug Report');
  console.log('====================================');
  
  // Check localStorage for Supabase auth token
  const authTokenKey = 'sb-dprvugzbsqcufitbxkda-auth-token';
  const authToken = localStorage.getItem(authTokenKey);
  
  console.log('📦 Local Storage:');
  console.log('  Auth Token Key:', authTokenKey);
  console.log('  Auth Token Present:', !!authToken);
  
  if (authToken) {
    try {
      const parsedToken = JSON.parse(authToken);
      console.log('  Token Data:', {
        hasAccessToken: !!parsedToken.access_token,
        hasRefreshToken: !!parsedToken.refresh_token,
        expiresAt: parsedToken.expires_at,
        isExpired: parsedToken.expires_at ? new Date(parsedToken.expires_at * 1000) < new Date() : 'unknown',
        user: parsedToken.user ? {
          id: parsedToken.user.id,
          email: parsedToken.user.email,
          role: parsedToken.user.role
        } : null
      });
    } catch (e) {
      console.log('  Token Parse Error:', e.message);
      console.log('  Raw Token:', authToken.substring(0, 100) + '...');
    }
  }
  
  // Check all localStorage keys for Supabase
  console.log('\n🗂️ All Supabase LocalStorage Keys:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('supabase') || key.includes('sb-')) {
      console.log(`  ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
    }
  }
  
  // Check sessionStorage
  console.log('\n📋 Session Storage:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      console.log(`  ${key}: ${sessionStorage.getItem(key)?.substring(0, 50)}...`);
    }
  }
  
  // Check for Supabase client
  console.log('\n🔌 Supabase Client:');
  if (window.supabase) {
    console.log('  Supabase client available:', !!window.supabase);
  } else {
    console.log('  Supabase client not found on window object');
  }
  
  // Check React context (if available)
  console.log('\n⚛️ React Context:');
  if (window.React && window.React.version) {
    console.log('  React version:', window.React.version);
  }
  
  // Network status
  console.log('\n🌐 Network Status:');
  console.log('  Online:', navigator.onLine);
  console.log('  User Agent:', navigator.userAgent);
  
  // Environment
  console.log('\n🔧 Environment:');
  console.log('  URL:', window.location.href);
  console.log('  Origin:', window.location.origin);
  console.log('  Host:', window.location.host);
  
  // Check for console errors
  console.log('\n❌ Recent Console Errors:');
  console.log('  Check the Console tab for any red error messages');
  console.log('  Look for authentication, network, or Supabase related errors');
  
  // Instructions
  console.log('\n📋 Next Steps:');
  console.log('1. Check if auth token exists and is valid');
  console.log('2. Look for any console errors in red');
  console.log('3. Check Network tab for failed auth requests');
  console.log('4. Use the Auth Debug button in the bottom-right corner for more details');
  
  console.log('\n✅ Debug report complete. Check above for any issues.');
})();

// Helper function to clear all auth data
window.clearAuthData = function() {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('  Removed:', key);
  });
  
  // Clear sessionStorage
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log('  Removed from session:', key);
  });
  
  console.log('✅ Auth data cleared. Refresh the page to start fresh.');
};

console.log('🛠️ Auth debugging utilities loaded:');
console.log('  Run clearAuthData() to clear all auth data');
console.log('  Use the Auth Debug button for real-time monitoring');