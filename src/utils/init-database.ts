import { supabase } from '@/integrations/supabase/client';

export async function initializePaperStocksTable() {
  try {
    // Test if paper_stocks table exists and we can query it
    const { data: testData, error: testError } = await supabase
      .from('paper_stocks')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Paper stocks table test failed:', testError);
      
      // Try to create a basic paper stock to test table structure
      const { data: createTest, error: createError } = await supabase
        .from('paper_stocks')
        .insert({
          name: 'Test Paper Stock',
          weight: 300,
          price_per_sq_inch: 0.008,
          description: 'Test paper stock',
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create test paper stock:', createError);
        return { success: false, error: createError.message };
      } else {
        // Clean up test record
        await supabase.from('paper_stocks').delete().eq('id', createTest.id);
        console.log('Paper stocks table is working correctly');
        return { success: true };
      }
    }

    console.log('Paper stocks table is accessible');
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createBasicPaperStocks() {
  const basicStocks = [
    {
      name: '14pt Card Stock',
      weight: 350,
      price_per_sq_inch: 0.008,
      description: 'Premium thick card stock perfect for business cards and postcards',
      is_active: true
    },
    {
      name: '100lb Text Paper',
      weight: 148,
      price_per_sq_inch: 0.005,
      description: 'High-quality text weight paper for flyers and brochures',
      is_active: true
    },
    {
      name: '80lb Cover Stock',
      weight: 216,
      price_per_sq_inch: 0.006,
      description: 'Durable cover stock for folders and presentations',
      is_active: true
    }
  ];

  const results = [];
  for (const stock of basicStocks) {
    try {
      // Check if this stock already exists
      const { data: existing } = await supabase
        .from('paper_stocks')
        .select('id')
        .eq('name', stock.name)
        .single();

      if (!existing) {
        const { data, error } = await supabase
          .from('paper_stocks')
          .insert(stock)
          .select()
          .single();

        if (error) {
          console.error(`Failed to create ${stock.name}:`, error);
          results.push({ name: stock.name, success: false, error: error.message });
        } else {
          console.log(`Created paper stock: ${stock.name}`);
          results.push({ name: stock.name, success: true, data });
        }
      } else {
        console.log(`Paper stock already exists: ${stock.name}`);
        results.push({ name: stock.name, success: true, existing: true });
      }
    } catch (error) {
      console.error(`Error creating ${stock.name}:`, error);
      results.push({ 
        name: stock.name, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return results;
}