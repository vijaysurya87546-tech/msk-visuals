'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';
import Logo from '@/components/brand/Logo';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="card-premium p-8 max-w-md w-full border border-gold/20 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
          <Shield size={24} />
        </div>
        <h1 className="font-heading text-xl font-bold text-white mb-2">
          Admin Portal
        </h1>
        <p className="text-gray-400 text-xs mb-6">
          Customer registration is disabled. Redirecting to the Admin Portal...
        </p>
        <Link href="/admin/login" className="btn-gold w-full flex items-center justify-center gap-2">
          <span>Go to Admin Login</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
