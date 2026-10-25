'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingBag,
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/client';

export type AuthModalView = 'welcome' | 'signin' | 'register' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthModalView;
  redirectTo?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialView = 'welcome',
  redirectTo = '/shop',
}: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState<AuthModalView>(initialView);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGuest = () => {
    onClose();
    router.push(redirectTo || '/shop');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);
    setLoginLoading(true);

    try {
      // 1. Check if these are Admin credentials first
      const adminRes = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const adminData = await adminRes.json();

      if (adminRes.ok && adminData.success) {
        onClose();
        router.push('/admin/dashboard');
        return;
      }

      // 2. Otherwise try Supabase customer sign-in
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message || 'Invalid email or password.');
      } else if (data?.user) {
        onClose();
        router.push(redirectTo || '/shop');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanEmail = regEmail.trim();

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters');
      return;
    }

    setRegLoading(true);

    try {
      // 1. Call server-side registration endpoint with auto-confirm
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: cleanEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setRegError(resData.error || 'Registration failed. Please try again.');
        return;
      }

      setRegSuccess(true);

      // 2. Automatically log the user in immediately
      try {
        const supabase = createClient();
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: regPassword,
        });

        if (!signInError && signInData?.user) {
          setTimeout(() => {
            onClose();
            router.push(redirectTo || '/shop');
          }, 600);
          return;
        }
      } catch (autoLoginErr) {
        console.warn('Auto login note:', autoLoginErr);
      }

      // 3. Fallback: switch to sign in view with GREEN success message
      setTimeout(() => {
        setView('signin');
        setLoginEmail(cleanEmail);
        setLoginSuccess('Account created successfully! Please enter your password to sign in.');
        setLoginError(null);
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setRegError(message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/login?mode=reset`,
      });

      if (error) {
        setForgotError(error.message || 'Could not send reset link. Please check the email.');
      } else {
        setForgotSent(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed. Please try again.';
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card - MSK Visuals Dark Gold Luxury Theme */}
      <div className="relative bg-[#111111] rounded-3xl max-w-md w-full shadow-2xl border border-gold/25 overflow-hidden transform transition-all z-10 animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Header - MSK Visuals Signature Dark Theme */}
        <div className="bg-[#181818] border-b border-white/10 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Logo size="sm" showText={false} />
            <div>
              <h2 className="text-lg font-heading font-bold tracking-wider text-gold-gradient leading-tight">
                MSK VISUALS
              </h2>
              <p className="text-[10px] uppercase font-semibold text-gold tracking-[0.2em]">
                WE DESIGN. YOU IMPRESS.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-heading font-bold text-white mt-3">
            {view === 'welcome' && 'Welcome'}
            {view === 'signin' && 'Sign In'}
            {view === 'register' && 'Create Account'}
            {view === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-gray-400">
            {view === 'welcome' && 'Please choose how you would like to proceed:'}
            {view === 'signin' && 'Access your account & track orders:'}
            {view === 'register' && 'Register to manage orders & fast checkout:'}
            {view === 'forgot' && 'Enter your email to receive recovery instructions:'}
          </p>
        </div>

        {/* View 1: 3-Choice Model (Continue as Guest, Sign In, Create Account) */}
        {view === 'welcome' && (
          <div className="p-6 space-y-3.5 bg-[#111111]">
            {/* Option 1: Continue as Guest */}
            <button
              type="button"
              onClick={handleGuest}
              className="w-full group text-left p-4 rounded-2xl bg-[#161616] border border-white/10 hover:border-gold/60 hover:bg-white/[0.04] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-gold transition-colors">
                    Continue as Guest
                  </div>
                  <div className="text-xs text-gray-400">
                    Browse shop &amp; order frames • No account needed
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Option 2: Sign In */}
            <button
              type="button"
              onClick={() => setView('signin')}
              className="w-full group text-left p-4 rounded-2xl bg-[#161616] border border-white/10 hover:border-gold/60 hover:bg-white/[0.04] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gold/10 text-gold border border-gold/25 flex items-center justify-center group-hover:bg-gold group-hover:text-black-deep transition-colors shrink-0">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-gold transition-colors">
                    Sign In
                  </div>
                  <div className="text-xs text-gray-400">
                    Access your account &amp; track existing orders
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Option 3: Create Account */}
            <button
              type="button"
              onClick={() => setView('register')}
              className="w-full group text-left p-4 rounded-2xl bg-[#161616] border border-white/10 hover:border-gold/60 hover:bg-white/[0.04] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-black-deep transition-colors shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-gold transition-colors">
                    Create Account
                  </div>
                  <div className="text-xs text-gray-400">
                    Save address details &amp; faster checkout
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        )}

        {/* View 2: Sign In Form */}
        {view === 'signin' && (
          <div className="p-6 bg-[#111111] space-y-4">
            <button
              type="button"
              onClick={() => setView('welcome')}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to options</span>
            </button>

            {loginSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{loginSuccess}</span>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[11px] font-medium text-gold hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#181818] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-gold w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 !py-3 !rounded-xl"
              >
                {loginLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-gray-400 border-t border-white/10">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setView('register')}
                className="font-bold text-gold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* View 3: Register Form */}
        {view === 'register' && (
          <div className="p-6 bg-[#111111] space-y-4 max-h-[70vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setView('welcome')}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to options</span>
            </button>

            {regError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Account created successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Vijay Kumar"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="919361253338"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Password (Min. 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="btn-gold w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 !py-3 !rounded-xl mt-2"
              >
                {regLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-gray-400 border-t border-white/10">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setView('signin')}
                className="font-bold text-gold hover:underline cursor-pointer"
              >
                Sign In here
              </button>
            </div>
          </div>
        )}

        {/* View 4: Forgot Password */}
        {view === 'forgot' && (
          <div className="p-6 bg-[#111111] space-y-4">
            <button
              type="button"
              onClick={() => setView('signin')}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>

            {forgotError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSent ? (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm text-white">Reset Link Sent!</p>
                <p className="text-gray-300">
                  Instructions have been sent to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setView('signin')}
                  className="mt-2 text-xs font-bold text-gold hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-gold w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 !py-3 !rounded-xl"
                >
                  {forgotLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Modal Footer - MSK Visuals Security note & Admin Link */}
        <div className="px-6 py-3.5 bg-[#181818] border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Secure MSK Visuals customer &amp; orders portal</span>
          </div>
          <button
            onClick={() => {
              onClose();
              router.push('/admin/login');
            }}
            className="text-gray-400 hover:text-gold transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
            title="Admin Login"
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
