import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbgmephbgyjtlunnvwlu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ21lcGhiZ3lqdGx1bm52d2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI2MjMsImV4cCI6MjA2MzY2ODYyM30.aFtwln3FYcC6i96DZ4aACO3qe3BzxeYIQsNe9j375VA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
