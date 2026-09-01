import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSupabaseUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase URL not configured');
    return null;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting Supabase user:', error);
    return null;
  }
}

export async function signOutSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return;
  }

  try {
    return supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
