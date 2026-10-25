'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Flame,
  Palette,
  ShieldCheck,
  X,
  Eye,
  Feather,
  Clock,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, generateWhatsAppUrl } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import { useCartStore } from '@/store/cart';
import type { Product } from '@/lib/types';

const DIY_CANDLE_CATEGORY_ID = '5274aa96-cecf-4a70-b6f2-f81c303c2b80'; // Supabase UUID
const DIY_CANDLE_MOCK_CAT = 'cat-8'; // fallback mock category

export default function DiyCandlesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [addedPopup, setAddedPopup] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function loadCandlesData() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*, images:product_images(*), sizes:product_sizes(*), category:categories(*)')
          .eq('is_active', true)
          .order('sort_order');

        if (data && data.length > 0) {
          const candleProducts = data.filter(
            (p) =>
              p.category_id === DIY_CANDLE_CATEGORY_ID ||
              (p as any).category?.slug === 'diy-candles' ||
              p.name.toLowerCase().includes('candle') ||
              p.slug?.includes('candle') ||
              (p.description || '').toLowerCase().includes('soy wax')
          );
          if (candleProducts.length > 0) {
            setProducts(candleProducts);
          } else {
            setProducts(INITIAL_PRODUCTS.filter(
              (p) => p.category_id === DIY_CANDLE_MOCK_CAT || p.name.toLowerCase().includes('candle')
            ));
          }
        } else {
          setProducts(INITIAL_PRODUCTS.filter(
            (p) => p.category_id === DIY_CANDLE_MOCK_CAT || p.name.toLowerCase().includes('candle')
          ));
        }
      } catch (err) {
        console.error('Failed to load DIY candles:', err);
        setProducts(INITIAL_PRODUCTS.filter(
          (p) => p.category_id === DIY_CANDLE_MOCK_CAT
        ));
      } finally {
        setLoading(false);
      }
    }
    loadCandlesData();
  }, []);

  const handleWhatsAppOrder = (product: Product) => {
    const msg = `Hello MSK VISUALS,\n\nI want to order your handcrafted candle:\n🕯️ ${product.name}\n💰 Price: ${formatPrice(product.price)}\n\nPlease share availability and delivery details!`;
    window.open(generateWhatsAppUrl(msg), '_blank');
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
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

    setAddedPopup(product.id);
    setTimeout(() => setAddedPopup(null), 2000);
  };

  // Show first 6 featured products in the signature section
  const featuredProducts = products.slice(0, 6);
  // All products below
  const allProducts = products;

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">

      {/* ===== HERO BANNER ===== */}
      <div className="card-premium p-8 sm:p-14 mb-14 text-center relative overflow-hidden border border-gold/25">
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles size={14} /> MSK VISUALS Studio Collection
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
            Artisan Hand-Poured DIY Candles
          </h1>
          <p className="text-gold-metallic font-heading text-lg sm:text-xl italic mb-4">
            &ldquo;Crafting Warmth. Burning Pure Serenity.&rdquo;
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-2xl mx-auto">
            Experience therapeutic relaxation with our artisanal collection of hand-carved floral candles,
            aesthetic bubble cubes, and aromatherapy apothecary jars hand-poured with 100% natural organic soy wax and pure essential oils.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/custom-orders" className="btn-gold !py-2.5 px-6 text-xs">
              Order Custom Candle Design
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

      {/* ===== POPULAR HAND-POURED STYLES (6 Featured – DB Driven) ===== */}
      <section className="mb-16 card-premium p-6 sm:p-10 border border-gold/20">
        <div className="text-center mb-10">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2 font-medium flex items-center justify-center gap-1.5">
            <Flame size={14} className="text-gold" /> SIGNATURE VESSELS & SCENTED DESIGNS
          </p>
          <h2 className="section-heading text-gold-gradient text-3xl sm:text-4xl font-bold font-heading">
            Our Signature Candle Collection
          </h2>
          <div className="gold-divider-short mt-4 mb-3" />
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Handcrafted soy wax candles in luxury glass vessels — each one a unique piece of aromatic art made in Madurai.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="loading-gold w-10 h-10" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Flame size={40} className="text-gold/30 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No candle products added yet.</p>
            <Link href="/admin/dashboard" className="btn-gold !py-2 px-5 text-xs mt-4 inline-flex">
              Add Products from Admin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const primaryImg = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80';
              const isAdded = addedPopup === product.id;

              return (
                <div
                  key={product.id}
                  className="card-premium overflow-hidden group flex flex-col justify-between border border-gold/20 hover:border-gold/50 transition-all duration-300 hover:shadow-2xl hover:shadow-black hover:-translate-y-1"
                >
                  {/* Product Image with Lightbox */}
                  <div
                    className="relative aspect-[4/3] w-full bg-[#121212] overflow-hidden cursor-pointer group/img"
                    onClick={() => setPreviewProduct(product)}
                    title="Click to preview"
                  >
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <span className="px-3 py-1.5 rounded-full bg-black/80 text-gold text-xs font-medium border border-gold/40 flex items-center gap-1.5 shadow-xl">
                        <Eye size={13} /> View Full Preview
                      </span>
                    </div>
                    {/* Discount badge */}
                    {product.discount_percent > 0 && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gold text-black shadow-md">
                        {product.discount_percent}% OFF
                      </span>
                    )}
                    {/* Burn time badge from material */}
                    {product.material && (
                      <span className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-gray-200 border border-white/10 flex items-center gap-1">
                        <Flame size={10} className="text-gold" /> Soy Wax
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="text-white font-heading text-base font-bold group-hover:text-gold transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      {product.short_description && (
                        <p className="text-gold text-xs font-medium mt-0.5">
                          {product.short_description}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Material / Scent info */}
                      {product.material && (
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-300 bg-white/5 p-2 rounded border border-white/5">
                          <Feather size={12} className="text-gold shrink-0" />
                          <span className="truncate">{product.material}</span>
                        </div>
                      )}

                      {/* Sizes available */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.sizes.slice(0, 2).map((s) => (
                            <span key={s.id} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                              {s.size_label}
                            </span>
                          ))}
                          {product.sizes.length > 2 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                              +{product.sizes.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pricing & CTAs */}
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
                          <MessageCircle size={16} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          className="flex-1 btn-gold-outline !py-2 text-xs text-center flex items-center justify-center gap-1"
                        >
                          <Eye size={13} /> View Details
                        </Link>
                        <button
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`flex-1 !py-2 text-xs flex items-center justify-center gap-1 rounded font-semibold transition-all ${
                            isAdded
                              ? 'bg-emerald-500 text-white'
                              : 'btn-gold'
                          }`}
                        >
                          {isAdded ? (
                            <><Zap size={13} /> Added!</>
                          ) : (
                            <><ShoppingCart size={13} /> Add to Cart</>
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

        <div className="text-center mt-12 pt-6 border-t border-white/5">
          <Link href="/shop?category=diy-candles" className="btn-gold-outline !py-2.5 px-6">
            View All Candles in Catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Lightbox Modal */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="card-premium p-4 max-w-2xl w-full border border-gold/40 space-y-3 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-gold" />
                <h3 className="font-heading font-bold text-base text-white line-clamp-1">
                  {previewProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-[4/3] w-full bg-black rounded-lg overflow-hidden border border-white/10">
              <img
                src={previewProduct.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'}
                alt={previewProduct.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2">
              {previewProduct.material && (
                <p className="text-xs text-gray-300">
                  <span className="text-gold font-semibold">Material:</span> {previewProduct.material}
                </p>
              )}
              <p className="text-xs text-gray-400 line-clamp-3">{previewProduct.description}</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Link
                href={`/product/${previewProduct.slug}`}
                className="flex-1 btn-gold !py-2 text-xs text-center"
                onClick={() => setPreviewProduct(null)}
              >
                Customize & Buy — {formatPrice(previewProduct.price)}
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

      {/* ===== ALL CANDLE PRODUCTS (Full Catalog Row) ===== */}
      {allProducts.length > 6 && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl text-white font-bold flex items-center gap-2">
                <Flame size={24} className="text-gold" /> More Candle Designs
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Explore our complete handcrafted collection
              </p>
            </div>
            <Link href="/shop?category=diy-candles" className="text-xs text-gold hover:underline flex items-center gap-1">
              Shop All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProducts.slice(6).map((prod) => {
              const primaryImg = prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80';
              const isAdded = addedPopup === prod.id;
              return (
                <div key={prod.id} className="card-premium overflow-hidden group flex flex-col justify-between">
                  <Link href={`/product/${prod.slug}`}>
                    <div className="aspect-square bg-black-elevated overflow-hidden relative">
                      <img src={primaryImg} alt={prod.name} className="w-full h-full object-cover img-zoom" />
                      {prod.discount_percent > 0 && (
                        <span className="badge-discount absolute top-3 left-3">{prod.discount_percent}% OFF</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${prod.slug}`}>
                        <h3 className="text-white font-medium text-sm group-hover:text-gold transition-colors line-clamp-1">{prod.name}</h3>
                      </Link>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{prod.short_description || prod.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-gold font-heading font-bold text-base">{formatPrice(prod.price)}</span>
                      <button
                        onClick={(e) => handleQuickAdd(prod, e)}
                        className={`btn-gold !py-1.5 !px-3 text-xs flex items-center gap-1 ${isAdded ? 'bg-emerald-500 border-emerald-500' : ''}`}
                      >
                        {isAdded ? 'Added!' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== CRAFTSMANSHIP GUARANTEE ===== */}
      <section className="card-premium p-8 sm:p-10 border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-6 text-center mb-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <Flame size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">100% Natural Soy Wax</h4>
          <p className="text-xs text-gray-400">Zero toxic paraffin, soot-free, biodegradable and clean burning.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <Feather size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">Therapeutic Essential Oils</h4>
          <p className="text-xs text-gray-400">Infused with natural French lavender, damask rose, and sweet vanilla.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <Palette size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">Handmade Floral Art</h4>
          <p className="text-xs text-gray-400">Delicately sculpted petals and custom wax designs hand-poured in Madurai.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <ShieldCheck size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">Lead-Free Cotton Wicks</h4>
          <p className="text-xs text-gray-400">Safe, even melt pools that burn consistently for up to 50+ hours.</p>
        </div>
      </section>

      {/* ===== BULK & CUSTOM GIFTING CTA ===== */}
      <div className="card-premium p-8 sm:p-12 text-center border border-gold/30 relative overflow-hidden bg-gradient-to-r from-black via-gold/5 to-black">
        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
          Customized Gifting & Bulk Event Favors
        </h3>
        <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">
          Planning a wedding return gift, corporate hampers, or anniversary celebration?
          We customize colors, fragrances, monogram wax seals, and luxury packaging.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/custom-orders" className="btn-gold !py-2.5 px-6 text-xs">
            Request Bulk Quote
          </Link>
          <a
            href={BUSINESS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp !py-2.5 px-6 text-xs"
          >
            <MessageCircle size={15} /> WhatsApp Bulk Inquiry
          </a>
        </div>
      </div>
    </div>
  );
}
