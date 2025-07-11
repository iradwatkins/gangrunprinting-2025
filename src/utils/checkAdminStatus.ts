import { supabase } from '@/integrations/supabase/client';

export async function checkAdminStatus(): Promise<boolean> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('[checkAdminStatus] No authenticated user');
      return false;
    }
    
    // First check email directly
    if (user.email === 'iradwatkins@gmail.com') {
      console.log('[checkAdminStatus] Admin email detected');
      return true;
    }
    
    // Then check profile role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('[checkAdminStatus] Error fetching profile:', profileError);
      return false;
    }
    
    const isAdmin = profile?.role === 'admin';
    console.log('[checkAdminStatus] Profile role check:', { role: profile?.role, isAdmin });
    
    return isAdmin;
  } catch (error) {
    console.error('[checkAdminStatus] Unexpected error:', error);
    return false;
  }
}

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).checkAdminStatus = checkAdminStatus;
}