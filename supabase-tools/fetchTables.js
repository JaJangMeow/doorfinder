// Import Supabase client
import { createClient } from '@supabase/supabase-js';
// Import fetch for Node.js
import fetch from 'node-fetch';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

// List tables via REST API
async function fetchTables() {
  console.log('Connecting to Supabase project: doodFinder');
  
  try {
    // Query the REST API to get all tables
    console.log('\nFetching tables via REST API...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    const tableNames = Object.keys(result);
    
    console.log('\nTables found:', tableNames.length);
    tableNames.forEach((name, i) => {
      console.log(`${i + 1}. ${name}`);
    });
    
    return tableNames;
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

// Execute the function
fetchTables().then(() => {
  console.log('\nCompleted fetching tables.');
}); 