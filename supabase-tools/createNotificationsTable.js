// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Create notifications table in Supabase
 */
async function createNotificationsTable() {
  console.log('Creating notifications table in Supabase project: doodFinder');
  
  try {
    // SQL query to create the notifications table
    const query = `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        related_entity_id UUID,
        related_entity_type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      COMMENT ON TABLE notifications IS 'User notifications for various events like new properties, messages, etc.';
      
      -- Set up Row Level Security
      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
      
      -- Policies for data access
      CREATE POLICY "Users can read their own notifications" 
        ON notifications 
        FOR SELECT 
        USING (auth.uid() = user_id);
      
      CREATE POLICY "System can create notifications" 
        ON notifications 
        FOR INSERT 
        WITH CHECK (true);
      
      CREATE POLICY "Users can update their own notifications" 
        ON notifications 
        FOR UPDATE 
        USING (auth.uid() = user_id);
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    `;
    
    // Execute the query using the Supabase REIT API
    const { error } = await supabase.rpc('pgcall', { sql: query });
    
    if (error) {
      if (error.message.includes('function pgcall() does not exist')) {
        console.error('Error: pgcall function does not exist in your Supabase project.');
        console.log('\nYou may need to create this table manually from the Supabase dashboard SQL editor.');
        console.log('Copy the SQL query from this file and run it in the SQL editor.');
      } else {
        console.error('Error creating notifications table:', error);
      }
      return false;
    }
    
    console.log('Notifications table created successfully!');
    return true;
  } catch (error) {
    console.error('Exception while creating notifications table:', error);
    return false;
  }
}

// Check if the notifications table already exists
async function checkTableExists() {
  try {
    console.log('Checking if notifications table already exists...');
    
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('Notifications table does not exist. Will create it.');
        return false;
      } else {
        console.error('Error checking if table exists:', error);
        return null; // unknown status
      }
    }
    
    console.log('Notifications table already exists!');
    return true;
  } catch (error) {
    console.error('Exception while checking if table exists:', error);
    return null; // unknown status
  }
}

// Insert sample notification to test the table
async function insertSampleNotification() {
  try {
    console.log('\nInserting sample notification...');
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000', // Replace with an actual user ID
          title: 'Welcome to DoorFinder!',
          message: 'Thank you for joining DoorFinder. Start exploring properties now!',
          type: 'welcome'
        }
      ])
      .select();
    
    if (error) {
      console.error('Error inserting sample notification:', error);
      return false;
    }
    
    console.log('Sample notification inserted successfully!');
    console.log('Notification data:', data);
    return true;
  } catch (error) {
    console.error('Exception while inserting sample notification:', error);
    return false;
  }
}

// Main function
async function main() {
  // Check if table exists first
  const exists = await checkTableExists();
  
  if (exists === false) {
    // Table doesn't exist, create it
    const created = await createNotificationsTable();
    
    if (created) {
      // Table was created, insert sample notification
      await insertSampleNotification();
    }
  } else if (exists === true) {
    // Table already exists
    console.log('\nThe notifications table already exists in your database.');
    console.log('You can now use it to handle user notifications in your application.');
  } else {
    // Unable to determine if table exists
    console.log('\nUnable to determine if the notifications table exists.');
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