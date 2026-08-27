import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://elwihqlydfcutzojsbwu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsd2locWx5ZGZjdXR6b2pzYnd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3OTcyNzAsImV4cCI6MjEwMzM3MzI3MH0.2q0KNMc50TvWg6D1HJc_4PY2fFkgAK6WJKPmRQTFpZo';

/**
 * Supabase client instance used EXCLUSIVELY for user authentication
 * (Sign in, Sign up, Session token retrieval).
 * All task CRUD operations pass strictly through the FastAPI backend.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
