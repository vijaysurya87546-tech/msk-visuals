'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Frame,
  CheckCircle2,
  ChevronRight,
  Layers,
  Palette,
  ShieldCheck,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';
import { INITIAL_PRODUCTS, INITIAL_PRICE_LIST } from '@/lib/mockData';
import type { Product, PriceListItem } from '@/lib/types';
import FrameMockupCard from '@/components/frames/FrameMockupCard';
import QuickCustomOrderModal from '@/components/frames/QuickCustomOrderModal';

export default function PhotoFramesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewMockup, setPreviewMockup] = useState<{ url: string; title: string } | null>(null);
  const [customOrderItem, setCustomOrderItem] = useState<PriceListItem | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const [prodRes, priceApiRes] = await Promise.all([
          supabase
            .from('products')
            .select('*, images:product_images(*), sizes:product_sizes(*)')
            .eq('is_active', true)
            .order('sort_order'),
          fetch('/api/price-list').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);

        if (prodRes.data && prodRes.data.length > 0) {
          const frameProducts = prodRes.data.filter(
            (p) =>
              p.name.toLowerCase().includes('frame') ||
              (p.description || '').toLowerCase().includes('frame')
          );
          setProducts(frameProducts.length > 0 ? frameProducts : prodRes.data.slice(0, 8));
        } else {
          const frameProducts = INITIAL_PRODUCTS.filter(
            (p) =>
              p.name.toLowerCase().includes('frame') ||
              (p.description || '').toLowerCase().includes('frame')
          );
          setProducts(frameProducts.length > 0 ? frameProducts : INITIAL_PRODUCTS.slice(0, 8));
        }

        if (priceApiRes?.success && priceApiRes.data && priceApiRes.data.length > 0) {
          setPrices(priceApiRes.data);
        } else {
          // Fallback to supabase direct query or initial list
          const { data: directPrices } = await supabase
            .from('price_list')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
          setPrices(directPrices && directPrices.length > 0 ? directPrices : INITIAL_PRICE_LIST);
        }
      } catch (err) {
        console.error('Failed to load photo frames data:', err);
        setProducts(INITIAL_PRODUCTS.filter((p) => p.name.toLowerCase().includes('frame')));
        setPrices(INITIAL_PRICE_LIST);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const popularSizes = prices.length > 0 ? prices : INITIAL_PRICE_LIST;

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">
      {/* ===== HERO BANNER ===== */}
      <div className="card-premium p-8 sm:p-14 mb-14 text-center relative overflow-hidden border border-gold/25">
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles size={14} /> MSK VISUALS Studio Collection
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
            Luxury Photo Frames
          </h1>
          <p className="text-gold-metallic font-heading text-lg sm:text-xl italic mb-4">
            &ldquo;Framing Memories. Creating Smiles.&rdquo;
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-2xl mx-auto">
            Preserve your life&apos;s most precious celebrations with our bespoke collection of matte black,
            royal metallic gold, minimal synthetic wood, and multi-photo collage frames crafted with utmost precision.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/custom-orders" className="btn-gold !py-2.5 px-6 text-xs">
              Create Custom Frame Order
            </Link>
            <a
              href={BUSINESS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp !py-2.5 px-6 text-xs"
            >
              <MessageCircle size={15} /> Order on WhatsApp (+91 93612 53338)
            </a>
          </div>
        </div>
      </div>

      {/* ===== POPULAR FRAME SIZES & PRICING (Moved from Home Page) ===== */}
      <section className="mb-16 card-premium p-6 sm:p-10 border border-gold/20">
        <div className="text-center mb-10">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2 font-medium">
            FRAME SIZES & ROOM MOCKUPS
          </p>
          <h2 className="section-heading text-gold-gradient text-3xl sm:text-4xl font-bold font-heading">
            Popular Frame Sizes
          </h2>
          <div className="gold-divider-short mt-4 mb-3" />
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Browse our signature dimensions with authentic room-interior mockups to envision how each size fits on your wall.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularSizes.map((item) => (
            <FrameMockupCard
              key={item.id}
              item={item}
              onPreview={(url, title) => setPreviewMockup({ url, title })}
              onCustomOrder={(item) => setCustomOrderItem(item)}
            />
          ))}
        </div>

        <div className="text-center mt-12 pt-6 border-t border-white/5">
          <Link href="/price-list" className="btn-gold-outline !py-2.5 px-6">
            View Full Price List & Dimensions
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Quick Custom Order & Photo Upload Modal */}
      {customOrderItem && (
        <QuickCustomOrderModal
          item={customOrderItem}
          onClose={() => setCustomOrderItem(null)}
        />
      )}

      {/* Lightbox Modal for Mockup Preview */}
      {previewMockup && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewMockup(null)}
        >
          <div
            className="card-premium p-4 max-w-3xl w-full border border-gold/40 space-y-3 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Frame size={16} className="text-gold" />
                <h3 className="font-heading font-bold text-base text-white">
                  {previewMockup.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMockup(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-[4/3] w-full bg-black rounded-lg overflow-hidden border border-white/10">
              <img
                src={previewMockup.url}
                alt={previewMockup.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
              <span>Studio visual preview</span>
              <button
                onClick={() => setPreviewMockup(null)}
                className="btn-gold !py-1 !px-4 text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FEATURED FRAME DESIGNS ===== */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl text-white font-bold">
              Featured Frame Designs
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Top curated frames ready for instant personalization
            </p>
          </div>
          <Link href="/shop?category=photo-frames" className="text-xs text-gold hover:underline flex items-center gap-1">
            View All in Catalog <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="loading-gold w-10 h-10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => {
              const primaryImg =
                prod.images?.[0]?.image_url ||
                'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
              return (
                <div
                  key={prod.id}
                  className="card-premium overflow-hidden group flex flex-col justify-between"
                >
                  <Link href={`/product/${prod.slug}`}>
                    <div className="aspect-square bg-black-elevated overflow-hidden relative">
                      <img
                        src={primaryImg}
                        alt={prod.name}
                        className="w-full h-full object-cover img-zoom"
                      />
                      {prod.discount_percent > 0 && (
                        <span className="badge-discount absolute top-3 left-3">
                          {prod.discount_percent}% OFF
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${prod.slug}`}>
                        <h3 className="text-white font-medium text-base group-hover:text-gold transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {prod.short_description || prod.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-gold font-heading font-bold text-lg">
                        {formatPrice(prod.price)}
                      </span>
                      <Link
                        href={`/product/${prod.slug}`}
                        className="btn-gold !py-2 !px-4 text-xs font-semibold"
                      >
                        Customize & Buy
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== CRAFTSMANSHIP GUARANTEE ===== */}
      <section className="card-premium p-8 sm:p-10 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <Frame size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">Premium Synthetic & Wood</h4>
          <p className="text-xs text-gray-400">Durable, moisture-resistant frames built to last decades.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <ShieldCheck size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">High-Definition Photo Print</h4>
          <p className="text-xs text-gray-400">12-color archival giclée printing with brilliant color fidelity.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <Palette size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">100% Customized For You</h4>
          <p className="text-xs text-gray-400">Add names, dates, quotes & custom arrangements seamlessly.</p>
        </div>
      </section>
    </div>
  );
}
