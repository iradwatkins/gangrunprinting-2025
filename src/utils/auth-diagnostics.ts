import { supabase } from '@/integrations/supabase/client';

export async function runAuthDiagnostics() {
  console.log('=== Running Auth Diagnostics ===');
  
  try {
    // 1. Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Auth check failed:', userError);
      return { success: false, error: 'Not authenticated' };
    }
    
    if (!user) {
      console.log('❌ No user found');
      return { success: false, error: 'No user session' };
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // 2. Try to fetch profile directly
    console.log('Attempting direct profile fetch...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Direct profile fetch failed:', profileError);
      
      // 3. Try RPC function
      console.log('Attempting RPC profile fetch...');
      const { data: rpcProfile, error: rpcError } = await supabase
        .rpc('get_or_create_profile');
      
      if (rpcError) {
        console.error('❌ RPC profile fetch failed:', rpcError);
        
        // 4. Try to create profile
        console.log('Attempting to create profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            role: 'customer',
            is_broker: false,
            broker_category_discounts: {}
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Profile creation failed:', createError);
          return { success: false, error: 'Cannot create profile - likely RLS issue' };
        }
        
        console.log('✅ Profile created:', newProfile);
        return { success: true, profile: newProfile };
      }
      
      console.log('✅ Profile fetched via RPC:', rpcProfile);
      return { success: true, profile: rpcProfile };
    }
    
    console.log('✅ Profile fetched directly:', profile);
    return { success: true, profile };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error: String(error) };
  }
}

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).runAuthDiagnostics = runAuthDiagnostics;
}