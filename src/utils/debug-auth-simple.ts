// Simple authentication debugger - run in browser console
// Copy and paste this entire function in the browser console on https://gangrunprinting.com/

export function debugAuthNow() {
  console.log('🔍 === AUTHENTICATION DEBUG START ===');
  
  // 1. Check if we're on the right site
  console.log(`🌐 Current URL: ${window.location.href}`);
  console.log(`🌐 Domain: ${window.location.hostname}`);
  
  // 2. Check localStorage for Supabase auth tokens
  const authKey = 'sb-dprvugzbsqcufitbxkda-auth-token';
  const authToken = localStorage.getItem(authKey);
  
  console.log(`🔑 Auth Token Key: ${authKey}`);
  console.log(`🔑 Auth Token Exists: ${!!authToken}`);
  
  if (authToken) {
    try {
      const parsed = JSON.parse(authToken);
      console.log(`👤 User Email: ${parsed.user?.email || 'Not found'}`);
      console.log(`⏰ Token Expires: ${new Date(parsed.expires_at * 1000)}`);
      console.log(`🕐 Current Time: ${new Date()}`);
      console.log(`✅ Token Valid: ${new Date(parsed.expires_at * 1000) > new Date()}`);
    } catch (e) {
      console.error('❌ Error parsing auth token:', e);
    }
  } else {
    console.log('❌ No auth token found in localStorage');
  }
  
  // 3. Check all localStorage keys for anything Supabase-related
  console.log('\n📦 All localStorage keys:');
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
    }
  });
  
  // 4. Check if React components are loaded
  console.log('\n⚛️ React state (if available):');
  if (window.React) {
    console.log('✅ React is loaded');
  } else {
    console.log('❌ React not found');
  }
  
  // 5. Check for any auth errors in console
  console.log('\n🐛 Check browser console for any red error messages above this');
  
  // 6. Test Supabase connection
  console.log('\n🔗 Testing Supabase connection...');
  if (window.supabase) {
    window.supabase.auth.getSession().then(({ data, error }) => {
      console.log(`📡 Supabase Session Data:`, data?.session?.user?.email || 'No user');
      console.log(`📡 Supabase Session Error:`, error?.message || 'No error');
    }).catch(err => {
      console.error('❌ Supabase connection failed:', err);
    });
  } else {
    console.log('❌ Supabase client not found on window object');
  }
  
  console.log('\n=== AUTHENTICATION DEBUG END ===');
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Check if auth token exists and is valid');
  console.log('2. Look for any red error messages in console');
  console.log('3. Try signing out and signing in again');
  console.log('4. If token exists but UI not updating, it might be a React state issue');
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).debugAuthNow = debugAuthNow;
}