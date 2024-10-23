import {createClient} from "@supabase/supabase-js";
import {WEB_CONFIG} from "./website-config";

// Production credentials
const prodSupabaseUrl = "https://guvhwgqilmxiddtpepqk.supabase.co";
const prodSupabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmh3Z3FpbG14aWRkdHBlcHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzMDA3NTUsImV4cCI6MjAzMzg3Njc1NX0.WMj8gltXqT_TlhGCABsFSUz4O2zmSTMnQHGwY1Zv-Kk";

// Development credentials
const devSupabaseUrl = "https://icyaglvxuziqfcxwtymo.supabase.co";
const devSupabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeWFnbHZ4dXppcWZjeHd0eW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjcyNzc5NCwiZXhwIjoyMDQyMzAzNzk0fQ.ux-uQc1JXVlCsFMoYM6VScq4OM0Y96NtAJnOZGSQplA";

// Choose credentials based on environment
const supabaseUrl = WEB_CONFIG.isProduction ? prodSupabaseUrl : devSupabaseUrl;
const supabaseKey = WEB_CONFIG.isProduction ? prodSupabaseKey : devSupabaseKey;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
