// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Check if the tables actually exist by trying to query them
async function testAndListTables() {
  console.log('Connecting to Supabase project: doodFinder');
  
  // Common tables to check for in a Supabase project
  const commonTables = [
    'users',
    'profiles',
    'properties',
    'listings',
    'saved_properties',
    'messages',
    'reviews',
    'amenities',
    'property_amenities',
    'images',
    'locations'
  ];
  
  const foundTables = [];
  
  for (const tableName of commonTables) {
    try {
      console.log(`Testing table: ${tableName}`);
      
      // Try to get the count of rows in this table
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`✅ Table exists: ${tableName} (${count || 'unknown'} rows)`);
        foundTables.push(tableName);
      } else if (error.code === 'PGRST116') {
        console.log(`❌ No permission for table: ${tableName}`);
      } else if (error.code === '42P01') {
        console.log(`❌ Table does not exist: ${tableName}`);
      } else {
        console.log(`❌ Error for table ${tableName}:`, error.message);
      }
    } catch (error) {
      console.error(`Error testing table ${tableName}:`, error);
    }
  }
  
  console.log('\nConfirmed tables in your Supabase database:');
  if (foundTables.length === 0) {
    console.log('No tables found or accessible.');
  } else {
    foundTables.forEach((table, index) => {
      console.log(`${index + 1}. ${table}`);
    });
  }
  
  return foundTables;
}

// Execute the function
testAndListTables().then(() => {
  console.log('\nCompleted testing for tables.');
}); 