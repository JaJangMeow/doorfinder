import { supabase } from '@/lib/supabase';

/**
 * This script fetches and displays all tables in your Supabase database
 */
async function main() {
  console.log('Connecting to Supabase project: doodFinder');
  
  try {
    // Method 1: Direct SQL Query to list tables
    console.log('\n--- Method 1: Using direct SQL query ---');
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error fetching tables with method 1:', tablesError);
    } else {
      console.log('Tables found:', tablesData.length);
      tablesData.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    }
    
    // Method 2: Using RLS bypass with service role to execute raw SQL
    console.log('\n--- Method 2: Using raw SQL query ---');
    const { data: sqlData, error: sqlError } = await supabase
      .rpc('pgcall', {
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
      });
    
    if (sqlError) {
      console.error('Error fetching tables with method 2:', sqlError);
    } else {
      console.log('Tables found:', sqlData.length);
      sqlData.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    }
    
    // Method 3: List available tables by trying to access system tables
    console.log('\n--- Method 3: System information ---');
    const { data: systemData, error: systemError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (systemError) {
      console.error('Error fetching tables with method 3:', systemError);
    } else {
      console.log('Tables found:', systemData.length);
      systemData.forEach((table, index) => {
        console.log(`${index + 1}. ${table.tablename}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Execute the main function
main()
  .then(() => {
    console.log('\nCompleted fetching tables.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  }); 