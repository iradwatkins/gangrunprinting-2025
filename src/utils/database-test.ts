import { supabase } from '@/integrations/supabase/client';

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection with a simple query
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.error('Database connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Database connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function testTableExists(tableName: string) {
  try {
    console.log(`Testing if table '${tableName}' exists...`);
    
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
      console.error(`Table '${tableName}' error:`, error);
      return { exists: false, error: error.message };
    }
    
    console.log(`Table '${tableName}' exists and is accessible`);
    return { exists: true, data };
  } catch (error) {
    console.error(`Table '${tableName}' test failed:`, error);
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function testAllAdminTables() {
  const tables = ['coatings', 'print_sizes', 'turnaround_times', 'add_ons', 'quantities', 'sides', 'paper_stocks'];
  const results: Record<string, { exists: boolean; error?: string }> = {};
  
  for (const table of tables) {
    const result = await testTableExists(table);
    results[table] = result;
  }
  
  return results;
}