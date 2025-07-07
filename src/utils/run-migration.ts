import { supabase } from '@/integrations/supabase/client';

const migrationSQL = `
-- Add missing quantities and sides tables for global options

-- Create quantities table
CREATE TABLE IF NOT EXISTS public.quantities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    value INTEGER, -- NULL for custom quantities
    is_custom BOOLEAN NOT NULL DEFAULT false,
    min_custom_value INTEGER, -- For custom quantities
    increment_value INTEGER, -- For custom quantities
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sides table
CREATE TABLE IF NOT EXISTS public.sides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000, -- Price multiplier
    tooltip_text TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at triggers (only if handle_updated_at function exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        EXECUTE 'CREATE TRIGGER quantities_updated_at
            BEFORE UPDATE ON public.quantities
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()';
        
        EXECUTE 'CREATE TRIGGER sides_updated_at
            BEFORE UPDATE ON public.sides
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.quantities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sides ENABLE ROW LEVEL SECURITY;

-- Create policies for quantities (public read access for active items)
CREATE POLICY "Public can view active quantities" ON public.quantities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active sides" ON public.sides
    FOR SELECT USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quantities_active ON public.quantities(is_active);
CREATE INDEX IF NOT EXISTS idx_sides_active ON public.sides(is_active);

-- Insert some default quantities
INSERT INTO public.quantities (name, value, is_custom, is_active) VALUES 
    ('25', 25, false, true),
    ('50', 50, false, true),
    ('100', 100, false, true),
    ('250', 250, false, true),
    ('500', 500, false, true),
    ('1000', 1000, false, true),
    ('2500', 2500, false, true),
    ('5000', 5000, false, true),
    ('10000', 10000, false, true),
    ('Custom', NULL, true, true)
ON CONFLICT DO NOTHING;

-- Insert some default sides
INSERT INTO public.sides (name, multiplier, tooltip_text, is_active) VALUES 
    ('Single Sided', 1.0000, 'Print on one side only', true),
    ('Double Sided', 1.8000, 'Print on both sides (front and back)', true)
ON CONFLICT DO NOTHING;
`;

export async function runMigration() {
  try {
    console.log('Running migration to create missing tables...');
    
    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Alternative approach: Execute each statement individually
export async function runMigrationStep() {
  try {
    console.log('Creating quantities table...');
    
    // Create quantities table
    const { error: quantitiesError } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS public.quantities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        value INTEGER,
        is_custom BOOLEAN NOT NULL DEFAULT false,
        min_custom_value INTEGER,
        increment_value INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );`
    });
    
    if (quantitiesError) {
      console.error('Failed to create quantities table:', quantitiesError);
      return { success: false, error: quantitiesError.message };
    }
    
    console.log('Creating sides table...');
    
    // Create sides table
    const { error: sidesError } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS public.sides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
        tooltip_text TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );`
    });
    
    if (sidesError) {
      console.error('Failed to create sides table:', sidesError);
      return { success: false, error: sidesError.message };
    }
    
    console.log('Tables created successfully');
    return { success: true };
  } catch (error) {
    console.error('Migration step error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}