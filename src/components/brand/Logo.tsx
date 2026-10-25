import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  href?: string;
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  xs: { class: 'w-8 h-8' },
  sm: { class: 'w-10 h-10' },
  md: { class: 'w-12 h-12' },
  lg: { class: 'w-16 h-16' },
  xl: { class: 'w-24 h-24' },
  hero: { class: 'w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64' },
};

export default function Logo({
  size = 'md',
  showText = false,
  href = '/',
  className,
}: LogoProps) {
  const currentSize = sizeMap[size];

  const content = (
    <div className={cn('inline-flex items-center gap-3 group select-none', className)}>
      {/* Official Circular Logo Badge with precision crop to inner black circular emblem */}
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-105 bg-black',
          currentSize.class,
          size === 'hero'
            ? 'gold-glow-strong border-2 border-gold/40 shadow-2xl shadow-gold/20'
            : 'border border-gold/30 shadow-md shadow-black/50'
        )}
      >
        <img
          src="/logo-v2.jpeg?v=2"
          alt="MSK VISUALS Official Logo - Wolf Emblem"
          className="w-full h-full object-cover transition-transform duration-300"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-heading font-bold text-base sm:text-xl text-gold-gradient tracking-wider leading-tight whitespace-nowrap">
            MSK VISUALS
          </span>
          <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-medium hidden sm:block whitespace-nowrap">
            WE DESIGN. YOU IMPRESS.
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block" aria-label="MSK VISUALS Home">
        {content}
      </Link>
    );
  }

  return content;
}
