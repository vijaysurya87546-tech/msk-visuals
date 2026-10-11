'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  MessageCircle,
  Lock,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice, isValidPhone, generateOrderWhatsAppMessage, generateWhatsAppUrl } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + deliveryCharge;

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery / Pay on Confirmation');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <ShoppingBag size={48} className="text-gold/30 mb-4" />
        <h2 className="font-heading text-2xl text-white mb-2">Your Cart is Empty</h2>
        <p className="text-gray-400 text-sm mb-6">
          Please add products to your cart before proceeding to checkout.
        </p>
        <Link href="/shop" className="btn-gold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !mobileNumber.trim() || !address1.trim() || !city.trim() || !pincode.trim()) {
      setErrorMsg('Please complete all required delivery details.');
      return;
    }

    if (!isValidPhone(mobileNumber)) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customer_name: fullName,
        customer_phone: mobileNumber,
        customer_email: email || null,
        address_line1: address1,
        address_line2: address2 || null,
        city,
        district: district || null,
        state,
        pincode,
        items,
        subtotal,
        delivery_charge: deliveryCharge,
        discount: 0,
        total: grandTotal,
        payment_method: paymentMethod,
        notes: orderNotes || null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to place order.');
      }

      // Save order snapshot in sessionStorage for confirmation page display
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`order_${result.order_id}`, JSON.stringify(result.order));
      }

      clearCart();
      router.push(`/order-confirmation/${result.order_id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while placing your order. Please try again or order via WhatsApp.');
      setLoading(false);
    }
  };

  const handleWhatsAppInstantOrder = () => {
    const msg = generateOrderWhatsAppMessage({
      orderId: 'New Order Request',
      items: items.map((i) => ({
        name: i.product_name,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      total: grandTotal,
      customerName: fullName || 'Valued Customer',
      customerPhone: mobileNumber || '',
    });
    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-gold font-semibold">Secure Checkout</span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
          Complete Your Order
        </h1>
        <p className="text-gray-400 text-xs mt-1">
          Guest checkout enabled. No mandatory account registration required.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/40 rounded-lg flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Delivery Address & Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-premium p-6 sm:p-8 space-y-6">
            <h2 className="font-heading text-lg font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Truck size={18} className="text-gold" />
              Delivery Details (Tamil Nadu)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-premium">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="label-premium">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 93612 53338"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-premium">Email Address (Optional for invoice)</label>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-premium">Address Line 1 (Flat, House No, Street) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 3B, Sri Meenakshi Apartments, West Veli St"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-premium">Address Line 2 (Landmark, Area)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Periyar Bus Stand"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="label-premium">City / Town *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madurai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="label-premium">District</label>
                <input
                  type="text"
                  placeholder="e.g. Madurai District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="label-premium">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input-premium bg-[#1a1a1a]"
                />
              </div>

              <div>
                <label className="label-premium">Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 625001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-premium">Order Notes / Landmark Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Any special notes for delivery or packaging..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="input-premium"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="card-premium p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Lock size={18} className="text-gold" />
              Payment Preference
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-gold/40 bg-gold/5 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery / Pay on Confirmation'}
                  onChange={() => setPaymentMethod('Cash on Delivery / Pay on Confirmation')}
                  className="accent-gold"
                />
                <div>
                  <div className="text-sm font-semibold text-white">
                    Cash on Delivery / Pay on Confirmation
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Pay safely upon delivery or via UPI after review and photo verification.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-white/10 hover:border-gold/30 bg-black-card cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Direct UPI / GPay / PhonePe'}
                  onChange={() => setPaymentMethod('Direct UPI / GPay / PhonePe')}
                  className="accent-gold"
                />
                <div>
                  <div className="text-sm font-semibold text-white">
                    Direct UPI / GPay / PhonePe (+91 93612 53338)
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Instant verification and immediate printing queue dispatch.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Items + Place Order (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-premium p-6 space-y-5 border border-gold/20 sticky top-24">
            <h2 className="font-heading text-lg font-bold text-white border-b border-white/10 pb-3">
              Items in Your Order
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs py-1 border-b border-white/5">
                  <div className="w-12 h-12 rounded bg-black-elevated overflow-hidden flex-shrink-0 border border-white/10">
                    <img
                      src={item.product_image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{item.product_name}</div>
                    <div className="text-gray-400">
                      {item.size} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-gold font-semibold font-mono">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-gray-400 pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery (Pan Tamil Nadu)</span>
                {deliveryCharge === 0 ? (
                  <span className="text-green-400 font-bold uppercase">FREE</span>
                ) : (
                  <span className="text-white">{formatPrice(deliveryCharge)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Grand Total</span>
                <span className="text-gold font-heading text-xl">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-gold !py-4 w-full text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-gold/20"
              >
                {loading ? (
                  <>
                    <div className="loading-gold w-5 h-5 mr-2" />
                    Saving Order & Generating ID...
                  </>
                ) : (
                  <>
                    Place Order Now <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppInstantOrder}
                className="btn-whatsapp !py-3 w-full text-xs font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Order via WhatsApp (+91 93612 53338)
              </button>
            </div>

            {/* Assurances */}
            <div className="pt-2 text-center text-[11px] text-gray-500 space-y-1">
              <p>🔒 256-Bit SSL Encrypted Order Processing</p>
              <p>Delivery across all districts of Tamil Nadu</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
