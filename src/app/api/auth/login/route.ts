import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { normalizeSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if Admin credentials first
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (
      adminEmail &&
      adminPassword &&
      cleanEmail === adminEmail.toLowerCase() &&
      password === adminPassword
    ) {
      const sessionToken = `msk_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const response = NextResponse.json({ success: true, role: 'admin' });
      response.cookies.set('msk_admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
      return response;
    }

    // 2. Customer login via Supabase server-side
    let response = NextResponse.json({ success: true, role: 'customer' });

    const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const key = getSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data?.user) {
      const msg =
        error?.message?.toLowerCase().includes('invalid login credentials') ||
        error?.message?.toLowerCase().includes('invalid grant')
          ? 'Invalid email or password. Please check your credentials.'
          : error?.message || 'Invalid email or password.';
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    return response;
  } catch (err: unknown) {
    console.error('Auth login route error:', err);
    return NextResponse.json(
      { error: 'Unable to sign in at the moment. Please verify your credentials and try again.' },
      { status: 500 }
    );
  }
}
