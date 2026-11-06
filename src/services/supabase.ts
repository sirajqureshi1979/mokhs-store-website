import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StoreDatabase } from './db';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): { client: SupabaseClient | null; isConfigured: boolean; message: string } {
  const settings = StoreDatabase.getStoreSettings();
  const url = import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || settings.supabaseAnonKey;

  if (!url || !key) {
    return {
      client: null,
      isConfigured: false,
      message: 'Supabase credentials not yet configured. Local browser PostgreSQL simulation layer is actively persisting all catalog, orders, and customer data.',
    };
  }

  try {
    if (!supabaseClient) {
      supabaseClient = createClient(url, key);
    }
    return {
      client: supabaseClient,
      isConfigured: true,
      message: `Connected to Supabase PostgreSQL at ${new URL(url).hostname}`,
    };
  } catch (err: any) {
    return {
      client: null,
      isConfigured: false,
      message: `Supabase connection error: ${err.message}`,
    };
  }
}
