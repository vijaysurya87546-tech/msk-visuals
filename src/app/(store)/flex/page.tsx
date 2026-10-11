'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Clock,
  Award,
  Layers,
  Palette,
  Search,
  Calculator,
  Download,
  Eye,
  X,
  Building,
  FileText,
  PhoneCall,
  Sparkle,
} from 'lucide-react';
import { BUSINESS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

// All 36 sizes and prices exactly from the official MSK VISUALS Flex Price Card
interface FlexPriceItem {
  id: string;
  size: string; // e.g. "3x2"
  width: number;
  height: number;
  price: number;
  category: 'standard' | 'large' | 'mega';
}

const FLEX_PRICE_LIST: FlexPriceItem[] = [
  // Left Column (Standard Banners)
  { id: 'f-1', size: '3x2', width: 3, height: 2, price: 250, category: 'standard' },
  { id: 'f-2', size: '3x3', width: 3, height: 3, price: 300, category: 'standard' },
  { id: 'f-3', size: '4x2', width: 4, height: 2, price: 300, category: 'standard' },
  { id: 'f-4', size: '4x3', width: 4, height: 3, price: 350, category: 'standard' },
  { id: 'f-5', size: '5x3', width: 5, height: 3, price: 450, category: 'standard' },
  { id: 'f-6', size: '6x3', width: 6, height: 3, price: 500, category: 'standard' },
  { id: 'f-7', size: '6x4', width: 6, height: 4, price: 550, category: 'standard' },
  { id: 'f-8', size: '8x3', width: 8, height: 3, price: 550, category: 'standard' },
  { id: 'f-9', size: '8x4', width: 8, height: 4, price: 600, category: 'standard' },
  { id: 'f-10', size: '8x5', width: 8, height: 5, price: 650, category: 'standard' },
  { id: 'f-11', size: '8x6', width: 8, height: 6, price: 700, category: 'standard' },
  { id: 'f-12', size: '10x3', width: 10, height: 3, price: 600, category: 'standard' },
  { id: 'f-13', size: '10x4', width: 10, height: 4, price: 650, category: 'standard' },
  { id: 'f-14', size: '10x5', width: 10, height: 5, price: 700, category: 'standard' },
  { id: 'f-15', size: '10x6', width: 10, height: 6, price: 800, category: 'standard' },
  { id: 'f-16', size: '10x7', width: 10, height: 7, price: 900, category: 'standard' },
  { id: 'f-17', size: '10x8', width: 10, height: 8, price: 1000, category: 'standard' },
  { id: 'f-18', size: '8x12', width: 8, height: 12, price: 1200, category: 'standard' },

  // Right Column (Large Format & Mega Stage Displays)
  { id: 'f-19', size: '8x15', width: 8, height: 15, price: 1450, category: 'large' },
  { id: 'f-20', size: '8x20', width: 8, height: 20, price: 1920, category: 'large' },
  { id: 'f-21', size: '8x25', width: 8, height: 25, price: 2400, category: 'large' },
  { id: 'f-22', size: '8x30', width: 8, height: 30, price: 2880, category: 'large' },
  { id: 'f-23', size: '8x35', width: 8, height: 35, price: 3360, category: 'large' },
  { id: 'f-24', size: '8x40', width: 8, height: 40, price: 3840, category: 'large' },
  { id: 'f-25', size: '8x45', width: 8, height: 45, price: 4320, category: 'large' },
  { id: 'f-26', size: '8x50', width: 8, height: 50, price: 4800, category: 'large' },
  { id: 'f-27', size: '10x10', width: 10, height: 10, price: 1200, category: 'mega' },
  { id: 'f-28', size: '10x12', width: 10, height: 12, price: 1450, category: 'mega' },
  { id: 'f-29', size: '10x15', width: 10, height: 15, price: 1800, category: 'mega' },
  { id: 'f-30', size: '10x20', width: 10, height: 20, price: 2400, category: 'mega' },
  { id: 'f-31', size: '10x25', width: 10, height: 25, price: 3000, category: 'mega' },
  { id: 'f-32', size: '10x30', width: 10, height: 30, price: 3600, category: 'mega' },
  { id: 'f-33', size: '10x35', width: 10, height: 35, price: 4200, category: 'mega' },
  { id: 'f-34', size: '10x40', width: 10, height: 40, price: 4800, category: 'mega' },
  { id: 'f-35', size: '10x45', width: 10, height: 45, price: 5400, category: 'mega' },
  { id: 'f-36', size: '10x50', width: 10, height: 50, price: 6000, category: 'mega' },
];

const SPECIAL_SERVICES = [
  {
    title: 'Starflex Printing',
    rate: '₹40',
    unit: 'SQ.FT',
    description: 'Heavy-gauge, high-tensile premium flex with brilliant glossy/matte texture and superior UV & rain resistance.',
    badge: 'Popular Choice',
    icon: Sparkle,
  },
  {
    title: 'Vinayal Flex (Vinyl)',
    rate: '₹60',
    unit: 'SQ.FT',
    description: 'Ultra high-definition adhesive & mounted vinyl printing for showroom signage, glass branding & precision art.',
    badge: 'Ultra HD Quality',
    icon: Palette,
  },
  {
    title: 'Scaffolding Banner Rental',
    rate: '₹6',
    unit: 'SQ.FT',
    description: 'Professional iron pipe scaffolding erection, banner tying, and dismantling services for grand outdoor stages & events.',
    badge: 'Full Setup Service',
    icon: Building,
  },
  {
    title: 'Instant Paper Posters',
    rate: '₹150',
    unit: 'Per Copy',
    note: 'Minimum order of 10 copies required',
    description: 'Express vibrant photo-gloss paper posters for promotions, festivals, college symposiums, rallies & movies.',
    badge: 'Fast Turnaround',
    icon: FileText,
  },
];

const WHY_CHOOSE_US_POINTS = [
  { title: 'High Quality Prints', desc: 'Ultra-crisp DPI with industrial high-resolution digital printers.' },
  { title: 'Vibrant Colours', desc: 'Deep color saturation and true-to-life tones that never look dull.' },
  { title: 'Best Materials', desc: 'Heavyweight weatherproof flex, tear-resistant vinyl and sturdy eyelets.' },
  { title: 'Affordable Prices', desc: 'Direct workshop wholesale prices with no middleman markup.' },
  { title: 'On Time Delivery', desc: 'Strict adherence to event deadlines with same-day express options.' },
  { title: 'Customer Satisfaction', desc: '100% digital proof review & design alignment prior to printing.' },
];

export default function FlexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'standard' | 'large' | 'mega'>('all');
  const [showImageModal, setShowImageModal] = useState(false);

  // Custom Quick Calculator State
  const [calcWidth, setCalcWidth] = useState<number>(10);
  const [calcHeight, setCalcHeight] = useState<number>(5);
  const [calcMaterial, setCalcMaterial] = useState<'standard' | 'starflex' | 'vinyl'>('standard');
  const [includeScaffolding, setIncludeScaffolding] = useState(false);

  // Filtered price list
  const filteredPrices = FLEX_PRICE_LIST.filter((item) => {
    const matchesSearch = item.size.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate price dynamically
  const totalSqFt = Math.max(1, (calcWidth || 0) * (calcHeight || 0));
  let ratePerSqFt = 20; // default base approx
  if (calcMaterial === 'starflex') ratePerSqFt = 40;
  if (calcMaterial === 'vinyl') ratePerSqFt = 60;
  
  // Look up exact predefined table match if standard
  const exactMatch = FLEX_PRICE_LIST.find(
    (item) =>
      (item.width === calcWidth && item.height === calcHeight) ||
      (item.width === calcHeight && item.height === calcWidth)
  );

  let calculatedPrice = 0;
  if (calcMaterial === 'standard' && exactMatch) {
    calculatedPrice = exactMatch.price;
  } else {
    calculatedPrice = Math.round(totalSqFt * ratePerSqFt);
  }

  if (includeScaffolding) {
    calculatedPrice += Math.round(totalSqFt * 6);
  }

  // Pre-generate WhatsApp message for calculated order
  const calcWhatsAppMessage = encodeURIComponent(
    `Hello MSK VISUALS, I would like to order a Custom Flex Banner:\n- Size: ${calcWidth}ft x ${calcHeight}ft (${totalSqFt} Sq.Ft)\n- Material: ${
      calcMaterial === 'starflex'
        ? 'Starflex (₹40/sq.ft)'
        : calcMaterial === 'vinyl'
        ? 'Vinayal Flex (₹60/sq.ft)'
        : 'Standard Flex'
    }\n- Scaffolding Erection: ${includeScaffolding ? 'Yes (₹6/sq.ft)' : 'No'}\n- Estimated Price: ₹${calculatedPrice}\nPlease share details and start designing.`
  );

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">
      {/* ===== HERO BANNER ===== */}
      <div className="card-premium p-8 sm:p-14 mb-14 text-center relative overflow-hidden border border-gold/25">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} /> MSK VISUALS Flex & Display
          </div>
          
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2">
            Flex Printing Services
          </h1>
          
          <p className="text-gold-metallic font-heading text-xl sm:text-2xl font-semibold tracking-wider mb-4">
            &ldquo;WE DESIGN. YOU IMPRESS.&rdquo;
          </p>
          
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            High-definition, weatherproof flex printing for birthday celebrations, weddings, shop hoardings, 
            stage backdrops, starflex &amp; vinyl signage across Tamil Nadu. Unbeatable factory rates with guaranteed on-time delivery.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/custom-orders" className="btn-gold !py-2.5 px-6 text-xs">
              Create Custom Flex Order
            </Link>
            <a
              href={`${BUSINESS.whatsappUrl}?text=${encodeURIComponent(
                'Hi MSK VISUALS, I need flex printing quotation. Please share details.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp !py-2.5 px-6 text-xs"
            >
              <MessageCircle size={15} /> Order on WhatsApp ({BUSINESS.mobile})
            </a>
            <button
              onClick={() => setShowImageModal(true)}
              className="btn-gold-outline !py-2.5 px-5 text-xs flex items-center gap-1.5"
            >
              <Eye size={15} /> View Official Price Card
            </button>
          </div>

          {/* Quick Badges Strip */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-gray-300">
            <span className="flex items-center gap-1.5 text-gold">
              <CheckCircle2 size={14} /> High Quality Prints
            </span>
            <span className="flex items-center gap-1.5 text-gold">
              <CheckCircle2 size={14} /> Vibrant Colours
            </span>
            <span className="flex items-center gap-1.5 text-gold">
              <CheckCircle2 size={14} /> Best Materials
            </span>
            <span className="flex items-center gap-1.5 text-gold">
              <CheckCircle2 size={14} /> Fast Delivery
            </span>
          </div>
        </div>
      </div>

      {/* ===== WHY CHOOSE US & TRUST BADGES SECTION ===== */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 6 Value Pillars */}
          <div className="lg:col-span-2 card-premium p-6 sm:p-8 border border-white/10">
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                QUALITY & RELIABILITY
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
                Why Choose MSK VISUALS?
              </h2>
              <div className="gold-divider-short mt-3 mb-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WHY_CHOOSE_US_POINTS.map((pt, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{pt.title}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Official Seal Badges from Poster */}
          <div className="flex flex-col gap-6 justify-between">
            {/* BEST PRICE BEST QUALITY SEAL */}
            <div className="card-premium p-6 border-2 border-gold/40 text-center flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-black-card to-black-deep">
              <div className="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mb-3 border border-gold/30">
                <Award size={30} />
              </div>
              <div className="text-gold tracking-[0.25em] text-xs font-bold mb-1">
                ★★★★★ GUARANTEED
              </div>
              <h3 className="font-heading text-2xl font-bold text-white tracking-wide">
                BEST PRICE
              </h3>
              <div className="text-gold-gradient font-heading text-xl font-bold">
                BEST QUALITY
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Uncompromising vibrant prints at true workshop direct prices.
              </p>
            </div>

            {/* FAST DELIVERY BADGE */}
            <div className="card-premium p-6 border-2 border-gold/40 text-center flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-black-card to-black-deep">
              <div className="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mb-3 border border-gold/30">
                <Clock size={30} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white tracking-wide">
                FAST DELIVERY
              </h3>
              <p className="text-gold-metallic font-semibold text-xs tracking-wider uppercase mt-1">
                Your Time, Our Priority
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Express same-day dispatch available for emergency function &amp; stage flex requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPECIALIZED SERVICES & MATERIAL RATES ===== */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2 font-semibold">
            MATERIALS & SERVICES
          </p>
          <h2 className="section-heading text-gold-gradient text-3xl sm:text-4xl font-bold font-heading">
            Specialized Flex Rates
          </h2>
          <div className="gold-divider-short mt-4 mb-3" />
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Choose from heavy Starflex, self-adhesive Vinyl, or complete scaffolding stage erection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SPECIAL_SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="card-premium p-6 border border-white/10 hover:border-gold/50 transition-all flex flex-col justify-between group hover:scale-[1.02]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-semibold">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="text-white font-heading text-lg font-bold group-hover:text-gold transition-colors">
                    {srv.title}
                  </h3>

                  <div className="mt-3 mb-2 flex items-baseline gap-1">
                    <span className="text-gold-gradient font-heading text-3xl font-extrabold">
                      {srv.rate}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      / {srv.unit}
                    </span>
                  </div>

                  {srv.note && (
                    <div className="text-[11px] text-amber-400 font-medium mb-2 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                      ⚠ {srv.note}
                    </div>
                  )}

                  <p className="text-gray-400 text-xs leading-relaxed mt-2">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <a
                    href={`${BUSINESS.whatsappUrl}?text=${encodeURIComponent(
                      `Hello MSK VISUALS, I am inquiring about ${srv.title} (${srv.rate}/${srv.unit}). Please guide me.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold-outline w-full !py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle size={13} /> Enquire Service
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== POPULAR FLEX SIZES & FULL PRICING LIST ===== */}
      <section id="price-list" className="mb-16 card-premium p-6 sm:p-10 border border-gold/25">
        <div className="text-center mb-8">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2 font-medium">
            OFFICIAL RATE CARD
          </p>
          <h2 className="section-heading text-gold-gradient text-3xl sm:text-4xl font-bold font-heading">
            Flex Printing Price List
          </h2>
          <div className="gold-divider-short mt-4 mb-3" />
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            All 36 standard banner, backdrop, and stage hoarding sizes from our workshop rate card.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {[
              { id: 'all', label: 'All Sizes (36)' },
              { id: 'standard', label: 'Standard Banners (18)' },
              { id: 'large', label: 'Stage Backdrops (8)' },
              { id: 'mega', label: 'Grand Hoardings (10)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === tab.id
                    ? 'bg-gold text-black font-semibold shadow-md'
                    : 'bg-black/60 text-gray-300 border border-white/10 hover:border-gold/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search size (e.g. 3x2, 10x20)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-black/80 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* The 36 Sizes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredPrices.map((item) => {
            const sqft = item.width * item.height;
            const waOrderMsg = encodeURIComponent(
              `Hello MSK VISUALS, I want to order a Flex Banner size ${item.size} (${sqft} Sq.Ft) for ₹${item.price}/-. Please let me know how to send my photos & design.`
            );
            return (
              <div
                key={item.id}
                className="bg-black/70 border border-white/10 hover:border-gold/60 rounded-xl p-4 text-center transition-all hover:scale-[1.03] group flex flex-col justify-between"
              >
                <div>
                  <div className="text-gold font-heading text-lg sm:text-xl font-bold group-hover:text-gold-metallic transition-colors">
                    {item.size}
                  </div>
                  <div className="text-[11px] text-gray-400 mb-2 font-mono">
                    {sqft} Sq.Ft (Feet)
                  </div>
                  <div className="text-white font-bold text-base sm:text-lg mb-3">
                    {formatPrice(item.price)}
                    <span className="text-[10px] text-gray-400 font-normal">/-</span>
                  </div>
                </div>

                <a
                  href={`${BUSINESS.whatsappUrl}?text=${waOrderMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-2 rounded-lg bg-gold/10 hover:bg-gold text-gold hover:text-black text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 border border-gold/25"
                >
                  <MessageCircle size={12} /> Order
                </a>
              </div>
            );
          })}
        </div>

        {filteredPrices.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No sizes matched &ldquo;{searchQuery}&rdquo;. Try another size or use our Custom Calculator below!
          </div>
        )}

        {/* Modal / Download link for the original card */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-gray-400">
            Need a size not in this list? We print any custom dimension up to 100+ feet!
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImageModal(true)}
              className="btn-gold-outline !py-2 !px-4 text-xs flex items-center gap-1.5"
            >
              <Eye size={14} /> View Price Card Image
            </button>
            <a
              href="/images/flex-price-card.png"
              download="MSK_VISUALS_Flex_Price_List.png"
              className="btn-gold !py-2 !px-4 text-xs flex items-center gap-1.5"
            >
              <Download size={14} /> Download Rate Card
            </a>
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE CUSTOM SIZE & COST CALCULATOR ===== */}
      <section className="mb-16 card-premium p-8 sm:p-12 border border-gold/30 relative overflow-hidden bg-gradient-to-br from-black-card via-black-deep to-black-matte">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold flex items-center justify-center gap-1.5">
              <Calculator size={14} /> SMART ESTIMATOR
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
              Custom Flex Cost Calculator
            </h2>
            <div className="gold-divider-short mt-3 mb-2" />
            <p className="text-gray-400 text-xs sm:text-sm">
              Input any custom dimension to get an instant cost calculation with material selection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/60 p-6 rounded-2xl border border-white/10">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">
                  Width (Feet)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">
                  Height (Feet)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">
                  Material Option
                </label>
                <select
                  value={calcMaterial}
                  onChange={(e) => setCalcMaterial(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-white text-sm focus:border-gold focus:outline-none"
                >
                  <option value="standard">Standard High-Quality Flex</option>
                  <option value="starflex">Starflex (₹40 / Sq.Ft) - Heavy Gloss/Matte</option>
                  <option value="vinyl">Vinayal Flex (₹60 / Sq.Ft) - Ultra HD Vinyl</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeScaffolding}
                    onChange={(e) => setIncludeScaffolding(e.target.checked)}
                    className="w-4 h-4 rounded text-gold bg-black border-white/20 focus:ring-gold focus:ring-offset-0"
                  />
                  <span>Include Scaffolding Banner Rental (+₹6 / Sq.Ft)</span>
                </label>
              </div>
            </div>

            {/* Live Calculation Result */}
            <div className="bg-black/80 rounded-xl p-5 border border-gold/30 flex flex-col justify-between text-center md:text-left">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Estimated Summary
                </div>
                <div className="text-white font-heading text-xl font-bold">
                  {calcWidth} ft &times; {calcHeight} ft
                </div>
                <div className="text-xs text-gold mt-1 font-mono">
                  Total Area: {totalSqFt} Sq.Ft
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Material Rate:</span>
                    <span className="text-white font-medium">
                      {calcMaterial === 'starflex'
                        ? '₹40 / sq.ft'
                        : calcMaterial === 'vinyl'
                        ? '₹60 / sq.ft'
                        : exactMatch
                        ? 'Predefined Price List'
                        : '₹20 / sq.ft base'}
                    </span>
                  </div>
                  {includeScaffolding && (
                    <div className="flex justify-between text-amber-400">
                      <span>Scaffolding Rental:</span>
                      <span>+₹{totalSqFt * 6} (₹6/sq.ft)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gold/20">
                <div className="text-xs text-gray-400">Estimated Total Cost:</div>
                <div className="text-gold-gradient font-heading text-3xl font-extrabold my-1">
                  {formatPrice(calculatedPrice)}
                </div>
                <a
                  href={`${BUSINESS.whatsappUrl}?text=${calcWhatsAppMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full !py-2.5 text-xs flex items-center justify-center gap-2 mt-3"
                >
                  <MessageCircle size={15} /> Order This Size on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== POPULAR APPLICATION SCENARIOS ===== */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1 font-medium">
            VERSATILE PRINTING
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Common Flex &amp; Banner Uses
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: 'Birthday & Event Stages',
              desc: 'High-color vibrancy birthday greeting flexes with photo collage and cartoon themes.',
              recommended: '6x4, 8x5, 10x6',
            },
            {
              title: 'Wedding Reception Backdrops',
              desc: 'Royal couple designs with golden glow accents, stage floral borders & matte Starflex.',
              recommended: '8x15, 10x20, 10x25',
            },
            {
              title: 'Shop Frontboards & Hoardings',
              desc: 'Durable weather-proof frontlit & backlit boards that withstand tropical sunlight & rain.',
              recommended: '8x20, 10x30, 10x40',
            },
            {
              title: 'Festival & Temple Banners',
              desc: 'Traditional high-saturation devotional banners with sharp text and deity illustrations.',
              recommended: '8x4, 10x8, 8x12',
            },
            {
              title: 'Political & Social Rallies',
              desc: 'Massive visibility banners with iron scaffolding rental service across Madurai.',
              recommended: '10x30 to 10x50',
            },
            {
              title: 'Promotional Standees & Posters',
              desc: 'Instant 10-pack glossy paper posters or roll-up standees for brand promotions.',
              recommended: 'Instant Paper Posters / 3x2',
            },
          ].map((app, i) => (
            <div key={i} className="card-premium p-5 border border-white/5">
              <h3 className="text-white font-semibold text-base mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold"></span> {app.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">{app.desc}</p>
              <div className="text-[11px] text-gold/90 font-mono bg-black/50 px-2.5 py-1 rounded inline-block">
                Recommended: {app.recommended}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== GUARANTEE CARDS ===== */}
      <section className="card-premium p-8 sm:p-10 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <Printer size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">Ultra-Sharp Inkjet & UV Print</h4>
          <p className="text-xs text-gray-400">High-DPI industrial printheads delivering photographic clarity on all media.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <ShieldCheck size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">Weatherproof & UV Treated</h4>
          <p className="text-xs text-gray-400">Sunlight and water resistant heavy PVC & Starflex built for outdoor durability.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-3">
            <Clock size={22} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">Same-Day Express Dispatch</h4>
          <p className="text-xs text-gray-400">Fast turnaround for urgent functions, conferences & political events.</p>
        </div>
      </section>

      {/* ===== BOTTOM CTA BAR ===== */}
      <section className="card-premium p-8 sm:p-12 border border-gold/30 text-center relative overflow-hidden bg-gradient-to-r from-black-card via-black-deep to-black-card">
        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
          Ready to Print Your Next Big Event Banner?
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mb-6">
          Send us your design, photos or text on WhatsApp. Our design team will create a preview layout for your approval before printing.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/custom-orders" className="btn-gold !py-2.5 px-6 text-xs">
            Start Custom Order Online
          </Link>
          <a
            href={BUSINESS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp !py-2.5 px-6 text-xs"
          >
            <MessageCircle size={15} /> Chat with Printing Team
          </a>
          <a
            href={`tel:${BUSINESS.mobile.replace(/\s+/g, '')}`}
            className="btn-gold-outline !py-2.5 px-6 text-xs flex items-center gap-1.5"
          >
            <PhoneCall size={14} /> Call {BUSINESS.mobile}
          </a>
        </div>
      </section>

      {/* ===== MODAL: OFFICIAL RATE CARD PREVIEW ===== */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-black-card border border-gold/40 rounded-2xl p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-gold" />
                <h3 className="font-heading text-white text-base font-semibold">
                  Official MSK VISUALS Flex Printing Price Card
                </h3>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-black/40 hover:bg-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-lg border border-white/5 bg-black flex justify-center">
              <img
                src="/images/flex-price-card.png"
                alt="MSK VISUALS Flex Printing Price List"
                className="w-full h-auto object-contain"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-white/10 text-xs">
              <span className="text-gray-400">
                Official printed workshop rates &bull; Subject to standard terms &bull; MSK VISUALS Madurai
              </span>
              <a
                href="/images/flex-price-card.png"
                download="MSK_VISUALS_Flex_Price_List.png"
                className="btn-gold !py-1.5 !px-4 text-xs flex items-center gap-1.5"
              >
                <Download size={14} /> Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
