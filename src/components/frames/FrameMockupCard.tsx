'use client';

import React from 'react';
import { Eye, Frame, MessageCircle, ArrowRight, Upload } from 'lucide-react';
import { formatPrice, generateWhatsAppUrl } from '@/lib/utils';
import type { PriceListItem } from '@/lib/types';
import Link from 'next/link';

interface FrameMockupCardProps {
  item: PriceListItem;
  onPreview?: (url: string, title: string) => void;
  onCustomOrder?: (item: PriceListItem) => void;
}

export default function FrameMockupCard({ item, onPreview, onCustomOrder }: FrameMockupCardProps) {
  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = `Hello MSK VISUALS,\n\nI want to order a photo frame in size: ${item.size_label} inches.\nPrice: ${formatPrice(item.price)}\n\nPlease share frame design options and instructions for photo upload.`;
    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="card-premium overflow-hidden group flex flex-col justify-between border border-gold/20 hover:border-gold/50 transition-all duration-300 hover:shadow-2xl hover:shadow-black hover:-translate-y-1">
      {/* ===== MOCKUP IMAGE SECTION ===== */}
      <div className="relative aspect-[4/3] w-full bg-[#121212] overflow-hidden border-b border-white/5 select-none">
        {item.image_url ? (
          <div
            className="w-full h-full relative cursor-pointer group/img overflow-hidden"
            onClick={() => onPreview?.(item.image_url!, `${item.size_label} inches — Room Mockup`)}
            title="Click to preview room mockup"
          >
            <img
              src={item.image_url}
              alt={`${item.size_label} inches luxury frame mockup in room interior`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay with preview prompt */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
              <span className="px-3 py-1.5 rounded-full bg-black/80 text-gold text-xs font-medium border border-gold/40 flex items-center gap-1.5 shadow-xl transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
                <Eye size={13} /> View Room Preview
              </span>
            </div>
            {/* Room mockup pill badge */}
            <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-black/80 text-gold border border-gold/30 backdrop-blur-md shadow-md">
              Interior Mockup
            </span>
          </div>
        ) : (
          /* Clean, dedicated fallback room mockup preview (NEVER another size's mockup) */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#181818] via-[#121212] to-[#0a0a0a] relative">
            {/* Top spotlight glow */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />

            {/* Aesthetic framed canvas outline */}
            <div className="relative w-28 h-20 rounded border-2 border-gold/30 bg-black/60 shadow-xl flex items-center justify-center group-hover:border-gold/60 transition-colors">
              <div className="w-24 h-16 rounded-sm border border-gold/20 flex flex-col items-center justify-center bg-black/40 text-center px-1">
                <Frame size={18} className="text-gold/60 mb-0.5" />
                <span className="text-[10px] font-mono text-gold-metallic font-bold">{item.size_label}</span>
              </div>
            </div>

            <span className="text-[11px] text-gray-500 mt-2.5 font-medium tracking-wide">
              Mockup preview coming soon
            </span>
          </div>
        )}
      </div>

      {/* ===== CARD BODY ===== */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-gold font-heading text-xl sm:text-2xl font-bold group-hover:text-gold-metallic transition-colors">
              {item.size_label}
            </h3>
            <span className="text-xs text-gray-400 font-medium">inches</span>
          </div>
          {item.width && item.height && (
            <p className="text-[11px] text-gray-500 mt-0.5">
              {item.width}&quot; width × {item.height}&quot; height
            </p>
          )}
        </div>

        {/* Pricing & Order Actions */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            <div className="text-white font-heading font-bold text-lg sm:text-xl">
              {formatPrice(item.price)}
            </div>
            {item.mrp && item.mrp > item.price && (
              <div className="text-[11px] text-gray-500 line-through">
                MRP {formatPrice(item.mrp)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Custom Order button on left */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCustomOrder) {
                  onCustomOrder(item);
                } else {
                  window.location.href = `/custom-orders?size=${encodeURIComponent(item.size_label)}&type=Photo%20Frames`;
                }
              }}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-white/5 hover:bg-gold/20 text-gold border border-gold/40 hover:border-gold transition-all duration-200 flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95"
              title="Upload photo & customize order for this size"
            >
              <Upload size={12} className="text-gold" />
              <span>Custom Order</span>
            </button>

            {/* Direct WhatsApp Order button */}
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="btn-gold !py-1.5 !px-3 text-xs flex items-center gap-1 shadow-md hover:scale-105 transition-transform whitespace-nowrap"
              title="Order this size via WhatsApp"
            >
              <MessageCircle size={13} />
              <span>ORDER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
