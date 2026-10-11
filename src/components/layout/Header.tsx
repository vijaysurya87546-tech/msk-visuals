'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Shield,
  Menu,
  X,
  ChevronDown,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { BUSINESS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Logo from '@/components/brand/Logo';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  {
    label: 'Services',
    href: '#',
    children: [
      { label: 'Photo Frames', href: '/photo-frames' },
      { label: 'Flex', href: '/flex' },
      { label: 'Resin Art', href: '/shop?category=resin-art' },
      { label: 'DIY Candles', href: '/shop?category=diy-candles' },
      { label: 'Logo Design', href: '/shop?category=logo-design' },
      { label: 'Gifts', href: '/gifts' },
    ],
  },
  { label: 'Price List', href: '/price-list' },
  { label: 'Custom Orders', href: '/custom-orders' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#0d0d0d] border-b border-white/5 py-1.5 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="text-gray-500">Delivery Across Tamil Nadu</span>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${BUSINESS.mobile.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gold transition-colors"
            >
              <Phone size={11} />
              {BUSINESS.mobile}
            </a>
            <a
              href={BUSINESS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition-colors"
            >
              <MessageCircle size={11} />
              WhatsApp
            </a>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-gray-400 hover:text-gold transition-colors pl-3 border-l border-white/10"
              title="Admin Panel"
            >
              <Shield size={11} />
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-gold/10 shadow-lg shadow-black/30'
            : 'bg-[#0A0A0A] border-b border-white/5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Official Brand Logo */}
            <Logo size="sm" showText={true} />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1',
                      pathname === link.href
                        ? 'text-gold'
                        : 'text-gray-300 hover:text-gold'
                    )}
                    onClick={(e) => {
                      if (link.children) e.preventDefault();
                    }}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={13} />}
                  </Link>

                  {/* Dropdown */}
                  {link.children && openDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-0 w-52 bg-[#161616] border border-gold/15 rounded-lg shadow-2xl shadow-black/50 animate-slide-down overflow-hidden">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-300 hover:text-gold hover:bg-white/5 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-400 hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="p-2 text-gray-400 hover:text-gold transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-black-deep text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Admin Portal */}
              <Link
                href="/admin/login"
                className="p-2 text-gray-400 hover:text-gold transition-colors hidden sm:block"
                title="Admin Portal"
                aria-label="Admin Portal"
              >
                <Shield size={20} />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 text-gray-400 hover:text-gold transition-colors lg:hidden"
                aria-label="Menu"
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-white/5 animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products, frames, resin art..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-premium flex-1"
                  autoFocus
                />
                <button type="submit" className="btn-gold !py-2 !px-6">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileOpen && (
          <div className="lg:hidden border-t border-white/5 animate-slide-down bg-[#0d0d0d]">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.children ? '#' : link.href}
                    className={cn(
                      'block px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                      pathname === link.href
                        ? 'text-gold bg-gold/5'
                        : 'text-gray-300 hover:text-gold hover:bg-white/5'
                    )}
                    onClick={(e) => {
                      if (link.children) {
                        e.preventDefault();
                        setOpenDropdown(
                          openDropdown === link.label ? null : link.label
                        );
                      }
                    }}
                  >
                    <span className="flex items-center justify-between">
                      {link.label}
                      {link.children && (
                        <ChevronDown
                          size={14}
                          className={cn(
                            'transition-transform',
                            openDropdown === link.label && 'rotate-180'
                          )}
                        />
                      )}
                    </span>
                  </Link>
                  {link.children && openDropdown === link.label && (
                    <div className="pl-6 space-y-1 mt-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-400 hover:text-gold transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-white/5">
                <Link
                  href="/admin/login"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gold hover:bg-gold/10 rounded-lg transition-colors"
                >
                  <Shield size={16} />
                  <span>Admin Portal</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
