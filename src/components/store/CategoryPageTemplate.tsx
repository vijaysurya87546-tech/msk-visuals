'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Zap,
  ShieldCheck,
  MessageCircle,
  Eye,
  X,
  Package,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, generateWhatsAppUrl } from '@/lib/utils';
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
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function loadCategoryProducts() {
      const supabase = createClient();

      // 1. Try to find the category by slug
      const { data: catData } = await supabase
        .from('categories')
        .select('id, slug, name')
        .eq('slug', categorySlug)
        .single();

      let filtered: Product[] = [];

      if (catData) {
        // 2. Fetch products matching this category_id directly
        const { data } = await supabase
          .from('products')
          .select('*, images:product_images(*), sizes:product_sizes(*), category:categories(*)')
          .eq('is_active', true)
          .eq('category_id', catData.id)
          .order('sort_order');

        filtered = data || [];
      }

      // 3. Fallback: name/description search
      if (filtered.length === 0) {
        const { data: allData } = await supabase
          .from('products')
          .select('*, images:product_images(*), sizes:product_sizes(*), category:categories(*)')
          .eq('is_active', true);

        const keyword = categorySlug.replace(/-/g, ' ');
        filtered = (allData || []).filter(
          (p) =>
            p.name.toLowerCase().includes(keyword) ||
            (p.description || '').toLowerCase().includes(keyword) ||
            (p as any).category?.slug === categorySlug
        );
      }

      // 4. Last resort: mock data
      if (filtered.length === 0) {
        const keyword = categorySlug.replace(/-/g, ' ');
        filtered = INITIAL_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(keyword) ||
            p.slug.includes(categorySlug) ||
            (p.description || '').toLowerCase().includes(keyword)
        );
      }

      setProducts(filtered);
      setLoading(false);
    }
    loadCategoryProducts();
  }, [categorySlug]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    const primaryImg = product.images?.[0]?.image_url || '';
    const defaultSize = product.sizes?.[0]?.size_label || 'Standard';
    const defaultPrice = product.sizes?.[0]?.price || product.price;
    const defaultMrp = product.sizes?.[0]?.mrp || product.mrp;

    addItem({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      image_url: primaryImg,
      size: defaultSize,
      price: defaultPrice,
      mrp: defaultMrp,
      quantity: 1,
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleWhatsAppOrder = (product: Product) => {
    const msg = `Hello MSK VISUALS,\n\nI want to order:\n🛒 ${product.name}\n💰 Price: ${formatPrice(product.price)}\n\nPlease share availability and details!`;
    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">

      {/* ===== HERO BANNER ===== */}
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
              <MessageCircle size={14} /> Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ===== PRODUCTS GRID (DB-Driven) ===== */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Our {title} Collection
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? 'Loading products...' : `${products.length} product${products.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <Link href={`/shop?category=${categorySlug}`} className="text-xs text-gold hover:underline flex items-center gap-1">
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="loading-gold w-10 h-10" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center card-premium border border-white/5">
            <Package size={44} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Products Yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              Products for this category haven&apos;t been added yet.
            </p>
            <a
              href={BUSINESS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp !py-2 px-5 text-xs inline-flex"
            >
              <MessageCircle size={14} /> Inquire on WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const primaryImg =
                product.images?.[0]?.image_url ||
                'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80';
              const isAdded = addedId === product.id;

              return (
                <div
                  key={product.id}
                  className="card-premium overflow-hidden group flex flex-col border border-white/5 hover:border-gold/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer group/img"
                    onClick={() => setPreviewProduct(product)}
                  >
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-black/80 text-gold text-xs font-medium border border-gold/40 flex items-center gap-1.5">
                        <Eye size={13} /> Quick Preview
                      </span>
                    </div>
                    {/* Discount badge */}
                    {product.discount_percent > 0 && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gold text-black shadow">
                        {product.discount_percent}% OFF
                      </span>
                    )}
                    {/* Featured badge */}
                    {product.is_featured && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 backdrop-blur-sm text-gold border border-gold/30">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="text-white font-heading font-bold text-base group-hover:text-gold transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      {product.short_description && (
                        <p className="text-gold text-xs mt-0.5 font-medium">{product.short_description}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      {product.material && (
                        <p className="text-gray-500 text-[11px] mt-2 flex items-center gap-1">
                          <ShieldCheck size={11} className="text-gold shrink-0" />
                          {product.material}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Actions */}
                    <div className="pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-gold font-heading font-bold text-lg">
                            {formatPrice(product.price)}
                          </div>
                          {product.mrp > product.price && (
                            <div className="text-[10px] text-gray-500 line-through">
                              MRP {formatPrice(product.mrp)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleWhatsAppOrder(product)}
                          className="p-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 rounded-lg transition-colors"
                          title="Order on WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          className="flex-1 btn-gold-outline !py-2 text-xs text-center flex items-center justify-center gap-1"
                        >
                          <Eye size={12} /> Details
                        </Link>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`flex-1 !py-2 text-xs rounded font-semibold flex items-center justify-center gap-1 transition-all ${
                            isAdded ? 'bg-emerald-500 text-white' : 'btn-gold'
                          }`}
                        >
                          {isAdded ? (
                            <><Zap size={12} /> Added!</>
                          ) : (
                            <><ShoppingCart size={12} /> Add to Cart</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== GUARANTEE STRIP ===== */}
      <div className="card-premium p-6 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { icon: '🏆', label: 'Premium Quality' },
          { icon: '🎨', label: 'Custom Designs' },
          { icon: '🚚', label: 'Tamil Nadu Delivery' },
          { icon: '💬', label: 'WhatsApp Support' },
        ].map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-2">
            <span className="text-2xl">{b.icon}</span>
            <span className="text-xs text-gray-300 font-medium">{b.label}</span>
          </div>
        ))}
      </div>

      {/* ===== LIGHTBOX ===== */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="card-premium p-5 max-w-xl w-full border border-gold/40 space-y-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-heading font-bold text-base text-white line-clamp-1">
                {previewProduct.name}
              </h3>
              <button onClick={() => setPreviewProduct(null)} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
              <img
                src={previewProduct.images?.[0]?.image_url || ''}
                alt={previewProduct.name}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-gray-400 line-clamp-3">{previewProduct.description}</p>
            <div className="flex gap-2 pt-1">
              <Link
                href={`/product/${previewProduct.slug}`}
                className="flex-1 btn-gold !py-2 text-xs text-center"
                onClick={() => setPreviewProduct(null)}
              >
                View & Order — {formatPrice(previewProduct.price)}
              </Link>
              <button
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded text-xs border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
