import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing! Make sure your .env file in the root directory contains REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // Explicitly persist Supabase session in localStorage
    autoRefreshToken: true,     // Auto-refresh expired Supabase tokens
    detectSessionInUrl: true,   // Detect OAuth callback params in URL (PKCE code, hash fragments)
    storage: localStorage,      // Explicitly use localStorage (not sessionStorage)
  },
});
