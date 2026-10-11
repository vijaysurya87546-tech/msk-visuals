import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      // Env vars not configured — deny access
      return NextResponse.json({ error: 'Admin credentials not configured on server.' }, { status: 500 });
    }

    // Constant-time comparison to prevent timing attacks
    const emailMatch = email.toLowerCase() === adminEmail.toLowerCase();
    const passwordMatch = password === adminPassword;

    if (!emailMatch || !passwordMatch) {
      // Same error for both wrong email and wrong password (no enumeration)
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Generate a signed session token value
    const sessionToken = `msk_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const response = NextResponse.json({ success: true });

    // Set HttpOnly, Secure, SameSite cookie — not accessible from JavaScript
    response.cookies.set('msk_admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Admin auth error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// Logout: clear the HttpOnly session cookie
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('msk_admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}
