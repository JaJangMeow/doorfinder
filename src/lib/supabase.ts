
import { createClient } from '@supabase/supabase-js';

// Updated with the correct Supabase project URL and anon key
const supabaseUrl = 'https://lpazfekvismxebaolpgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpmZWt2aXNteGViYW9scGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MDE3MjEsImV4cCI6MjA1NzE3NzcyMX0.GLHURyf8okYluR-JzyL60jHKJKd0VyOj75nE5YxzJUc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
