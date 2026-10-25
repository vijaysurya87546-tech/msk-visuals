'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  LogOut,
  ShoppingBag,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Shield,
  Calendar,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/auth/AuthModal';

interface OrderItem {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  payment_method?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const fetchUserAndOrders = async () => {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        setOrdersLoading(true);
        try {
          // Fetch orders by user_id or customer_email
          const { data: userOrders } = await supabase
            .from('orders')
            .select('*')
            .or(`user_id.eq.${currentUser.id},customer_email.eq.${currentUser.email}`)
            .order('created_at', { ascending: false });

          if (userOrders) {
            setOrders(userOrders as OrderItem[]);
          }
        } catch (err) {
          console.warn('Could not load orders:', err);
        } finally {
          setOrdersLoading(false);
        }
      }
      setLoading(false);
    };

    fetchUserAndOrders();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in view: Prompt user with MSK Visuals login modal
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="card-premium p-8 max-w-md w-full border border-gold/25 shadow-2xl text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="md" />
          </div>
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
            <User size={24} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-2">
            My Account
          </h1>
          <p className="text-gray-400 text-xs mb-6">
            Sign in to view your orders, saved details, and custom frame requests.
          </p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="btn-gold w-full flex items-center justify-center gap-2 cursor-pointer !py-3 !rounded-xl"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight size={14} />
          </button>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-gray-500">
            <Link href="/shop" className="hover:text-gold transition-colors">
              Continue Shopping
            </Link>
            <Link href="/admin/login" className="hover:text-gold transition-colors">
              Admin Login
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialView="signin"
          redirectTo="/account"
        />
      </div>
    );
  }

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer';
  const phone = user.user_metadata?.phone || 'Not provided';

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('delivered')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
          <CheckCircle size={12} />
          Delivered
        </span>
      );
    }
    if (s.includes('shipped') || s.includes('dispatch')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-950/60 text-blue-400 border border-blue-500/30">
          <Truck size={12} />
          Shipped
        </span>
      );
    }
    if (s.includes('production') || s.includes('process')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/30">
          <Clock size={12} />
          In Production
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-950/60 text-yellow-400 border border-yellow-500/30">
        <Clock size={12} />
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Account Header */}
      <div className="bg-[#121212] border border-gold/25 rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center text-gold text-2xl font-bold font-heading">
              {fullName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white font-heading">
                  {fullName}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/15 text-gold border border-gold/30">
                  Customer
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <Mail size={13} className="text-gold" />
                {user.email}
              </p>
              {phone !== 'Not provided' && (
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-gold" />
                  {phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/shop"
              className="btn-gold !py-2.5 !px-5 text-xs flex-1 md:flex-initial flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={14} />
              <span>Continue Shopping</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-gold" />
            <h2 className="text-lg md:text-xl font-bold text-white font-heading">
              My Orders &amp; Creations
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </span>
        </div>

        {ordersLoading ? (
          <div className="p-12 text-center bg-[#121212] border border-white/10 rounded-2xl">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-[#121212] border border-white/10 rounded-3xl">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              No orders yet
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
              When you order custom photo frames, resin art, or gifts from MSK Visuals, your order tracking will appear right here.
            </p>
            <Link href="/shop" className="btn-gold !py-2.5 !px-6 text-xs inline-flex items-center gap-2">
              <span>Browse Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id || order.order_id}
                className="bg-[#141414] border border-white/10 hover:border-gold/30 rounded-2xl p-5 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Order ID
                    </span>
                    <p className="text-sm font-bold text-gold font-mono">
                      #{order.order_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        Date Placed
                      </span>
                      <p className="text-xs text-gray-300 flex items-center gap-1">
                        <Calendar size={12} className="text-gray-500" />
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-gray-400">
                      Payment: {order.payment_method || 'Cash on Delivery'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Total: </span>
                      <span className="text-base font-bold text-gold">
                        ₹{Number(order.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Link
                      href={`/order-confirmation/${order.order_id}`}
                      className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-gold/50 text-gray-300 hover:text-gold text-xs font-semibold transition-colors"
                    >
                      View Receipt
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
