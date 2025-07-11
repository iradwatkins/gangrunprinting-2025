import { supabase } from '@/integrations/supabase/client';

export async function insertTestDataWithVerification() {
  const results = {
    inserted: {} as Record<string, any>,
    verified: {} as Record<string, any>,
    errors: [] as string[]
  };

  try {
    console.log('🚀 Starting test data insertion with verification...');
    console.log('📍 Connected to Supabase:', supabase.supabaseUrl);

    // 1. INSERT AND VERIFY CATEGORIES
    console.log('\n📁 INSERTING CATEGORIES...');
    const categories = [
      { 
        name: 'Business Cards', 
        slug: 'business-cards', 
        description: 'Professional business cards for networking and branding', 
        is_active: true, 
        sort_order: 1 
      },
      { 
        name: 'Flyers', 
        slug: 'flyers', 
        description: 'Marketing flyers for promotions and events', 
        is_active: true, 
        sort_order: 2 
      },
      { 
        name: 'Brochures', 
        slug: 'brochures', 
        description: 'Folded brochures for detailed product information', 
        is_active: true, 
        sort_order: 3 
      },
    ];

    const { data: catInserted, error: catError } = await supabase
      .from('product_categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (catError) {
      console.error('❌ Category insert error:', catError);
      results.errors.push(`Categories: ${catError.message}`);
    } else {
      console.log('✅ Categories inserted:', catInserted);
      results.inserted.categories = catInserted;

      // Verify by querying back
      const { data: catVerified, error: catVerifyError } = await supabase
        .from('product_categories')
        .select('*')
        .in('slug', ['business-cards', 'flyers', 'brochures'])
        .order('created_at', { ascending: false });

      if (catVerifyError) {
        console.error('❌ Category verify error:', catVerifyError);
      } else {
        console.log('✅ VERIFIED from database:', catVerified);
        results.verified.categories = catVerified;
      }
    }

    // 2. INSERT AND VERIFY VENDORS
    console.log('\n🏢 INSERTING VENDORS...');
    const vendors = [
      { 
        name: 'PrintPro Solutions', 
        contact_email: 'orders@printpro.com', 
        phone: '555-0100', 
        is_active: true,
      },
      {
        name: 'QuickPrint Express',
        contact_email: 'support@quickprint.com',
        phone: '555-0200',
        is_active: true,
      }
    ];

    const { data: vendorInserted, error: vendorError } = await supabase
      .from('vendors')
      .upsert(vendors, { onConflict: 'name' })
      .select();

    if (vendorError) {
      console.error('❌ Vendor insert error:', vendorError);
      results.errors.push(`Vendors: ${vendorError.message}`);
    } else {
      console.log('✅ Vendors inserted:', vendorInserted);
      results.inserted.vendors = vendorInserted;

      // Verify
      const { data: vendorVerified } = await supabase
        .from('vendors')
        .select('*')
        .in('name', ['PrintPro Solutions', 'QuickPrint Express']);
      
      console.log('✅ VERIFIED vendors from database:', vendorVerified);
      results.verified.vendors = vendorVerified;
    }

    // 3. INSERT AND VERIFY PAPER STOCKS
    console.log('\n📄 INSERTING PAPER STOCKS...');
    const paperStocks = [
      { name: '100lb Gloss Text', weight: 100, finish: 'Gloss', color: 'White', is_active: true },
      { name: '14pt C2S', weight: 140, finish: 'Coated 2 Sides', color: 'White', is_active: true },
    ];

    const { data: paperInserted, error: paperError } = await supabase
      .from('paper_stocks')
      .upsert(paperStocks, { onConflict: 'name' })
      .select();

    if (paperError) {
      console.error('❌ Paper stock insert error:', paperError);
      results.errors.push(`Paper stocks: ${paperError.message}`);
    } else {
      console.log('✅ Paper stocks inserted:', paperInserted);
      results.inserted.paperStocks = paperInserted;

      // Verify
      const { data: paperVerified } = await supabase
        .from('paper_stocks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('✅ VERIFIED paper stocks from database:', paperVerified);
      results.verified.paperStocks = paperVerified;
    }

    // 4. CHECK TOTAL COUNTS
    console.log('\n📊 VERIFYING TOTAL COUNTS...');
    
    const { count: catCount } = await supabase
      .from('product_categories')
      .select('*', { count: 'exact', head: true });
    
    const { count: vendorCount } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });
    
    const { count: paperCount } = await supabase
      .from('paper_stocks')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Database Record Counts:');
    console.log(`   - Categories: ${catCount}`);
    console.log(`   - Vendors: ${vendorCount}`);
    console.log(`   - Paper Stocks: ${paperCount}`);

    // 5. RETURN SUMMARY
    console.log('\n🎉 INSERTION AND VERIFICATION COMPLETE!');
    console.log('📋 Summary:', {
      totalInserted: {
        categories: results.inserted.categories?.length || 0,
        vendors: results.inserted.vendors?.length || 0,
        paperStocks: results.inserted.paperStocks?.length || 0
      },
      totalVerified: {
        categories: results.verified.categories?.length || 0,
        vendors: results.verified.vendors?.length || 0,
        paperStocks: results.verified.paperStocks?.length || 0
      },
      errors: results.errors.length
    });

    return results;
  } catch (error) {
    console.error('❌ Fatal error:', error);
    results.errors.push(`Fatal: ${error}`);
    return results;
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).insertTestDataWithVerification = insertTestDataWithVerification;
}