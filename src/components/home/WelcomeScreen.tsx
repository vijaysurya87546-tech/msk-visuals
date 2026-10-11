'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete?: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const handleTransitionOut = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    try {
      sessionStorage.setItem('msk_intro_seen', 'true');
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined' && window.location.search.includes('replay=true')) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onComplete?.();
    }, 800);
    timeoutsRef.current.push(exitTimer);
  }, [isExiting, onComplete]);

  const startButtonSequence = useCallback(() => {
    // GET STARTED button appears at ~9.2s (near end of video)
    const t1 = setTimeout(() => setShowButton(true), 9200);
    timeoutsRef.current.push(t1);
  }, []);

  useEffect(() => {
    setMounted(true);

    let hasSeenIntro = false;
    let isReplay = false;

    try {
      hasSeenIntro = sessionStorage.getItem('msk_intro_seen') === 'true';
      isReplay = new URLSearchParams(window.location.search).get('replay') === 'true';
    } catch {
      hasSeenIntro = false;
    }

    if (!hasSeenIntro || isReplay) {
      setIsVisible(true);
      setIsExiting(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
      startButtonSequence();
    } else {
      setIsVisible(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }

    const handleReplayEvent = () => {
      setIsVisible(true);
      setIsExiting(false);
      setShowButton(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
      try {
        sessionStorage.removeItem('msk_intro_seen');
      } catch {}
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
      startButtonSequence();
    };

    window.addEventListener('msk-replay-intro', handleReplayEvent);

    return () => {
      clearAllTimeouts();
      window.removeEventListener('msk-replay-intro', handleReplayEvent);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [clearAllTimeouts, startButtonSequence]);

  // Keyboard: Escape to skip
  useEffect(() => {
    if (!isVisible || isExiting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleTransitionOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isExiting, handleTransitionOut]);

  if (!mounted || !isVisible) return null;

  return (
    <div
      id="msk-welcome-screen"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to MSK VISUALS"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-[800ms] ease-out ${
        isExiting
          ? 'opacity-0 scale-[1.04] blur-[10px] pointer-events-none'
          : 'opacity-100 scale-100 blur-0'
      }`}
      style={{ width: '100vw', height: '100dvh', background: '#050505' }}
    >
      {/* ===== BACKGROUND VIDEO ===== */}
      <video
        ref={videoRef}
        src="/launching-page.mp4"
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(5,5,5,0.02) 0%, rgba(5,5,5,0.30) 60%, rgba(5,5,5,0.75) 100%)',
        }}
      />

      {/* Bottom gradient for button area */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[35%] z-[2] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.40) 60%, transparent 100%)',
        }}
      />

      {/* ===== SKIP INTRO BUTTON ===== */}
      <div
        className="absolute top-5 right-5 sm:top-7 sm:right-7 z-30"
        style={{ animation: 'fadeInDown 0.9s ease-out 0.8s both' }}
      >
        <button
          onClick={handleTransitionOut}
          type="button"
          className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium text-gray-300 hover:text-white bg-black/40 hover:bg-black/70 border border-white/10 hover:border-gold/50 backdrop-blur-md transition-all duration-300 shadow-lg shadow-black/40 cursor-pointer active:scale-95"
          aria-label="Skip introduction and proceed to MSK VISUALS"
        >
          <span>Skip Intro</span>
          <ArrowRight
            size={13}
            className="text-gold/70 group-hover:text-gold group-hover:translate-x-0.5 transition-all"
          />
        </button>
      </div>

      {/* ===== GET STARTED BUTTON — bottom-center ===== */}
      <div className="absolute inset-x-0 bottom-12 sm:bottom-16 z-20 flex items-center justify-center pointer-events-none px-4">
        <div
          className="transition-all duration-700 pointer-events-auto"
          style={{
            opacity: showButton ? 1 : 0,
            transform: showButton
              ? 'translateY(0) scale(1)'
              : 'translateY(24px) scale(0.93)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <button
            id="msk-get-started-button"
            onClick={handleTransitionOut}
            type="button"
            className="group relative inline-flex items-center justify-center gap-3 px-9 sm:px-12 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm tracking-[0.16em] uppercase overflow-hidden cursor-pointer active:scale-95 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #D4A853 0%, #F3DE9C 50%, #B8922F 100%)',
              color: '#0A0A0A',
              border: '1px solid rgba(255,243,209,0.65)',
              boxShadow: '0 0 32px rgba(212,168,83,0.45), 0 4px 20px rgba(0,0,0,0.6)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 55px rgba(212,168,83,0.80), 0 8px 30px rgba(0,0,0,0.7)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 32px rgba(212,168,83,0.45), 0 4px 20px rgba(0,0,0,0.6)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            aria-label="GET STARTED – Enter MSK VISUALS"
          >
            {/* Metallic shimmer sweep */}
            <span
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/55 to-transparent -skew-x-12 pointer-events-none"
              style={{ animation: 'buttonShimmerSweep 3s infinite ease-in-out' }}
            />
            <span className="relative z-10 flex items-center gap-2.5">
              <span>GET STARTED</span>
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: '#0A0A0A' }}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
