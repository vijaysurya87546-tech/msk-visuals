'use client';

import Link from 'next/link';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice, generateOrderWhatsAppMessage, generateWhatsAppUrl } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  // Delivery calculation: Free delivery above 500, else 50
  const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + deliveryCharge;

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    const msg = generateOrderWhatsAppMessage({
      orderId: 'Direct Cart Inquiry',
      items: items.map((i) => ({
        name: i.product_name,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      total: grandTotal,
      customerName: 'Customer',
      customerPhone: '',
    });
    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-6 gold-glow">
          <ShoppingBag size={36} />
        </div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Looks like you haven&apos;t added any luxury photo frames or bespoke art pieces to your collection yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link href="/shop" className="btn-gold">
            Browse Shop Collection <ArrowRight size={16} />
          </Link>
          <Link href="/price-list" className="btn-dark">
            View Price List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/10 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">Your Bag</span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
            Shopping Cart
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
        >
          <Trash2 size={14} /> Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div
              key={`${item.product_id}-${item.size}-${idx}`}
              className="card-premium p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
            >
              {/* Product Info & Thumb */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-20 h-20 bg-black-elevated rounded-md overflow-hidden border border-white/10 flex-shrink-0 relative">
                  <img
                    src={item.product_image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                  {item.uploaded_image && (
                    <div className="absolute bottom-0 inset-x-0 bg-gold/90 text-black text-[9px] font-bold text-center py-0.5">
                      Photo Added
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-medium text-white text-sm sm:text-base truncate">
                    {item.product_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      Size: <strong className="text-gold">{item.size}</strong>
                    </span>
                    {item.customization_name && (
                      <span className="text-gray-300">
                        Name: &quot;{item.customization_name}&quot;
                      </span>
                    )}
                  </div>
                  <div className="text-gold font-heading font-semibold text-sm mt-1 sm:hidden">
                    {formatPrice(item.price)}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Price */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-white/5">
                <div className="flex items-center border border-white/15 rounded bg-black-elevated">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                    className="p-1.5 text-gray-400 hover:text-gold"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-3 text-xs font-semibold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                    className="p-1.5 text-gray-400 hover:text-gold"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="text-right min-w-[90px]">
                  <div className="text-gold font-heading font-bold text-base">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {formatPrice(item.price)} each
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.product_id, item.size)}
                  className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Continue Shopping button */}
          <div className="pt-2">
            <Link
              href="/shop"
              className="text-xs text-gold hover:underline inline-flex items-center gap-1.5"
            >
              ← Continue Shopping for more products
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="space-y-6">
          <div className="card-premium p-6 space-y-5 border border-gold/20">
            <h2 className="font-heading font-bold text-lg text-white border-b border-white/10 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="text-white font-medium">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span className="flex items-center gap-1">
                  Delivery Across Tamil Nadu
                </span>
                {deliveryCharge === 0 ? (
                  <span className="text-green-400 font-semibold uppercase text-xs">
                    FREE
                  </span>
                ) : (
                  <span className="text-white font-medium">{formatPrice(deliveryCharge)}</span>
                )}
              </div>

              {subtotal > 500 && (
                <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded text-[11px] text-green-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Congratulations! You unlocked Free Tamil Nadu Delivery!
                </div>
              )}

              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="text-base font-semibold text-white">Grand Total</span>
                <div className="text-right">
                  <div className="text-gold font-heading text-2xl font-bold">
                    {formatPrice(grandTotal)}
                  </div>
                  <div className="text-[10px] text-gray-500">Incl. all taxes & packing</div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href="/checkout"
                className="btn-gold !py-3.5 w-full text-center text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold/15"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <button
                onClick={handleWhatsAppCheckout}
                className="btn-whatsapp !py-3 w-full text-xs font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Order this Cart on WhatsApp
              </button>
            </div>
          </div>

          {/* Assurances */}
          <div className="p-4 bg-black-card rounded-lg border border-white/5 space-y-2.5 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck size={16} className="text-gold" />
              <span>100% Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Truck size={16} className="text-gold" />
              <span>Safe Corner Packaging & Dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
