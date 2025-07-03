import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://soulicdqhyddewpvxpng.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdWxpY2RxaHlkZGV3cHZ4cG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODEwMjIsImV4cCI6MjA2NzA1NzAyMn0.e78uYo74NznRdvNUbbeG7a1ga8TWmIQenfmnCO4SSVs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 