import { supabase } from '@/integrations/supabase/client';

// This version only inserts into tables that definitely exist
export async function insertSafeTestData() {
  console.log('🚀 Starting SAFE test data insertion...');
  console.log('📍 Only inserting into confirmed existing tables');
  
  const results = {
    success: true,
    inserted: 0,
    errors: [] as string[]
  };

  try {
    // 1. Test with quantities table (which seems to have RLS issues)
    console.log('\n📝 Testing quantities table...');
    try {
      // First, let's just try to read
      const { data: existingQty, error: readError } = await supabase
        .from('quantities')
        .select('*')
        .limit(1);
      
      if (readError) {
        console.error('Cannot read quantities:', readError.message);
        results.errors.push(`Quantities read error: ${readError.message}`);
      } else {
        console.log('✅ Can read quantities table');
        
        // Try to insert if we can read
        const newQty = { quantity: 75, is_active: true, sort_order: 10 };
        const { data: insertedQty, error: insertError } = await supabase
          .from('quantities')
          .insert(newQty)
          .select()
          .single();
        
        if (insertError) {
          console.error('Cannot insert into quantities:', insertError.message);
          results.errors.push(`Quantities insert error: ${insertError.message}`);
        } else {
          console.log('✅ Inserted quantity:', insertedQty);
          results.inserted++;
          
          // Clean up test data
          if (insertedQty?.id) {
            await supabase.from('quantities').delete().eq('id', insertedQty.id);
          }
        }
      }
    } catch (err: any) {
      console.error('Quantities table error:', err);
      results.errors.push(`Quantities exception: ${err.message}`);
    }

    // 2. Insert more paper stocks
    console.log('\n📝 Inserting paper stocks...');
    const paperStocks = [
      { name: 'Recycled 100lb', weight: '100lb', finish: 'Uncoated', color: 'Natural', is_active: true, sort_order: 7 },
      { name: 'Glossy Photo Paper', weight: '200lb', finish: 'High Gloss', color: 'White', is_active: true, sort_order: 8 }
    ];

    for (const stock of paperStocks) {
      try {
        const { data, error } = await supabase
          .from('paper_stocks')
          .insert(stock)
          .select()
          .single();
        
        if (error) {
          console.error(`Error inserting ${stock.name}:`, error.message);
          results.errors.push(`Paper stock ${stock.name}: ${error.message}`);
        } else {
          console.log(`✅ Inserted paper stock: ${stock.name}`);
          results.inserted++;
        }
      } catch (err: any) {
        results.errors.push(`Paper stock exception: ${err.message}`);
      }
    }

    // 3. Insert more add-ons
    console.log('\n📝 Inserting add-ons...');
    const addOns = [
      { 
        name: 'Lamination', 
        description: 'Protective lamination coating', 
        base_price: 0.10, 
        price_type: 'per_piece',
        is_percentage: false,
        percentage_value: null,
        is_active: true, 
        sort_order: 7,
        has_sub_options: false
      },
      { 
        name: 'Hole Punching', 
        description: '3-hole punch for binders', 
        base_price: 15.00, 
        price_type: 'flat_fee',
        is_percentage: false,
        percentage_value: null,
        is_active: true, 
        sort_order: 8,
        has_sub_options: false
      }
    ];

    for (const addon of addOns) {
      try {
        const { data, error } = await supabase
          .from('add_ons')
          .insert(addon)
          .select()
          .single();
        
        if (error) {
          console.error(`Error inserting ${addon.name}:`, error.message);
          results.errors.push(`Add-on ${addon.name}: ${error.message}`);
        } else {
          console.log(`✅ Inserted add-on: ${addon.name}`);
          results.inserted++;
        }
      } catch (err: any) {
        results.errors.push(`Add-on exception: ${err.message}`);
      }
    }

    // 4. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Successfully inserted: ${results.inserted} records`);
    console.log(`❌ Errors encountered: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n⚠️ ERRORS:');
      results.errors.forEach(err => console.log(`  - ${err}`));
      
      if (results.errors.some(e => e.includes('infinite recursion') || e.includes('policy'))) {
        console.log('\n🔧 TO FIX RLS ERRORS:');
        console.log('1. Go to Supabase SQL Editor');
        console.log('2. Run the contents of: supabase/fix_user_profiles_rls.sql');
        console.log('3. This will fix the infinite recursion in RLS policies');
      }
    }

    return results;

  } catch (error: any) {
    console.error('Fatal error:', error);
    results.success = false;
    results.errors.push(`Fatal: ${error.message}`);
    return results;
  }
}

// Make it available globally
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).insertSafeTestData = insertSafeTestData;
  console.log('💡 Safe test data function available: insertSafeTestData()');
}