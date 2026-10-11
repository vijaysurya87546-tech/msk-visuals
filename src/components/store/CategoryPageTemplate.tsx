'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShoppingCart, Zap, Frame, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import { BUSINESS } from '@/lib/constants';
import type { Product } from '@/lib/types';

interface Props {
  categorySlug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string;
}

export default function CategoryPageTemplate({
  categorySlug,
  title,
  subtitle,
  description,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function loadCategoryProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), sizes:product_sizes(*)')
        .eq('is_active', true);

      if (data && data.length > 0) {
        const filtered = data.filter((p) =>
          p.name.toLowerCase().includes(categorySlug.replace('-', ' ')) ||
          (p.description || '').toLowerCase().includes(categorySlug.replace('-', ' '))
        );
        setProducts(filtered.length > 0 ? filtered : data.slice(0, 6));
      } else {
        const filtered = INITIAL_PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(categorySlug.replace('-', ' ')) ||
          p.slug.includes(categorySlug) ||
          (p.description || '').toLowerCase().includes(categorySlug.replace('-', ' '))
        );
        setProducts(filtered.length > 0 ? filtered : INITIAL_PRODUCTS.slice(0, 6));
      }
      setLoading(false);
    }
    loadCategoryProducts();
  }, [categorySlug]);

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Category Hero */}
      <div className="card-premium p-8 sm:p-14 mb-12 text-center relative overflow-hidden border border-gold/25">
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles size={14} /> MSK VISUALS Studio Collection
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-3">
            {title}
          </h1>
          <p className="text-gold-metallic font-heading text-lg italic mb-4">
            &ldquo;{subtitle}&rdquo;
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {description}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/custom-orders" className="btn-gold !py-2.5 px-6 text-xs">
              Custom Order
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

      {/* Products Grid */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading text-xl text-white font-bold">Featured Designs</h2>
          <Link href="/shop" className="text-xs text-gold hover:underline flex items-center gap-1">
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
              const primaryImg = prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
              return (
                <div key={prod.id} className="card-premium overflow-hidden group flex flex-col justify-between">
                  <Link href={`/product/${prod.slug}`}>
                    <div className="aspect-square bg-black-elevated overflow-hidden relative">
                      <img src={primaryImg} alt={prod.name} className="w-full h-full object-cover img-zoom" />
                      {prod.discount_percent > 0 && (
                        <span className="badge-discount absolute top-3 left-3">
                          {prod.discount_percent}% OFF
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${prod.slug}`}>
                        <h3 className="text-white font-medium text-sm group-hover:text-gold transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                        {prod.short_description || prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-gold font-heading font-bold text-base">
                        {formatPrice(prod.price)}
                      </span>
                      <Link
                        href={`/product/${prod.slug}`}
                        className="btn-gold !py-1.5 !px-3 text-xs"
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
      </div>
    </div>
  );
}
