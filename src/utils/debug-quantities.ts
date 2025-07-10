import { supabase } from '@/integrations/supabase/client';

export async function debugQuantitiesIssue() {
  console.log('🔍 Starting comprehensive quantities debug...');
  
  try {
    // 1. Check current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('1️⃣ Current user:', user?.email, authError);
    
    if (!user) {
      console.error('❌ No authenticated user');
      return;
    }
    
    // 2. Check if user_profiles table has the columns we need
    const { data: profileColumns, error: columnsError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(0);
    
    console.log('2️⃣ user_profiles columns check:', columnsError);
    
    // 3. Check user profile with correct column
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    console.log('3️⃣ User profile:', profile, profileError);
    console.log('   - has is_admin column?', profile?.hasOwnProperty('is_admin'));
    console.log('   - is_admin value:', profile?.is_admin);
    console.log('   - email:', profile?.email);
    
    // 4. Check if quantities table exists
    const { data: quantitiesCheck, error: quantitiesError } = await supabase
      .from('quantities')
      .select('count')
      .limit(1);
    
    console.log('4️⃣ Quantities table exists?', !quantitiesError, quantitiesError?.message);
    
    // 5. Try to select from quantities
    const { data: quantities, error: selectError } = await supabase
      .from('quantities')
      .select('*');
    
    console.log('5️⃣ Quantities select:', quantities?.length, selectError);
    
    // 6. Test RLS by trying to insert
    const testData = {
      name: `Debug Test ${Date.now()}`,
      values: '10,20,30',
      default_value: 20,
      has_custom: false,
      is_active: false
    };
    
    console.log('6️⃣ Attempting test insert...');
    const { data: insertResult, error: insertError } = await supabase
      .from('quantities')
      .insert(testData)
      .select()
      .single();
    
    console.log('   - Insert result:', insertResult, insertError);
    
    // Clean up test data if successful
    if (insertResult?.id) {
      await supabase.from('quantities').delete().eq('id', insertResult.id);
      console.log('   - Test data cleaned up');
    }
    
    // 7. Check the exact error when creating
    if (insertError) {
      console.log('7️⃣ Detailed insert error:');
      console.log('   - Code:', insertError.code);
      console.log('   - Message:', insertError.message);
      console.log('   - Details:', insertError.details);
      console.log('   - Hint:', insertError.hint);
    }
    
    // 8. Summary
    console.log('\n📊 SUMMARY:');
    console.log('- User authenticated:', !!user);
    console.log('- User email:', user?.email);
    console.log('- Profile found:', !!profile);
    console.log('- Has is_admin column:', profile?.hasOwnProperty('is_admin'));
    console.log('- Is admin:', profile?.is_admin);
    console.log('- Quantities table accessible:', !quantitiesError);
    console.log('- Can insert:', !!insertResult);
    
    return {
      user: user?.email,
      profile,
      hasAdminColumn: profile?.hasOwnProperty('is_admin'),
      isAdmin: profile?.is_admin,
      canAccessQuantities: !quantitiesError,
      canInsert: !!insertResult,
      error: insertError
    };
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return { error };
  }
}

// Export a function to run from console
(window as any).debugQuantities = debugQuantitiesIssue;