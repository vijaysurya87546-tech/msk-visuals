import Link from 'next/link';
import {
  Sparkles,
  Heart,
  Award,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  Frame,
  Printer,
  Gem,
  Flame,
  PenTool,
} from 'lucide-react';
import { BUSINESS, SERVICES } from '@/lib/constants';

export const metadata = {
  title: 'About Us | MSK VISUALS Madurai - We Frame Memories',
  description: 'Learn about MSK VISUALS, Madurais premier creative studio for luxury photo frames, resin art, soy candles, and custom gifts.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto pt-4">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold flex items-center justify-center gap-1.5 mb-3">
          <Sparkles size={14} /> The MSK VISUALS Story
        </span>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white mb-4">
          WE FRAME <span className="text-gold-gradient">MEMORIES.</span>
        </h1>
        <p className="text-gold-metallic font-heading text-xl italic mb-6">
          &ldquo;{BUSINESS.tagline}&rdquo;
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Founded in the cultural heart of <strong>Madurai, Tamil Nadu</strong>, MSK VISUALS was born with a singular purpose: to transform fleeting human moments into eternal physical keepsakes. From royal wedding collages to divine spiritual sanctums and personalized anniversary gifts, we craft each piece with museum-grade precision and boundless passion.
        </p>
      </div>

      {/* Brand Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
            <Award size={26} />
          </div>
          <h2 className="font-heading text-lg font-bold text-white mb-2">Uncompromising Luxury</h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            We use exclusively engineered hardwoods, 24K aesthetic gold leaf foiling, non-glare crystal acrylics, and fade-resistant archival pigment inks.
          </p>
        </div>

        <div className="card-premium p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
            <Heart size={26} />
          </div>
          <h2 className="font-heading text-lg font-bold text-white mb-2">Personalized For You</h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            No two life stories are identical. Our dedicated designers work one-on-one with you via WhatsApp to calibrate sizes, typography, and image color grades.
          </p>
        </div>

        <div className="card-premium p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
            <Truck size={26} />
          </div>
          <h2 className="font-heading text-lg font-bold text-white mb-2">Pan Tamil Nadu Care</h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            Every frame travels in custom reinforced foam edge protectors and triple-layer bubble packaging to reach Madurai, Chennai, Coimbatore, and every TN town safely.
          </p>
        </div>
      </div>

      {/* Creative Disciplines */}
      <div className="card-premium p-8 sm:p-12 border border-gold/20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-heading text-3xl font-bold text-white mb-2">Our Creative Disciplines</h2>
          <p className="text-gray-400 text-xs">A comprehensive studio offering 6 dedicated visual services under one roof.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          {[
            { title: 'Photo Frames', desc: 'Custom portrait, collage, wedding & spiritual frames made to any custom size.' },
            { title: 'Printing', desc: 'Giclée archival canvas wraps, fine-art photographic paper, and commercial printing.' },
            { title: 'Resin Art', desc: 'Hand-poured ocean waves, geode clocks, personalized keychains, and floral coaster sets.' },
            { title: 'DIY Candles', desc: '100% soy wax candles crafted with therapeutic essential aromatherapy oils.' },
            { title: 'Logo Design', desc: 'Vector logos, wolf emblems, brand identity systems, and corporate stationary.' },
            { title: 'Customized Creative Gifts', desc: 'Bespoke keepsakes personalized with dates, names, coordinates, and quotes.' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-black-elevated rounded-lg border border-white/5">
              <h3 className="font-heading font-semibold text-gold mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Studio Location & Contact CTA */}
      <div className="p-8 sm:p-10 bg-gradient-to-r from-black-card via-[#151515] to-black-card rounded-xl border border-gold/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider mb-1">
            <MapPin size={14} /> Madurai Studio Location
          </div>
          <h3 className="font-heading text-2xl font-bold text-white">Visit Our Studio or Order Online</h3>
          <p className="text-gray-400 text-xs mt-1">Madurai, Tamil Nadu, India | Mobile & WhatsApp: +91 93612 53338</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn-gold !py-2.5 px-6 text-xs">
            Contact Us
          </Link>
          <a
            href={BUSINESS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp !py-2.5 px-6 text-xs"
          >
            <MessageCircle size={15} /> WhatsApp (+91 93612 53338)
          </a>
        </div>
      </div>
    </div>
  );
}
