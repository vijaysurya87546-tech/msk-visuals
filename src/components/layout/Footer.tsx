'use client';

import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import Logo from '@/components/brand/Logo';
import { BUSINESS } from '@/lib/constants';

const footerLinks = {
  shop: [
    { label: 'Photo Frames', href: '/shop?category=photo-frames' },
    { label: 'Printing', href: '/shop?category=printing' },
    { label: 'Resin Art', href: '/shop?category=resin-art' },
    { label: 'DIY Candles', href: '/shop?category=diy-candles' },
    { label: 'Logo Design', href: '/shop?category=logo-design' },
  ],
  quickLinks: [
    { label: 'Shop All', href: '/shop' },
    { label: 'Price List', href: '/price-list' },
    { label: 'Custom Orders', href: '/custom-orders' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
  ],
  portal: [
    { label: 'View Cart', href: '/cart' },
    { label: 'Custom Orders', href: '/custom-orders' },
    { label: 'Price List', href: '/price-list' },
    { label: 'Admin Portal', href: '/admin/login' },
  ],
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplayIntro = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('msk_intro_seen');
      } catch {}
      document.documentElement.classList.remove('msk-intro-seen');

      if (window.location.pathname === '/') {
        window.dispatchEvent(new CustomEvent('msk-replay-intro'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.href = '/?replay=true';
      }
    }
  };

  return (
    <footer className="bg-[#0d0d0d] border-t border-gold/10">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-5">
            <Logo size="md" showText={true} />
            <p className="text-sm text-gray-400 leading-relaxed">
              Premium photo frames, high-quality printing, resin art, DIY candles
              and creative design solutions — crafted with care in Madurai.
            </p>
            <div className="space-y-2.5 text-sm">
              <a
                href={`tel:${BUSINESS.mobile.replace(/\s/g, '')}`}
                className="flex items-center gap-2.5 text-gray-400 hover:text-gold transition-colors"
              >
                <Phone size={14} className="text-gold/70" />
                {BUSINESS.mobile}
              </a>
              <a
                href={BUSINESS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-gray-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle size={14} className="text-green-500/70" />
                {BUSINESS.whatsapp}
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="flex items-center gap-2.5 text-gray-400 hover:text-gold transition-colors"
              >
                <Mail size={14} className="text-gold/70" />
                {BUSINESS.email}
              </a>
              <div className="flex items-center gap-2.5 text-gray-400">
                <MapPin size={14} className="text-gold/70" />
                {BUSINESS.address}
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-sm tracking-wider uppercase">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-sm tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store & Admin */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-sm tracking-wider uppercase">
              Management
            </h4>
            <ul className="space-y-3">
              {footerLinks.portal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h4 className="font-heading font-semibold text-white mb-4 text-sm tracking-wider uppercase">
                Follow Us
              </h4>
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pink-400 transition-colors"
              >
                <InstagramIcon size={18} />
                {BUSINESS.instagram}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MSK VISUALS. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReplayIntro}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold transition-all duration-300 py-1.5 px-3 rounded-full border border-white/10 hover:border-gold/40 bg-black/40 hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(212,168,83,0.15)] cursor-pointer"
              title="Experience the MSK VISUALS animated welcome screen again"
            >
              <Sparkles size={12} className="text-gold animate-pulse" />
              <span>Replay Intro</span>
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 text-gray-500 hover:text-gold border border-white/10 rounded-full hover:border-gold/30 transition-all cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href={BUSINESS.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-110 transition-all"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} className="text-white" />
      </a>
    </footer>
  );
}
