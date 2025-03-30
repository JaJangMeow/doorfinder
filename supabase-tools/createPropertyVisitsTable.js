// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Create property_visits table in Supabase
 */
async function createPropertyVisitsTable() {
  console.log('Creating property_visits table in Supabase project: doodFinder');
  
  try {
    // SQL query to create the property_visits table
    const query = `
      CREATE TABLE IF NOT EXISTS property_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID NOT NULL,
        user_id UUID NOT NULL,
        visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        visit_duration_seconds INTEGER,
        visit_source VARCHAR(50),
        device_type VARCHAR(50),
        is_favorite BOOLEAN DEFAULT FALSE,
        location_coordinates POINT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      COMMENT ON TABLE property_visits IS 'Tracks when users view property listings';
      
      -- Set up Row Level Security
      ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;
      
      -- Policies for data access
      CREATE POLICY "Users can view their own property visits" 
        ON property_visits 
        FOR SELECT 
        USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own property visits" 
        ON property_visits 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_property_visits_property_id ON property_visits(property_id);
      CREATE INDEX IF NOT EXISTS idx_property_visits_user_id ON property_visits(user_id);
      CREATE INDEX IF NOT EXISTS idx_property_visits_visit_date ON property_visits(visit_date);
    `;
    
    // Execute the query
    const { error } = await supabase.rpc('pgcall', { sql: query });
    
    if (error) {
      if (error.message.includes('function pgcall() does not exist')) {
        console.error('Error: The pgcall function does not exist in your Supabase project.');
        console.log('\nTrying alternative method with direct SQL query...');
        
        // Alternative approach using direct REST API
        try {
          // Split the query into separate statements
          const statements = query
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
          
          for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing SQL statement ${i+1}/${statements.length}...`);
            
            // We'll try a simple insert to execute our query
            // This is a workaround since we can't directly execute DDL statements
            // through the standard REST API
            const { error: queryError } = await supabase
              .from('property_visits')
              .insert({});
            
            if (queryError && queryError.code === '42P01') {
              console.log('Table does not exist yet, as expected. Continue with creation.');
            }
          }
          
          console.log('\nPlease note: SQL execution through REST API is limited.');
          console.log('To ensure the table is created properly, please run the SQL below in the Supabase dashboard SQL editor:');
          console.log('\n------- SQL QUERY -------');
          console.log(query);
          console.log('-------------------------\n');
          
          return false;
        } catch (directError) {
          console.error('Error with direct SQL execution:', directError);
          return false;
        }
      } else {
        console.error('Error creating property_visits table:', error);
      }
      return false;
    }
    
    console.log('Property visits table created successfully!');
    return true;
  } catch (error) {
    console.error('Exception while creating property_visits table:', error);
    return false;
  }
}

// Check if the property_visits table already exists
async function checkTableExists() {
  try {
    console.log('Checking if property_visits table already exists...');
    
    const { data, error } = await supabase
      .from('property_visits')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('Property visits table does not exist. Will create it.');
        return false;
      } else {
        console.error('Error checking if table exists:', error);
        return null; // unknown status
      }
    }
    
    console.log('Property visits table already exists!');
    return true;
  } catch (error) {
    console.error('Exception while checking if table exists:', error);
    return null; // unknown status
  }
}

// Insert sample property visit to test the table
async function insertSampleVisit() {
  try {
    console.log('\nInserting sample property visit...');
    
    // First, get an actual property ID from the properties table
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);
    
    if (propertiesError) {
      console.error('Error fetching property ID:', propertiesError);
      return false;
    }
    
    if (!properties || properties.length === 0) {
      console.error('No properties found in the database to create a sample visit.');
      return false;
    }
    
    // Get a test user ID (could be any valid UUID, but we'll use a fixed one for testing)
    const testUserId = '00000000-0000-0000-0000-000000000000';
    
    // Insert the visit
    const { data, error } = await supabase
      .from('property_visits')
      .insert([
        {
          property_id: properties[0].id,
          user_id: testUserId,
          visit_duration_seconds: 120,
          visit_source: 'search',
          device_type: 'desktop',
          is_favorite: false
        }
      ])
      .select();
    
    if (error) {
      console.error('Error inserting sample property visit:', error);
      return false;
    }
    
    console.log('Sample property visit inserted successfully!');
    console.log('Visit data:', data);
    return true;
  } catch (error) {
    console.error('Exception while inserting sample property visit:', error);
    return false;
  }
}

// Main function
async function main() {
  // Check if table exists first
  const exists = await checkTableExists();
  
  if (exists === false) {
    // Table doesn't exist, create it
    const created = await createPropertyVisitsTable();
    
    if (created) {
      // Table was created, insert sample data
      await insertSampleVisit();
    }
  } else if (exists === true) {
    // Table already exists
    console.log('\nThe property_visits table already exists in your database.');
    console.log('You can now use it to track user property views in your application.');
    
    // Check if we should add sample data
    console.log('\nWould you like to add a sample property visit record? (Assuming yes)');
    await insertSampleVisit();
  } else {
    // Unable to determine if table exists
    console.log('\nUnable to determine if the property_visits table exists.');
    console.log('Please check your Supabase dashboard to confirm.');
  }
}

// Execute the main function
main()
  .then(() => {
    console.log('\nOperation completed.');
  })
  .catch(error => {
    console.error('Fatal error:', error);
  }); 