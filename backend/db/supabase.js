import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Validation
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase configuration is missing');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Supabase client initialized:', supabaseUrl ? '✓' : '✗');