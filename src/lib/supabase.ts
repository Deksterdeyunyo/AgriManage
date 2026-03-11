import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Provide dummy values to prevent the app from crashing when env vars are missing.
// The isSupabaseConfigured check will prevent actual API calls.
export const supabase = createClient(
  supabaseUrl || "https://dummy.supabase.co",
  supabaseAnonKey || "dummy-key"
);

export const isSupabaseConfigured = () => {
  return supabaseUrl !== "" && supabaseAnonKey !== "";
};
