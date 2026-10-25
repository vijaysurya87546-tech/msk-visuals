import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { normalizeSupabaseUrl, getSupabaseAnonKey } from './client';

export const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdidm96ZmJ6YXFmdXl2aGpzcnV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTY0MzA0OCwiZXhwIjoyMTA3MjE5MDQ4fQ.s2n4OeGSDmkXNFumOBTLW2jTX7g9YZtMQwNS40B8vm0';

export function getSupabaseServiceRoleKey(rawKey?: string): string {
  if (!rawKey || typeof rawKey !== 'string') return DEFAULT_SERVICE_ROLE_KEY;
  const clean = rawKey.trim();
  if (
    !clean ||
    clean.includes('your_supabase_service_role_key') ||
    clean.includes('dummy')
  ) {
    return DEFAULT_SERVICE_ROLE_KEY;
  }
  return clean;
}

export async function createClient() {
  const cookieStore = await cookies();
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component set cookie ignore
        }
      },
    },
  });
}

export async function createAdminClient() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getSupabaseServiceRoleKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const cookieStore = await cookies();
    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored
          }
        },
      },
    });
  } catch {
    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });
  }
}
