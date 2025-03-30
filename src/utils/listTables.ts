import { supabase } from '@/lib/supabase';

/**
 * Lists all tables in the Supabase database
 * @returns An array of table names
 */
export async function listTables() {
  try {
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error) {
      console.error('Error fetching tables:', error);
      return [];
    }
    
    console.log('Tables in database:', data);
    return data || [];
  } catch (error) {
    console.error('Exception while fetching tables:', error);
    return [];
  }
}

/**
 * Alternative way to list tables using SQL query
 * @returns An array of table details
 */
export async function listTablesWithSQL() {
  try {
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('Error fetching tables with SQL:', error);
      return [];
    }
    
    console.log('Tables in database (SQL):', data);
    return data || [];
  } catch (error) {
    console.error('Exception while fetching tables with SQL:', error);
    return [];
  }
}

/**
 * Get table schema information
 * @param tableName The name of the table to get schema for
 * @returns Column information for the specified table
 */
export async function getTableSchema(tableName: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_table_schema', { table_name: tableName });
    
    if (error) {
      console.error(`Error fetching schema for table ${tableName}:`, error);
      return [];
    }
    
    console.log(`Schema for ${tableName}:`, data);
    return data || [];
  } catch (error) {
    console.error(`Exception while fetching schema for table ${tableName}:`, error);
    return [];
  }
} 