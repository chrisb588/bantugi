import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbgmephbgyjtlunnvwlu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ21lcGhiZ3lqdGx1bm52d2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDExNzc4MTYsImV4cCI6MjAxNjc1MzgxNn0.S5YwIXX-7vLhHVXxzB_RUYsEQQEDEzZGbRPVPgMHYvM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
