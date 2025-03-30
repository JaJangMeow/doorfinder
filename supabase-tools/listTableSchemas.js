// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// List all tables and their schema
async function listAllTablesAndSchemas() {
  console.log('Listing all tables in Supabase project: doodFinder');
  
  try {
    const tablesToCheck = [
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
      'locations',
      'notifications',
      'property_visits',
      'user_activity_log',
      'app_feedback'
    ];
    
    const existingTables = [];
    
    console.log('\n--- Checking tables in the database ---');
    
    for (const tableName of tablesToCheck) {
      try {
        // Try to get a single row from the table - we just want to check if it exists
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ ${tableName}: accessible${data.length > 0 ? ' (has data)' : ' (empty)'}`);
          existingTables.push(tableName);
          
          // If there's data, show its structure
          if (data.length > 0) {
            console.log(`   Schema: ${Object.keys(data[0]).join(', ')}`);
          }
        } else if (error.code === '42P01') {
          console.log(`❌ ${tableName}: does not exist`);
        } else {
          console.log(`❌ ${tableName}: ${error.message}`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      }
    }
    
    console.log(`\nFound ${existingTables.length} accessible tables out of ${tablesToCheck.length} checked.`);
    
    // Now create a completely new table
    if (existingTables.length > 0) {
      await createReportingTable();
    }
    
    return existingTables;
  } catch (error) {
    console.error('Error listing tables:', error);
    return [];
  }
}

// Create a new reporting table
async function createReportingTable() {
  const tableName = 'usage_statistics_' + Math.floor(Date.now() / 1000);
  console.log(`\nAttempting to create a new table: ${tableName}`);
  
  try {
    // Try to create a new table using the Supabase API
    // Since we can't use DDL directly, we'll try to insert into a non-existent table
    // which will fail with a specific error code
    const { error } = await supabase
      .from(tableName)
      .insert({
        log_type: 'test',
        log_time: new Date().toISOString()
      });
    
    if (error && error.code === '42P01') {
      console.log(`Table ${tableName} does not exist, as expected.`);
      
      // Provide SQL to create the table
      const createTableSQL = `
        CREATE TABLE ${tableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          log_type VARCHAR(50) NOT NULL,
          user_count INTEGER,
          active_users INTEGER,
          property_views INTEGER,
          search_count INTEGER,
          new_listings INTEGER,
          log_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        COMMENT ON TABLE ${tableName} IS 'Tracks usage statistics for the DoorFinder application';
        
        -- Set up Row Level Security
        ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
        
        -- Only admins can access this table
        CREATE POLICY "Admins can manage usage statistics" 
          ON ${tableName}
          FOR ALL 
          USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `;
      
      console.log('\nTo create this table, please run the following SQL in the Supabase SQL Editor:');
      console.log('\n------- SQL QUERY -------');
      console.log(createTableSQL);
      console.log('-------------------------\n');
      
      return false;
    } else if (!error) {
      console.log(`Surprisingly, the table ${tableName} was created automatically!`);
      return true;
    } else {
      console.error(`Error trying to access table ${tableName}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`Exception while trying to create table ${tableName}:`, error);
    return false;
  }
}

// Execute the main function
listAllTablesAndSchemas()
  .then(() => {
    console.log('\nOperation completed.');
  })
  .catch(error => {
    console.error('Fatal error:', error);
  }); 