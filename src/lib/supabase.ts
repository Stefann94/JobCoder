import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://eliilfvunxsmzhepvxyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWlsZnZ1bnhzbXpoZXB2eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzMzMjIsImV4cCI6MjEwMDE0OTMyMn0.l8MGOEV8YJLbWJgzsfEDTxlHb8nkoVn7EfUzfkdS4-w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
