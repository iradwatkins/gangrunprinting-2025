import { supabase } from '@/integrations/supabase/client';

export async function applyEnhancedSidesMigration() {
  console.log('🔄 Applying enhanced sides migration...');
  
  try {
    // Check if the columns already exist
    const { data: existingColumns, error: checkError } = await supabase
      .from('paper_stocks')
      .select('different_image_both_sides_available')
      .limit(1);
    
    if (checkError && checkError.code === '42703') {
      console.log('📝 Columns do not exist, applying migration...');
      
      // Apply the migration SQL
      const migrationSQL = `
        -- Add new enhanced sides option fields
        ALTER TABLE public.paper_stocks 
        ADD COLUMN IF NOT EXISTS different_image_both_sides_available BOOLEAN DEFAULT true;

        ALTER TABLE public.paper_stocks 
        ADD COLUMN IF NOT EXISTS different_image_both_sides_markup DECIMAL(5,2) DEFAULT 1.00;

        ALTER TABLE public.paper_stocks 
        ADD COLUMN IF NOT EXISTS same_image_both_sides_available BOOLEAN DEFAULT true;

        ALTER TABLE public.paper_stocks 
        ADD COLUMN IF NOT EXISTS same_image_both_sides_markup DECIMAL(5,2) DEFAULT 1.00;

        ALTER TABLE public.paper_stocks 
        ADD COLUMN IF NOT EXISTS image_front_only_available BOOLEAN DEFAULT true;

        ALTER TABLE public.paper_stocks 
        ADD COLUMN IF NOT EXISTS image_front_only_markup DECIMAL(5,2) DEFAULT 1.00;

        ALTER TABLE public.paper_stocks 
        ADD COLUMN IF NOT EXISTS your_design_front_our_back_available BOOLEAN DEFAULT true;

        ALTER TABLE public.paper_stocks 
        ADD COLUMN IF NOT EXISTS your_design_front_our_back_markup DECIMAL(5,2) DEFAULT 1.00;

        -- Update existing paper stocks to have default values for new fields
        UPDATE public.paper_stocks 
        SET 
          different_image_both_sides_available = true,
          different_image_both_sides_markup = 1.00,
          same_image_both_sides_available = true,
          same_image_both_sides_markup = 1.00,
          image_front_only_available = true,
          image_front_only_markup = 1.00,
          your_design_front_our_back_available = true,
          your_design_front_our_back_markup = 1.00
        WHERE 
          different_image_both_sides_available IS NULL 
          OR same_image_both_sides_available IS NULL 
          OR image_front_only_available IS NULL 
          OR your_design_front_our_back_available IS NULL;
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
      
      if (error) {
        console.error('❌ Migration failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Migration applied successfully');
      return { success: true };
    } else {
      console.log('✅ Migration already applied');
      return { success: true };
    }
  } catch (error) {
    console.error('💥 Migration error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Alternative simple approach - just add the columns if they don't exist
export async function ensureSidesColumns() {
  console.log('🔄 Ensuring sides columns exist...');
  
  try {
    // Try to select the new columns to check if they exist
    const { error } = await supabase
      .from('paper_stocks')
      .select('different_image_both_sides_available, different_image_both_sides_markup, same_image_both_sides_available, same_image_both_sides_markup, image_front_only_available, image_front_only_markup, your_design_front_our_back_available, your_design_front_our_back_markup')
      .limit(1);
    
    if (error) {
      console.warn('⚠️ Enhanced sides columns may not exist:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Enhanced sides columns exist');
    return { success: true };
  } catch (error) {
    console.error('💥 Column check error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}