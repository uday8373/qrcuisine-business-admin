import {createClient} from "@supabase/supabase-js";

const supabaseUrl = "https://guvhwgqilmxiddtpepqk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmh3Z3FpbG14aWRkdHBlcHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzMDA3NTUsImV4cCI6MjAzMzg3Njc1NX0.WMj8gltXqT_TlhGCABsFSUz4O2zmSTMnQHGwY1Zv-Kk";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
