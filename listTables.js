// Import Supabase client
import { createClient } from '@supabase/supabase-js';
// Import fetch for Node.js
import fetch from 'node-fetch';

// Using the service role key for admin access
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTYwMTcyMSwiZXhwIjoyMDU3MTc3NzIxfQ.8lvSQ7cKbdVLVU8voyN6aET7uXFwfaLHW_JMLCxQaHY';

console.log('Connecting to Supabase project: doodFinder');

// Try to list tables by making a direct request to the REST API
async function listTablesViaREST() {
  try {
    console.log('Fetching tables via REST API...');
    
    // Query the REST API which exposes tables in the public schema
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    
    if (!response.ok) {
      console.error(`Error: API responded with status ${response.status}`);
      return;
    }
    
    // Parse the response
    const tableDefinitions = await response.json();
    const tableNames = Object.keys(tableDefinitions);
    
    console.log(`\nFound ${tableNames.length} tables via REST API:`);
    tableNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    
    // For each table, try to get its schema
    console.log('\nTable schemas:');
    for (const tableName of tableNames) {
      try {
        console.log(`\nTable: ${tableName}`);
        const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=0`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'count=exact'
          }
        });
        
        if (!schemaResponse.ok) {
          console.error(`Error fetching schema for ${tableName}: ${schemaResponse.status}`);
          continue;
        }
        
        // Try to get column info from the response headers
        const rangeHeader = schemaResponse.headers.get('content-range');
        const countMatch = rangeHeader ? rangeHeader.match(/\/(\d+)$/) : null;
        const rowCount = countMatch ? parseInt(countMatch[1], 10) : 'unknown';
        
        console.log(`- Row count: ${rowCount}`);
        
        // Try to get a single row to infer the schema
        if (rowCount > 0) {
          const sampleResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=1`, {
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            }
          });
          
          if (sampleResponse.ok) {
            const sampleData = await sampleResponse.json();
            if (sampleData.length > 0) {
              console.log('- Columns:');
              Object.keys(sampleData[0]).forEach((column, idx) => {
                const type = typeof sampleData[0][column];
                console.log(`  ${idx + 1}. ${column} (type: ${type})`);
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing schema for ${tableName}:`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching tables via REST API:', error);
  }
}

// Execute the main function
listTablesViaREST()
  .then(() => {
    console.log('\nCompleted fetching tables.');
  })
  .catch(error => {
    console.error('Fatal error:', error);
  }); 