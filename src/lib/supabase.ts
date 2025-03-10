
import { createClient } from '@supabase/supabase-js';

// These will be loaded from environment variables in a production setting
// For now, we're using public values for demonstration
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
