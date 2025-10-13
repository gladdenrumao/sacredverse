/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for database operations.
 * Supabase provides a PostgreSQL database with real-time capabilities,
 * authentication, and automatic API generation.
 * 
 * TO GET STARTED:
 * 1. Go to https://supabase.com and create a free account
 * 2. Create a new project (it takes ~2 minutes to set up)
 * 3. Go to Project Settings > API
 * 4. Copy your project URL and anon/public key
 * 5. Create a .env file in the root directory with:
 *    VITE_SUPABASE_URL=your_project_url
 *    VITE_SUPABASE_ANON_KEY=your_anon_key
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// In Vite, environment variables must start with VITE_ to be exposed to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
// This client will be used throughout the app to interact with the database
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  console.log('✅ Supabase client initialized successfully');
} else {
  console.log('⚠️ Supabase not configured - running in localStorage-only mode');
  console.log('To enable Supabase, create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export default supabase;
