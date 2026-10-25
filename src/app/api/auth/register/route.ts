import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    // Use admin client with service role key to auto-confirm user
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true, // Automatically confirm so user can sign in immediately
      user_metadata: {
        full_name: name || '',
        phone: phone || '',
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Registration failed.' },
        { status: 400 }
      );
    }

    // Also ensure profile record exists
    if (data?.user?.id) {
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
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
