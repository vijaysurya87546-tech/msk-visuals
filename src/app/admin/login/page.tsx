'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';
import Logo from '@/components/brand/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Throttle: max 5 attempts
    if (attempts >= 5) {
      setErrorMsg('Too many failed attempts. Please wait a moment before trying again.');
      return;
    }

    setLoading(true);

    try {
      // Send credentials to secure server-side API route ONLY
      // Credentials are verified against env vars — never exposed to the browser
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Success — server sets HttpOnly cookie, redirect to dashboard
        router.push('/admin/dashboard');
        return;
      }

      // Failed — increment attempts, show error
      setAttempts((prev) => prev + 1);
      setErrorMsg(data.error || 'Invalid credentials. Please try again.');
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="card-premium p-8 sm:p-10 w-full max-w-md border border-gold/30 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Logo size="lg" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
            MSK VISUALS Control Center
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            Studio Admin Login
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Authorized management access for {BUSINESS.name} Madurai.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {attempts >= 5 && (
          <div className="mb-4 p-3 bg-yellow-950/40 border border-yellow-500/40 rounded text-yellow-300 text-xs flex items-center gap-2">
            <Shield size={14} className="flex-shrink-0" />
            <span>Account temporarily locked after too many attempts. Please wait 5 minutes.</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="label-premium">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium pl-9 text-xs"
                placeholder="admin@example.com"
                disabled={attempts >= 5}
              />
            </div>
          </div>

          <div>
            <label className="label-premium">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-premium pl-9 text-xs"
                disabled={attempts >= 5}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || attempts >= 5}
            className="btn-gold !py-3.5 w-full text-xs font-bold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gold/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="loading-gold w-4 h-4" />
            ) : (
              <>
                Access Admin Dashboard <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-500">
          <p>MSK VISUALS Studio Management System</p>
          <p className="text-[11px] text-gray-600 mt-1">Protected by server-side authentication</p>
        </div>
      </div>
    </div>
  );
}
