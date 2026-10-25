import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/client';
import { getSupabaseServiceRoleKey } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const serviceRoleKey = getSupabaseServiceRoleKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const anonKey = getSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // 1. Try Admin creation first (auto-confirms user so they can sign in immediately)
    try {
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data, error } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name || '',
          phone: phone || '',
        },
      });

      if (!error && data?.user) {
        // Ensure profile record exists
        try {
          await adminSupabase.from('profiles').upsert({
            id: data.user.id,
            full_name: name || '',
            email: cleanEmail,
            phone: phone || '',
          });
        } catch (profileErr) {
          console.warn('Profile upsert note:', profileErr);
        }

        return NextResponse.json({
          success: true,
          user: data.user,
        });
      }

      if (error && (error.message.includes('already registered') || error.message.includes('already exists'))) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 400 }
        );
      }
    } catch (adminErr) {
      console.warn('Admin user creation notice, trying fallback signup:', adminErr);
    }

    // 2. Fallback to standard client sign-up
    const publicSupabase = createClient(supabaseUrl, anonKey);
    const { data: signUpData, error: signUpError } = await publicSupabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: name || '',
          phone: phone || '',
        },
      },
    });

    if (signUpError) {
      const msg = signUpError.message?.toLowerCase().includes('already registered')
        ? 'An account with this email already exists. Please sign in.'
        : signUpError.message || 'Registration failed.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: signUpData.user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error during registration.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
