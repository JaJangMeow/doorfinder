// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Create user_activity_log table for analytics in Supabase
 */
async function createAnalyticsTable() {
  console.log('Creating user_activity_log table in Supabase project: doodFinder');
  
  try {
    // SQL query to create the analytics table
    const query = `
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        session_id TEXT,
        activity_type VARCHAR(100) NOT NULL,
        activity_details JSONB,
        page_url TEXT,
        referrer_url TEXT,
        user_agent TEXT,
        ip_address TEXT,
        device_info JSONB,
        geolocation JSONB, 
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      COMMENT ON TABLE user_activity_log IS 'Tracks user activity for analytics and behavior analysis';
      
      -- Set up Row Level Security
      ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
      
      -- Policies for data access
      CREATE POLICY "Admins can select all user activity logs" 
        ON user_activity_log 
        FOR SELECT 
        USING (
          -- Check if user has admin role
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
        
      CREATE POLICY "Users can insert their own activity logs" 
        ON user_activity_log 
        FOR INSERT 
        WITH CHECK (
          -- Allow authenticated users to insert their own logs
          auth.uid() = user_id OR 
          -- Allow anonymous activity with null user_id
          user_id IS NULL
        );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
      CREATE INDEX IF NOT EXISTS idx_user_activity_log_timestamp ON user_activity_log(timestamp);
    `;
    
    // Execute the query
    const { error } = await supabase.rpc('pgcall', { sql: query });
    
    if (error) {
      if (error.message && error.message.includes('function pgcall() does not exist')) {
        console.error('Error: The pgcall function does not exist in your Supabase project.');
        console.log('\nTrying alternative method with direct table creation...');
        
        // Try to create the table directly using the Supabase API
        const { error: directError } = await supabase
          .from('user_activity_log')
          .insert({ 
            activity_type: 'test', 
            timestamp: new Date().toISOString() 
          });
        
        if (directError && directError.code === '42P01') {
          console.log('Table does not exist yet, as expected.');
          console.log('Please run the SQL below in the Supabase dashboard SQL editor to create the table:');
          console.log('\n------- SQL QUERY -------');
          console.log(query);
          console.log('-------------------------\n');
          return false;
        } else if (!directError) {
          console.log('Surprisingly, the table already exists or was created!');
          return true;
        } else {
          console.error('Error with direct table access:', directError);
          return false;
        }
      } else {
        console.error('Error creating analytics table:', error);
      }
      return false;
    }
    
    console.log('Analytics table created successfully!');
    return true;
  } catch (error) {
    console.error('Exception while creating analytics table:', error);
    return false;
  }
}

// Check if the analytics table already exists
async function checkTableExists() {
  try {
    console.log('Checking if user_activity_log table already exists...');
    
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('User activity log table does not exist. Will create it.');
        return false;
      } else {
        console.error('Error checking if table exists:', error);
        return null; // unknown status
      }
    }
    
    console.log('User activity log table already exists!');
    return true;
  } catch (error) {
    console.error('Exception while checking if table exists:', error);
    return null; // unknown status
  }
}

// Insert sample activity log to test the table
async function insertSampleActivityLog() {
  try {
    console.log('\nInserting sample activity log...');
    
    const sampleLog = {
      user_id: null, // Anonymous activity
      session_id: 'sample-session-' + Math.random().toString(36).substring(2, 10),
      activity_type: 'search',
      activity_details: {
        search_term: 'apartment near downtown',
        filters: {
          min_price: 1000,
          max_price: 2000,
          bedrooms: 2,
          amenities: ['parking', 'pet-friendly']
        }
      },
      page_url: '/search',
      referrer_url: '/',
      user_agent: 'Sample Agent/1.0',
      ip_address: '127.0.0.1',
      device_info: {
        type: 'desktop',
        os: 'windows',
        browser: 'chrome'
      },
      geolocation: {
        city: 'Sample City',
        country: 'Sample Country',
        latitude: 37.7749,
        longitude: -122.4194
      }
    };
    
    const { data, error } = await supabase
      .from('user_activity_log')
      .insert([sampleLog])
      .select();
    
    if (error) {
      console.error('Error inserting sample activity log:', error);
      return false;
    }
    
    console.log('Sample activity log inserted successfully!');
    console.log('Log data:', data);
    return true;
  } catch (error) {
    console.error('Exception while inserting sample activity log:', error);
    return false;
  }
}

// Main function
async function main() {
  // Check if table exists first
  const exists = await checkTableExists();
  
  if (exists === false) {
    // Table doesn't exist, create it
    const created = await createAnalyticsTable();
    
    if (created) {
      // Table was created, insert sample data
      await insertSampleActivityLog();
    }
  } else if (exists === true) {
    // Table already exists
    console.log('\nThe user_activity_log table already exists in your database.');
    console.log('You can now use it to track user behavior and analytics in your application.');
    
    // Insert a sample log anyway
    console.log('\nAdding a sample activity log...');
    await insertSampleActivityLog();
  } else {
    // Unable to determine if table exists
    console.log('\nUnable to determine if the user_activity_log table exists.');
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