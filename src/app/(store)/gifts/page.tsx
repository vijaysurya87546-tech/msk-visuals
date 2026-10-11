'use client';

import Link from 'next/link';
import {
  Gift,
  MessageCircle,
  ArrowRight,
  Star,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

const GIFT_PRODUCTS = [
  {
    name: 'Water Bottle',
    emoji: '🍶',
    description: 'Custom photo-printed insulated stainless steel water bottle. Perfect for birthdays, anniversaries & farewell gifts.',
    tags: ['Birthday', 'Office Gift', 'Personalized'],
    popular: false,
  },
  {
    name: 'Fur Pillow',
    emoji: '🧸',
    description: 'Ultra-soft luxury fur pillow with your cherished photo printed in vibrant, long-lasting colors.',
    tags: ['Home Decor', 'Anniversary', 'Gifting'],
    popular: true,
  },
  {
    name: 'LED Pillow',
    emoji: '💡',
    description: 'Glowing LED pillow with custom photo print. Soft light-up cushion that illuminates your favorite memory.',
    tags: ['Unique Gift', 'LED', 'Birthday'],
    popular: true,
  },
  {
    name: 'Magic Pillow',
    emoji: '✨',
    description: 'Sequin magic pillow that reveals your hidden photo when you swipe — a mesmerizing surprise gift.',
    tags: ['Magic', 'Surprise Gift', 'Party'],
    popular: true,
  },
  {
    name: 'Big Heart Pillow',
    emoji: '❤️',
    description: 'Giant heart-shaped pillow with your photo or message. The ultimate gesture of love and care.',
    tags: ["Valentine's Day", 'Anniversary', 'Love'],
    popular: false,
  },
  {
    name: 'Album Pillow',
    emoji: '📸',
    description: 'Multi-photo album-style collage pillow — fit multiple memories together into one beautiful keepsake.',
    tags: ['Collage', 'Family Gift', 'Wedding'],
    popular: false,
  },
  {
    name: 'Magic Mirror',
    emoji: '🪞',
    description: 'Illuminated LED magic mirror that displays your photo or message with soft golden backlit glow.',
    tags: ['LED', 'Premium', 'Desk Gift'],
    popular: true,
  },
  {
    name: 'LED Rotation Box',
    emoji: '🎁',
    description: 'Rotating LED photo cube box that displays 4 to 6 photos with a 360 degree rotating glow. A showstopper gift.',
    tags: ['LED', 'Rotating', 'Anniversary'],
    popular: true,
  },
  {
    name: 'LED Bluetooth Speaker',
    emoji: '🔊',
    description: 'Custom photo-printed wireless Bluetooth speaker with colorful LED lighting. Music meets memories.',
    tags: ['Speaker', 'Tech Gift', 'Birthday'],
    popular: false,
  },
  {
    name: 'LED Alarm Clock',
    emoji: '⏰',
    description: 'Customized LED digital alarm clock with your photo or text. A stylish and functional desk gift.',
    tags: ['Clock', 'Desk Gift', 'Practical'],
    popular: false,
  },
  {
    name: 'Caricature',
    emoji: '🎨',
    description: 'Hand-crafted cartoon caricature portrait created from your photo — funny, artistic and memorable.',
    tags: ['Art', 'Unique', 'Cartoon'],
    popular: true,
  },
  {
    name: 'Puzzle Frame',
    emoji: '🧩',
    description: 'Your photo as a jigsaw puzzle in a beautiful frame. Put the pieces together and relive the memory.',
    tags: ['Puzzle', 'Activity Gift', 'Fun'],
    popular: false,
  },
  {
    name: 'Key Chain',
    emoji: '🔑',
    description: 'Personalized custom photo keychains in various materials — acrylic, leather, metal and more.',
    tags: ['Keychain', 'Compact', 'Everyday Gift'],
    popular: false,
  },
];

const OCCASIONS = [
  { label: 'Birthdays', icon: '🎂' },
  { label: 'Anniversaries', icon: '💍' },
  { label: "Valentine's Day", icon: '❤️' },
  { label: 'Weddings', icon: '💒' },
  { label: 'Farewell', icon: '👋' },
  { label: 'Festivals', icon: '🪔' },
  { label: 'Baby Shower', icon: '👶' },
  { label: 'Corporate Gifts', icon: '🏢' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose a Product',
    desc: 'Pick any gift from our collection — pillows, LED items, keychains and more.',
  },
  {
    step: '02',
    title: 'Share Your Photo',
    desc: 'Send us your high-resolution photo via WhatsApp or our Custom Orders page.',
  },
  {
    step: '03',
    title: 'We Craft It',
    desc: 'Our team prints, assembles, and quality-checks your personalized gift with care.',
  },
  {
    step: '04',
    title: 'Delivered to You',
    desc: 'Safely packed and dispatched to your doorstep anywhere across Tamil Nadu.',
  },
];

export default function GiftsPage() {
  const baseMsg = encodeURIComponent(
    'Hello MSK VISUALS,\n\nI am interested in ordering a personalized gift.\n\nPlease share the available options, pricing, and delivery details.\n\nThank you!'
  );
  const whatsappUrl = 'https://wa.me/' + BUSINESS.whatsapp + '?text=' + baseMsg;

  const trustBadges = [
    { icon: <CheckCircle2 size={15} />, label: 'Custom Photo Printing' },
    { icon: <Star size={15} />, label: 'Premium Quality' },
    { icon: <ShoppingBag size={15} />, label: 'Safe Packaged Delivery' },
    { icon: <Sparkles size={15} />, label: 'Same-Day Dispatch Available' },
  ];

  return (
    <div className="min-h-screen">
      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#110c00] to-[#0a0a0a]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs uppercase tracking-[0.25em] font-semibold mb-6">
              <Gift size={13} />
              MSK VISUALS Gift Collection
            </span>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Personalized{' '}
              <span className="text-gold-gradient">Gifts</span>
            </h1>
            <p className="text-gold-metallic font-heading text-xl sm:text-2xl italic mb-6">
              &ldquo;Every Gift, A Memory. Every Memory, A Gift.&rdquo;
            </p>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10">
              Give the most heartfelt gift — one crafted uniquely with their photo, name, or memory.
              From glowing LED novelties to custom pillows, keychains, caricatures and more.
              Delivered across Tamil Nadu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/custom-orders" className="btn-gold !py-3.5 !px-8 text-sm">
                Order a Custom Gift
                <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !py-3.5 !px-8 text-sm"
              >
                <MessageCircle size={17} />
                Order on WhatsApp (+91 93612 53338)
              </a>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300"
              >
                <span className="text-gold">{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OCCASIONS STRIP ===== */}
      <section className="bg-[#0d0d0d] border-y border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs uppercase tracking-widest text-gold font-semibold mr-2">
              Perfect For:
            </span>
            {OCCASIONS.map((occasion) => (
              <span
                key={occasion.label}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gold/5 border border-gold/15 text-gray-300 text-xs font-medium hover:border-gold/40 hover:text-gold transition-all cursor-default"
              >
                {occasion.icon} {occasion.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GIFT PRODUCTS GRID ===== */}
      <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">Our Collection</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            All Gift Products
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4" />
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Choose any product and personalize it with your photo, name, or custom message.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {GIFT_PRODUCTS.map((product) => {
            const productMsg = encodeURIComponent(
              'Hello MSK VISUALS,\n\nI am interested in ordering a custom "' +
                product.name +
                '" as a personalized gift.\n\nPlease share pricing and delivery details.\n\nThank you!'
            );
            const productWaUrl = 'https://wa.me/' + BUSINESS.whatsapp + '?text=' + productMsg;

            return (
              <div
                key={product.name}
                className="card-premium group relative flex flex-col overflow-hidden hover:border-gold/40 transition-all duration-300"
              >
                {product.popular && (
                  <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-gold text-black text-[10px] font-bold rounded-full uppercase tracking-wide shadow-lg">
                    Popular
                  </span>
                )}

                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-[#141414] to-[#0d0d0d] border-b border-white/5 group-hover:from-gold/5 transition-all duration-500">
                  <span className="text-7xl sm:text-8xl transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg select-none">
                    {product.emoji}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-heading font-semibold text-white text-base mb-2 group-hover:text-gold transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-gray-400 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={productWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs font-semibold hover:bg-gold hover:text-black transition-all duration-300"
                  >
                    <MessageCircle size={13} />
                    Order via WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/custom-orders" className="btn-gold-outline inline-flex items-center gap-2">
            <Gift size={16} />
            Place a Custom Gift Order
            <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-[#0d0d0d] border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">Simple Process</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              How to Order Your Gift
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="card-premium p-6 text-center group hover:border-gold/30 transition-all">
                <div className="w-14 h-14 mx-auto rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/10 transition-all">
                  <span className="font-heading font-bold text-gold text-lg">{item.step}</span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#110c00]/30 to-[#0a0a0a]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <Gift size={44} className="text-gold mx-auto mb-6" />
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Make It Personal. Make It Special.
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed text-sm">
            Every gift we create tells a unique story. Send us your photo and let our studio
            turn it into a beautiful, one-of-a-kind keepsake treasured forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/custom-orders" className="btn-gold">
              Create Custom Gift Order
              <ArrowRight size={16} />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
