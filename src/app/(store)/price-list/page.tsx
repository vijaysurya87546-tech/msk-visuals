'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, generateWhatsAppUrl } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';
import { INITIAL_PRICE_LIST } from '@/lib/mockData';
import type { PriceListItem } from '@/lib/types';

export default function PriceListPage() {
  const [prices, setPrices] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrices() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('price_list')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (data && data.length > 0) {
        setPrices(data);
      } else {
        setPrices(INITIAL_PRICE_LIST);
      }
      setLoading(false);
    }
    loadPrices();
  }, []);

  const handleWhatsAppSizeOrder = (item: PriceListItem) => {
    const msg = `Hello MSK VISUALS,\n\nI want to order a photo frame in size: ${item.size_label} inches.\nPrice: ${formatPrice(item.price)}\n\nPlease provide frame options and instructions for sending my photo.\n\nThank you!`;
    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold flex items-center justify-center gap-1.5">
          <Sparkles size={14} /> Official MSK Visuals Pricing
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-2">
          Photo Frame <span className="text-gold-gradient">Price List</span>
        </h1>
        <div className="gold-divider-short mt-4 mb-4" />
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Transparent, factory-direct pricing for all custom dimensions. High-definition luster printing, premium framing, and safe packing across Tamil Nadu included.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="card-premium p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">HD Print Included</h3>
            <p className="text-[11px] text-gray-500">Museum quality fade-proof photo</p>
          </div>
        </div>

        <div className="card-premium p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Luxury Gold & Matte Frame</h3>
            <p className="text-[11px] text-gray-500">Dust & moisture sealed backplate</p>
          </div>
        </div>

        <div className="card-premium p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
            <Package size={18} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Safe Corner Packaging</h3>
            <p className="text-[11px] text-gray-500">Shipped across all TN districts</p>
          </div>
        </div>
      </div>

      {/* Main Pricing Table */}
      <div className="card-premium overflow-hidden border border-gold/20 shadow-2xl shadow-black/80">
        <div className="bg-[#141414] px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Standard & Custom Frame Dimensions</h2>
            <p className="text-xs text-gray-400">All sizes measured in inches (Width x Height)</p>
          </div>
          <span className="text-xs text-gold border border-gold/30 px-3 py-1 rounded-full bg-gold/5">
            Updated for 2026
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="loading-gold w-10 h-10" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#111111] text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-6">Size (Inches)</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">MRP</th>
                  <th className="py-3.5 px-6">Special Offer Price</th>
                  <th className="py-3.5 px-6 text-right">Instant Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {prices.map((item, idx) => {
                  const isLarge = (item.width || 0) >= 20 || (item.height || 0) >= 20;
                  const isMini = (item.width || 0) <= 6;
                  const categoryTag = isMini ? 'Mini Gift' : isLarge ? 'Statement Wall' : 'Classic Portrait';

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-4 px-6 font-semibold text-white group-hover:text-gold flex items-center gap-2">
                        <span className="text-gold font-mono text-sm">{item.size_label}</span>
                        <span className="text-xs text-gray-500 font-normal">inches</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-gray-300">
                          {categoryTag}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 line-through text-xs">
                        {formatPrice(item.mrp || item.price * 1.4)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gold font-bold text-base font-heading">
                          {formatPrice(item.price)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleWhatsAppSizeOrder(item)}
                            className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors text-xs flex items-center gap-1"
                            title="Order this size on WhatsApp"
                          >
                            <MessageCircle size={15} />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                          <Link
                            href={`/custom-orders?size=${encodeURIComponent(item.size_label)}`}
                            className="btn-gold !py-1 !px-3 text-xs flex items-center gap-1"
                          >
                            Customize <ArrowRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Size CTA */}
      <div className="card-premium p-8 mt-12 text-center bg-gradient-to-r from-black-deep via-[#141414] to-black-deep border border-gold/30">
        <h3 className="font-heading text-2xl font-bold text-white mb-2">
          Need a Custom Frame Size not listed here?
        </h3>
        <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
          We manufacture custom frames up to 60 inches for corporate offices, galleries, temples, and luxury residences.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/custom-orders" className="btn-gold">
            Submit Custom Dimensions
          </Link>
          <a
            href={BUSINESS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle size={18} />
            Ask on WhatsApp (+91 93612 53338)
          </a>
        </div>
      </div>
    </div>
  );
}
