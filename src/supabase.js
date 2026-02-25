import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://enwoicnyjzzrovrzeimf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVud29pY255anp6cm92cnplaW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDEwMjcsImV4cCI6MjA4NzU3NzAyN30.D8YiixbXd7m_C3_Zrw_B4C2_KPpZb5Xa_N61i0qEBvQ";

export const supabase = createClient(supabaseUrl, supabaseKey);