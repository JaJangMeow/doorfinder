// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    
    console.log('Tables found:', tables.length);
    
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

// Alternative simple method to list tables
async function listTables() {
  try {
    console.log('Connecting to Supabase project: doodFinder');
    
    // Try a direct query to the Postgres system tables
    const { data, error } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }
    
    console.log('\nTables in your Supabase database:');
    if (data.length === 0) {
      console.log('No tables found in the public schema.');
    } else {
      data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.tablename}`);
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Execute the main functions
async function main() {
  await listTables();
  await listTableColumns();
  console.log('\nCompleted fetching tables and their columns.');
}

main().catch(console.error); 