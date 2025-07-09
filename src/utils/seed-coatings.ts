import { supabase } from '@/integrations/supabase/client';

// Create the specific coating options that are needed
export async function seedCoatingOptions() {
  console.log('🌱 Seeding coating options...');
  
  const coatings = [
    {
      name: 'High Gloss UV',
      price_modifier: 0.15, // 15% price increase
      description: 'High gloss UV coating for premium finish',
      is_active: true
    },
    {
      name: 'High Gloss UV on ONE SIDE',
      price_modifier: 0.10, // 10% price increase 
      description: 'High gloss UV coating applied to one side only',
      is_active: true
    },
    {
      name: 'Gloss Aqueous',
      price_modifier: 0.08, // 8% price increase
      description: 'Gloss aqueous coating for smooth finish',
      is_active: true
    },
    {
      name: 'Matte Aqueous',
      price_modifier: 0.08, // 8% price increase
      description: 'Matte aqueous coating for subdued finish',
      is_active: true
    }
  ];

  try {
    // First, check if coatings already exist
    const { data: existingCoatings } = await supabase
      .from('coatings')
      .select('name')
      .in('name', coatings.map(c => c.name));
    
    console.log('Existing coatings:', existingCoatings);
    
    // Filter out coatings that already exist
    const newCoatings = coatings.filter(coating => 
      !existingCoatings?.some(existing => existing.name === coating.name)
    );
    
    if (newCoatings.length === 0) {
      console.log('✅ All coating options already exist');
      return { success: true, message: 'All coating options already exist' };
    }
    
    // Insert new coatings
    const { data, error } = await supabase
      .from('coatings')
      .insert(newCoatings)
      .select();
    
    if (error) {
      console.error('❌ Error seeding coatings:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Successfully seeded coating options:', data);
    return { success: true, data, message: `Created ${newCoatings.length} coating options` };
    
  } catch (error) {
    console.error('💥 Seed coatings error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get coatings with simplified auth
export async function getCoatingsDirectly() {
  console.log('🔄 Getting coatings directly...');
  
  try {
    // Add timeout to prevent hanging
    const queryPromise = supabase
      .from('coatings')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 8000)
    );
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('❌ Direct coatings fetch error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Direct coatings fetch successful:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('💥 Direct coatings fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}