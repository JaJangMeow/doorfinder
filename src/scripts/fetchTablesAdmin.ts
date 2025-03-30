import { createClient } from '@supabase/supabase-js';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * This script uses the service role key to fetch all tables in your Supabase database
 */
async function main() {
  console.log('Connecting to Supabase project: doodFinder (with admin privileges)');
  
  try {
    // Direct SQL query to list all tables using admin privileges
    console.log('\n--- Fetching tables with admin privileges ---');
    const { data, error } = await supabaseAdmin
      .rpc('pgcall', {
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
      });
    
    if (error) {
      if (error.message.includes('function pgcall() does not exist')) {
        console.log('The pgcall function does not exist. Using alternative method...');
        const { data: directData, error: directError } = await supabaseAdmin
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (directError) {
          console.error('Error fetching tables with direct query:', directError);
        } else {
          console.log('Tables found:', directData.length);
          directData.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name}`);
          });
        }
      } else {
        console.error('Error fetching tables:', error);
      }
    } else {
      console.log('Tables found:', data.length);
      data.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    }
    
    // For each table, display its columns
    console.log('\n--- Fetching table schemas ---');
    await listTableColumns();
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * List columns for all tables
 */
async function listTableColumns() {
  try {
    // First, get all tables
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }
    
    // For each table, get its columns
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\nTable: ${tableName}`);
      
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');
      
      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
      } else {
        console.log('Columns:');
        columns.forEach((column, index) => {
          console.log(`  ${index + 1}. ${column.column_name} (${column.data_type}, nullable: ${column.is_nullable})`);
        });
      }
    }
  } catch (error) {
    console.error('Error listing table columns:', error);
  }
}

// Execute the main function
main()
  .then(() => {
    console.log('\nCompleted fetching tables with admin privileges.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  }); 