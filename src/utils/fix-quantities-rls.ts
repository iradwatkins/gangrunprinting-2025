import { supabase } from '@/integrations/supabase/client';

export async function fixQuantitiesRLS() {
  try {
    console.log('🔧 Attempting to fix quantities RLS policy...');
    
    // First, check if we can run SQL commands
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop old policy if exists
        DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;
        
        -- Create new policy using is_admin field
        CREATE POLICY "Admin can manage quantity groups" ON public.quantities
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() 
                    AND is_admin = true
                )
            );
        
        -- Ensure public read access
        DROP POLICY IF EXISTS "Public can view active quantity groups" ON public.quantities;
        CREATE POLICY "Public can view active quantity groups" ON public.quantities
            FOR SELECT USING (is_active = true);
      `
    });
    
    if (error) {
      console.error('❌ Failed to fix RLS policy:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ RLS policy fixed successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Exception fixing RLS policy:', err);
    return { success: false, error: (err as Error).message };
  }
}

// Alternative: Manual instructions for the user
export function getRLSFixInstructions() {
  return `
To fix the quantities table RLS policy, run this SQL in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the following SQL:

-- Drop old policy
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;

-- Create new policy using is_admin field
CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Ensure public read access
DROP POLICY IF EXISTS "Public can view active quantity groups" ON public.quantities;
CREATE POLICY "Public can view active quantity groups" ON public.quantities
    FOR SELECT USING (is_active = true);

This will fix the admin permission check to use the correct is_admin field.
`;
}