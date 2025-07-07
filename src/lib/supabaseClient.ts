/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string
    VITE_SUPABASE_ANON_KEY: string
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing in environment variables.");
}

// Regular client for normal operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// SECURITY IMPROVEMENT: Removed supabaseAdmin client that used service key
// Admin operations should be performed through Supabase Edge Functions
// or server-side code, not in the frontend
