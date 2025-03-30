// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Creates a new feedback table in Supabase
 */
async function createFeedbackTable() {
  console.log('Creating app_feedback table in Supabase project: doodFinder');
  
  try {
    // SQL query to create the feedback table
    const query = `
      CREATE TABLE IF NOT EXISTS app_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        feedback_type VARCHAR(50) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        message TEXT NOT NULL,
        category VARCHAR(100),
        app_version VARCHAR(50),
        device_info JSONB,
        is_resolved BOOLEAN DEFAULT FALSE,
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      COMMENT ON TABLE app_feedback IS 'Collects user feedback and suggestions for the application';
      
      -- Set up Row Level Security
      ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;
      
      -- Policies for data access
      CREATE POLICY "Users can view their own feedback" 
        ON app_feedback 
        FOR SELECT 
        USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert feedback" 
        ON app_feedback 
        FOR INSERT 
        WITH CHECK (
          auth.uid() = user_id OR user_id IS NULL
        );
      
      CREATE POLICY "Admins can manage all feedback" 
        ON app_feedback 
        FOR ALL 
        USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_app_feedback_user_id ON app_feedback(user_id);
      CREATE INDEX IF NOT EXISTS idx_app_feedback_type ON app_feedback(feedback_type);
      CREATE INDEX IF NOT EXISTS idx_app_feedback_rating ON app_feedback(rating);
    `;
    
    // Execute the query
    const { error } = await supabase.rpc('pgcall', { sql: query });
    
    if (error) {
      if (error.message && error.message.includes('function pgcall() does not exist')) {
        console.error('Error: The pgcall function does not exist in your Supabase project.');
        console.log('\nPlease run the SQL below in the Supabase dashboard SQL editor to create the table:');
        console.log('\n------- SQL QUERY -------');
        console.log(query);
        console.log('-------------------------\n');
        
        // Try to create the table directly using the Supabase API
        console.log('Trying direct table creation method...');
        const { error: directError } = await supabase
          .from('app_feedback')
          .insert({ 
            feedback_type: 'suggestion', 
            message: 'Test message' 
          });
        
        if (directError && directError.code === '42P01') {
          console.log('Table does not exist yet, as expected.');
          return false;
        } else if (!directError) {
          console.log('Surprisingly, the table already exists or was created!');
          return true;
        } else {
          console.error('Error with direct table access:', directError);
          return false;
        }
      } else {
        console.error('Error creating feedback table:', error);
      }
      return false;
    }
    
    console.log('Feedback table created successfully!');
    return true;
  } catch (error) {
    console.error('Exception while creating feedback table:', error);
    return false;
  }
}

// Check if the feedback table already exists
async function checkTableExists() {
  try {
    console.log('Checking if app_feedback table already exists...');
    
    const { data, error } = await supabase
      .from('app_feedback')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('App feedback table does not exist. Will create it.');
        return false;
      } else {
        console.error('Error checking if table exists:', error);
        return null; // unknown status
      }
    }
    
    console.log('App feedback table already exists!');
    return true;
  } catch (error) {
    console.error('Exception while checking if table exists:', error);
    return null; // unknown status
  }
}

// Insert sample feedback to test the table
async function insertSampleFeedback() {
  try {
    console.log('\nInserting sample feedback...');
    
    const sampleFeedback = {
      user_id: null, // Anonymous feedback
      feedback_type: 'suggestion',
      rating: 4,
      title: 'Map feature suggestion',
      message: 'I would love to see a map view that shows all available properties in an area.',
      category: 'feature_request',
      app_version: '1.0.0',
      device_info: {
        type: 'desktop',
        os: 'windows',
        browser: 'chrome'
      },
      is_resolved: false
    };
    
    const { data, error } = await supabase
      .from('app_feedback')
      .insert([sampleFeedback])
      .select();
    
    if (error) {
      console.error('Error inserting sample feedback:', error);
      return false;
    }
    
    console.log('Sample feedback inserted successfully!');
    console.log('Feedback data:', data);
    return true;
  } catch (error) {
    console.error('Exception while inserting sample feedback:', error);
    return false;
  }
}

// List all tables in the database and check which ones we can access
async function listAllTables() {
  try {
    console.log('\n--- Checking all known tables in the database ---');
    
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
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`✅ ${tableName}: accessible (${data.count || 'unknown'} rows)`);
        } else {
          console.log(`❌ ${tableName}: ${error.message}`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

// Main function
async function main() {
  // Check if table exists first
  const exists = await checkTableExists();
  
  if (exists === false) {
    // Table doesn't exist, create it
    const created = await createFeedbackTable();
    
    if (created) {
      // Table was created, insert sample data
      await insertSampleFeedback();
    }
  } else if (exists === true) {
    // Table already exists
    console.log('\nThe app_feedback table already exists in your database.');
    console.log('You can now use it to collect user feedback in your application.');
    
    // Insert a sample feedback anyway
    console.log('\nAdding a sample feedback entry...');
    await insertSampleFeedback();
  } else {
    // Unable to determine if table exists
    console.log('\nUnable to determine if the app_feedback table exists.');
    console.log('Please check your Supabase dashboard to confirm.');
  }
  
  // List all tables
  await listAllTables();
}

// Execute the main function
main()
  .then(() => {
    console.log('\nOperation completed.');
  })
  .catch(error => {
    console.error('Fatal error:', error);
  }); 