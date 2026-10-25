import { createBrowserClient } from '@supabase/ssr';

export const DEFAULT_SUPABASE_URL = 'https://gbvozfbzaqfuyvhjsruw.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdidm96ZmJ6YXFmdXl2aGpzcnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NDMwNDgsImV4cCI6MjEwNzIxOTA0OH0.WdXV6JQkm97UvexNy28YpEEQaPFlyLsqoZuAnVOLnes';

export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return DEFAULT_SUPABASE_URL;
  let clean = rawUrl.trim();
  if (
    !clean ||
    clean.includes('your_supabase_project_url') ||
    clean.includes('placeholder-mskvisuals')
  ) {
    return DEFAULT_SUPABASE_URL;
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean.replace(/\/+$/, '');
}

export function getSupabaseAnonKey(rawKey?: string): string {
  if (!rawKey || typeof rawKey !== 'string') return DEFAULT_SUPABASE_ANON_KEY;
  const clean = rawKey.trim();
  if (
    !clean ||
    clean.includes('your_supabase_anon_key') ||
    clean.includes('dummy')
  ) {
    return DEFAULT_SUPABASE_ANON_KEY;
  }
  return clean;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const normalized = normalizeSupabaseUrl(url);
  return Boolean(normalized && normalized.startsWith('http') && !normalized.includes('placeholder'));
}

export function createClient() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return createBrowserClient(url, key);
}
