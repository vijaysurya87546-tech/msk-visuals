import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    !url.includes('your_supabase_project_url')
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return null or placeholder that doesn't crash URL constructor
    return createBrowserClient(
      'https://placeholder-mskvisuals.supabase.co',
      'dummy-anon-key'
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
