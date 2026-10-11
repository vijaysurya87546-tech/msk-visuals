'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Star,
  Package,
  Zap,
  MapPin,
  Shield,
  MessageCircle,
  Frame,
  Printer,
  Gem,
  Flame,
  PenTool,
  Award,
  Palette,
  ChevronRight,
  Sparkles,
  Heart,
  Truck,
} from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { BUSINESS, SERVICES, WHY_CHOOSE_US } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/brand/Logo';
import WelcomeScreen from '@/components/home/WelcomeScreen';
import type { Product, Review, PriceListItem } from '@/lib/types';

const iconMap: Record<string, React.ReactNode> = {
  Frame: <Frame size={28} />,
  Printer: <Printer size={28} />,
  Gem: <Gem size={28} />,
  Flame: <Flame size={28} />,
  PenTool: <PenTool size={28} />,
  Award: <Award size={22} />,
  Palette: <Palette size={22} />,
  Package: <Package size={22} />,
  Zap: <Zap size={22} />,
  MapPin: <MapPin size={22} />,
  MessageCircle: <MessageCircle size={22} />,
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [prices, setPrices] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const [productsRes, reviewsRes, pricesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, images:product_images(*)')
          .eq('is_featured', true)
          .eq('is_active', true)
          .order('sort_order')
          .limit(8),
        supabase
          .from('reviews')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('price_list')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')
          .limit(8),
      ]);

      const { INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_PRICE_LIST } = await import('@/lib/mockData');
      setFeaturedProducts(productsRes.data && productsRes.data.length > 0 ? productsRes.data : INITIAL_PRODUCTS.slice(0, 8));
      setReviews(reviewsRes.data && reviewsRes.data.length > 0 ? reviewsRes.data : INITIAL_REVIEWS);
      setPrices(pricesRes.data && pricesRes.data.length > 0 ? pricesRes.data : INITIAL_PRICE_LIST.slice(0, 8));
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div>
      <WelcomeScreen />

      {/* ===== HERO SECTION ===== */}
      <section className="hero-gradient relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold/3 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gold/2 rounded-full blur-[100px]" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(212,168,83,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-20">
          {/* Official MSK VISUALS Wolf Logo */}
          <div className="mx-auto mb-8 animate-fade-in flex justify-center">
            <Logo size="hero" />
          </div>

          {/* Brand Name */}
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide mb-2 animate-fade-in-up">
            <span className="text-gold-gradient">MSK VISUALS</span>
          </h1>

          {/* Tagline */}
          <div className="mt-4 mb-6 animate-fade-in-up delay-100">
            <p className="text-xl sm:text-2xl md:text-3xl font-heading font-light text-white/90 tracking-[0.08em]">
              WE DESIGN.{' '}
              <span className="text-gold">YOU IMPRESS.</span>
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-gold-metallic font-heading text-lg sm:text-xl italic mb-4 animate-fade-in-up delay-200">
            &ldquo;Framing Memories. Creating Smiles.&rdquo;
          </p>

          {/* Description */}
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 animate-fade-in-up delay-300 leading-relaxed">
            {BUSINESS.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-400">
            <Link href="/shop" className="btn-gold text-sm px-10 py-3.5">
              Shop Now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/custom-orders"
              className="btn-gold-outline text-sm px-10 py-3.5"
            >
              Custom Order
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto animate-fade-in-up delay-500">
            {[
              { value: '500+', label: 'Happy Customers' },
              { value: '1000+', label: 'Orders Delivered' },
              { value: '50+', label: 'Products' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-gold font-heading text-2xl font-bold">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border border-gold/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gold/50 rounded-full mt-1.5" />
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 section-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">
              Curated Selection
            </p>
            <h2 className="section-heading text-gold-gradient">
              Featured Products
            </h2>
            <div className="gold-divider-short mt-5 mb-4" />
            <p className="section-subheading">
              Discover our handpicked collection of premium products crafted with love and precision.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loading-gold w-10 h-10" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="card-premium overflow-hidden group"
                >
                  <div className="aspect-square bg-black-elevated relative overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0].image_url}
                        alt={product.name}
                        className="w-full h-full object-cover img-zoom"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Frame size={48} className="text-gold/20" />
                      </div>
                    )}
                    {product.discount_percent > 0 && (
                      <span className="badge-discount absolute top-3 left-3">
                        {product.discount_percent}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white group-hover:text-gold transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gold font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-gray-500 text-sm line-through">
                          {formatPrice(product.mrp)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Frame size={48} className="text-gold/20 mx-auto mb-4" />
              <p className="text-gray-500">Products coming soon. Stay tuned!</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/shop" className="btn-gold-outline">
              View All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="py-20 section-darker">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">
              What We Offer
            </p>
            <h2 className="section-heading text-gold-gradient">Our Services</h2>
            <div className="gold-divider-short mt-5 mb-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {SERVICES.map((service, i) => (
              <Link
                key={service.title}
                href={service.slug === 'photo-frames' ? '/photo-frames' : `/shop?category=${service.slug}`}
                className="card-premium p-6 text-center group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold/10 group-hover:border-gold/40 transition-all">
                  {iconMap[service.icon]}
                </div>
                <h3 className="font-heading font-semibold text-white mt-4 mb-2 text-sm">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1 text-gold text-xs mt-3 group-hover:gap-2 transition-all">
                  View More <ChevronRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 section-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">
              Our Promise
            </p>
            <h2 className="section-heading text-gold-gradient">
              Why Choose MSK VISUALS
            </h2>
            <div className="gold-divider-short mt-5 mb-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE_US.map((item, i) => (
              <div
                key={item.title}
                className="card-premium p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                  {iconMap[item.icon]}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CUSTOM ORDER CTA ===== */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <Palette size={40} className="text-gold mx-auto mb-6" />
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Your Memory, Your Design
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Can&apos;t find exactly what you want? Create a custom order with your own
            photos, designs, and specifications. We&apos;ll bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/custom-orders" className="btn-gold">
              Create Custom Order
              <ArrowRight size={16} />
            </Link>
            <a
              href={BUSINESS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle size={18} />
              Order via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ===== DELIVERY ===== */}
      <section className="py-20 section-darker">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">
              Pan Tamil Nadu
            </p>
            <h2 className="section-heading text-gold-gradient">
              Delivery Across Tamil Nadu
            </h2>
            <div className="gold-divider-short mt-5 mb-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: <Shield size={32} />,
                title: 'Safe Packing',
                desc: 'Premium protective packaging for every order.',
              },
              {
                icon: <Zap size={32} />,
                title: 'Fast Dispatch',
                desc: 'Quick processing and same-day dispatch.',
              },
              {
                icon: <Truck size={32} />,
                title: 'Pan Tamil Nadu',
                desc: 'Reliable delivery across all districts.',
              },
            ].map((item) => (
              <div key={item.title} className="card-premium p-6 text-center">
                <div className="text-gold mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="py-20 section-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">
              Testimonials
            </p>
            <h2 className="section-heading text-gold-gradient">
              Customer Reviews
            </h2>
            <div className="gold-divider-short mt-5 mb-4" />
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="card-premium p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? 'text-gold fill-gold'
                            : 'text-gray-600'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    &ldquo;{review.review}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                      <span className="text-gold text-xs font-bold">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">{review.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Priya S.', rating: 5, review: 'Absolutely stunning photo frames! The quality exceeded my expectations. Perfect gift for my parents\' anniversary.' },
                { name: 'Karthik R.', rating: 5, review: 'The custom resin art coasters are beautiful. MSK VISUALS truly understands premium craftsmanship.' },
                { name: 'Deepa M.', rating: 5, review: 'Fast delivery and excellent packaging. The wedding frame was perfect. Highly recommended!' },
              ].map((review, i) => (
                <div key={i} className="card-premium p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        className={
                          j < review.rating
                            ? 'text-gold fill-gold'
                            : 'text-gray-600'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    &ldquo;{review.review}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                      <span className="text-gold text-xs font-bold">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">{review.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== INSTAGRAM / SOCIAL ===== */}
      <section className="py-20 section-darker">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <InstagramIcon size={36} className="text-pink-400 mx-auto mb-4" />
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Follow Our Creations
          </h2>
          <p className="text-gray-400 mb-8">
            Stay updated with our latest designs and products on Instagram.
          </p>
          <a
            href={BUSINESS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold-outline"
          >
            <InstagramIcon size={16} />
            Follow {BUSINESS.instagram}
          </a>
        </div>
      </section>

      {/* ===== WHATSAPP CTA ===== */}
      <section className="py-16 bg-gradient-to-r from-[#0d0d0d] via-[#111] to-[#0d0d0d] border-y border-gold/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart size={28} className="text-gold mx-auto mb-4" />
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Create Something Beautiful?
          </h2>
          <p className="text-gray-400 mb-8">
            Get in touch with us on WhatsApp for quick ordering and support.
          </p>
          <a
            href={BUSINESS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp text-base px-10 py-4"
          >
            <MessageCircle size={20} />
            Chat on WhatsApp
          </a>
          <p className="text-gray-600 text-sm mt-4">{BUSINESS.whatsapp}</p>
        </div>
      </section>
    </div>
  );
}
