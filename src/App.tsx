import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { MessageCircle, ArrowRight, X } from 'lucide-react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

import { DIGITAL_PRODUCTS, WEBSITE_PACKAGES, FAQ_ITEMS } from './data';
import { useGsapLiquidButtons } from './hooks/useGsapLiquidButtons';
import { DigitalProduct, WebsitePackage, CartItem, Category } from './types';
import { fetchProductsFromSheets, fetchWebsitePackagesFromSheets, fetchCategoriesFromSheets, DEFAULT_SHEETS_URL } from './api';

// Lazy load components for code splitting
const Navbar = React.lazy(() => import('./components/Navbar'));
const Cart = React.lazy(() => import('./components/Cart'));
const FAQAccordion = React.lazy(() => import('./components/FAQAccordion'));
const Hero = React.lazy(() => import('./components/Hero'));
const TrustBar = React.lazy(() => import('./components/TrustBar'));
const DigitalCatalog = React.lazy(() => import('./components/DigitalCatalog'));
const WebsitePackages = React.lazy(() => import('./components/WebsitePackages'));
const TimelineFlow = React.lazy(() => import('./components/TimelineFlow'));
const TestimonialMarquee = React.lazy(() => import('./components/TestimonialMarquee'));
const Footer = React.lazy(() => import('./components/Footer'));
const FloatingDoodles = React.lazy(() => import('./components/FloatingDoodles'));
const DigitalProductPage = React.lazy(() => import('./components/DigitalProductPage'));
const WebsiteDetailsPage = React.lazy(() => import('./components/WebsiteDetailsPage'));
const AdminDashboard = React.lazy<React.ComponentType<any>>(() => import('./components/AdminDashboard'));

// Cute Loading Fallback for lazy component suspense
const LoadingFallback = () => (
  <div className="h-screen bg-[#fff8f2] flex flex-col items-center justify-center select-none z-50">
    <div className="flex gap-1.5 items-center bg-[#FCDFA6] border-2 border-obsidian p-1 rounded-full shadow-[2px_2px_0px_0px_#1C1E1C] animate-bounce">
      <div className="w-8 h-8 bg-white border-2 border-obsidian rounded-full relative flex items-center justify-center overflow-hidden">
        <div className="w-3.5 h-3.5 bg-obsidian rounded-full absolute animate-ping" />
      </div>
      <div className="w-8 h-8 bg-white border-2 border-obsidian rounded-full relative flex items-center justify-center overflow-hidden">
        <div className="w-3.5 h-3.5 bg-obsidian rounded-full absolute animate-ping" />
      </div>
    </div>
    <span className="font-tag text-[9px] font-extrabold text-obsidian tracking-wider uppercase mt-3">Lagi Disiapin...</span>
  </div>
);

// Custom Brutalist/Cartoon SVGs for loader decorations
const BlueSquareDoodle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Shadow offset */}
    <rect x="24" y="24" width="56" height="56" rx="6" fill="#1C1E1C" />
    {/* Main Box */}
    <rect x="16" y="16" width="56" height="56" rx="6" fill="#3B82F6" stroke="#1C1E1C" strokeWidth="6.5" strokeLinejoin="round" />
    {/* Grid pattern accents inside */}
    <circle cx="28" cy="28" r="2.5" fill="#fff" opacity="0.8" />
    <circle cx="44" cy="28" r="2.5" fill="#fff" opacity="0.8" />
    <circle cx="60" cy="28" r="2.5" fill="#fff" opacity="0.8" />
    <circle cx="28" cy="44" r="2.5" fill="#fff" opacity="0.8" />
    <circle cx="44" cy="44" r="2.5" fill="#fff" opacity="0.8" />
    <circle cx="60" cy="44" r="2.5" fill="#fff" opacity="0.8" />
  </svg>
);

const GreenQuestionDoodle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Shadow offset */}
    <circle cx="54" cy="54" r="30" fill="#1C1E1C" />
    {/* Main circle */}
    <circle cx="46" cy="46" r="30" fill="#22C55E" stroke="#1C1E1C" strokeWidth="6.5" />
    {/* Inner small circle for question mark */}
    <circle cx="34" cy="34" r="12" fill="#fff" stroke="#1C1E1C" strokeWidth="4.5" />
    {/* Question mark text */}
    <text x="34" y="40" fill="#1C1E1C" fontSize="17" fontWeight="900" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">?</text>
  </svg>
);

const RedShieldDoodle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Top horizontal line bar */}
    <line x1="12" y1="14" x2="88" y2="14" stroke="#1C1E1C" strokeWidth="6.5" strokeLinecap="round" />
    {/* Shadow offset */}
    <path d="M 34 22 L 74 22 L 74 60 C 74 72 54 82 54 82 C 54 82 34 72 34 60 Z" fill="#1C1E1C" />
    {/* Main shield */}
    <path d="M 28 16 L 68 16 L 68 54 C 68 66 48 76 48 76 C 48 76 28 66 28 54 Z" fill="#EF4444" stroke="#1C1E1C" strokeWidth="6.5" strokeLinejoin="round" />
    {/* Shield icon outline inside */}
    <path d="M 38 26 L 58 26 L 58 48 C 58 56 48 62 48 62 C 48 62 38 56 38 48 Z" fill="none" stroke="#1C1E1C" strokeWidth="3" strokeLinejoin="round" />
    {/* Exclamation point */}
    <text x="48" y="43" fill="#1C1E1C" fontSize="16" fontWeight="950" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">!</text>
  </svg>
);

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

// Full screen startup Loading Screen
const LoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pupil looking around loop (active pupils, looking around)
    const tl = gsap.timeline({ repeat: -1 });
    tl.to('.loader-pupil', { x: 5, y: 3, duration: 0.35, ease: 'power1.inOut' })
      .to('.loader-pupil', { x: -5, y: -3, duration: 0.45, ease: 'power1.inOut', delay: 0.25 })
      .to('.loader-pupil', { x: 0, y: 4, duration: 0.3, ease: 'power1.inOut', delay: 0.15 })
      .to('.loader-pupil', { x: 5, y: -3, duration: 0.35, ease: 'power1.inOut', delay: 0.2 })
      .to('.loader-pupil', { x: -5, y: 3, duration: 0.4, ease: 'power1.inOut', delay: 0.25 })
      .to('.loader-pupil', { x: 0, y: 0, duration: 0.4, ease: 'power1.inOut', delay: 0.2 });

    // Initial mount scale-in for the doodles
    gsap.fromTo('.loader-doodle',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.85, ease: 'back.out(1.8)', stagger: 0.1, delay: 0.15 }
    );

    // Floating doodles animations
    const animBlue = gsap.to('.loader-doodle-blue', {
      x: 20,
      y: -25,
      rotate: -15,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    const animGreen = gsap.to('.loader-doodle-green', {
      x: -25,
      y: 15,
      rotate: 20,
      duration: 1.9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    const animRed = gsap.to('.loader-doodle-red', {
      y: 20,
      rotate: 8,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Parallax Curtain Reveal Screen Transition - Diagonal Split!
    const timeout = setTimeout(() => {
      // Kill float animations to avoid GSAP write conflicts during exit reveal
      animBlue.kill();
      animGreen.kill();
      animRed.kill();

      const revealTl = gsap.timeline({
        onComplete: () => {
          onComplete?.();
        }
      });

      // 1. Fade & shrink the loader content in the center
      revealTl.to('.loader-content', {
        scale: 0.85,
        opacity: 0,
        duration: 0.4,
        ease: 'back.in(1.5)'
      });

      // 2. Parallax fly-out for custom doodles (consistent with diagonal split direction)
      revealTl.to('.loader-doodle-blue', {
        x: -800,
        y: -800,
        rotate: -45,
        scale: 0.6,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.inOut'
      }, '<');
      revealTl.to('.loader-doodle-red', {
        x: 800,
        y: -800,
        rotate: 35,
        scale: 0.6,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.inOut'
      }, '<');
      revealTl.to('.loader-doodle-green', {
        x: 800,
        y: 800,
        rotate: 45,
        scale: 0.6,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.inOut'
      }, '<');

      // 3. Slide Cream Shutter Panels away diagonally
      revealTl.to('.loader-shutter-cream-left', {
        xPercent: -100,
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut'
      }, '-=0.15');
      revealTl.to('.loader-shutter-cream-right', {
        xPercent: 100,
        yPercent: 100,
        duration: 0.8,
        ease: 'power4.inOut'
      }, '<');

      // 4. Slide Orange Shutter Panels away diagonally (creating a trailing layered look)
      revealTl.to('.loader-shutter-orange-left', {
        xPercent: -100,
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut'
      }, '-=0.68');
      revealTl.to('.loader-shutter-orange-right', {
        xPercent: 100,
        yPercent: 100,
        duration: 0.8,
        ease: 'power4.inOut'
      }, '<');

      // 5. Fade out the main loader container
      revealTl.to(containerRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.45,
        ease: 'power2.inOut'
      }, '-=0.45');

      // 6. Parallax reveal the main content with a deep 3D scale and unfold perspective
      revealTl.fromTo('.route-content',
        {
          y: 150,
          scale: 0.88,
          rotationX: 12,
          transformOrigin: '50% 0%',
          perspective: 1000
        },
        {
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 0.95,
          ease: 'power4.out',
          clearProps: 'all'
        },
        '-=0.75'
      );
    }, 1600);

    return () => {
      clearTimeout(timeout);
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Background layer panels (Orange Shutter) */}
      <div
        className="loader-shutter-orange-left absolute inset-0 bg-blaze-orange z-10 pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div
        className="loader-shutter-orange-right absolute inset-0 bg-blaze-orange z-10 pointer-events-none"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
      />

      {/* Foreground layer panels (Cream Shutter) */}
      <div
        className="loader-shutter-cream-left absolute inset-0 bg-[#fff8f2] z-20 pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div
        className="loader-shutter-cream-right absolute inset-0 bg-[#fff8f2] z-20 pointer-events-none"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
      />

      {/* Floating custom doodles - placed outside content to prevent scaling/fading with the center logo */}
      {/* Desktop positions */}
      <BlueSquareDoodle className="loader-doodle loader-doodle-blue absolute top-[20%] left-[10%] md:left-[18%] w-24 h-24 pointer-events-none z-30 hidden md:block" />
      <RedShieldDoodle className="loader-doodle loader-doodle-red absolute top-[22%] right-[10%] md:right-[18%] w-24 h-24 pointer-events-none z-30 hidden md:block" />
      <GreenQuestionDoodle className="loader-doodle loader-doodle-green absolute bottom-[20%] right-[12%] md:right-[20%] w-24 h-24 pointer-events-none z-30 hidden md:block" />

      {/* Mobile positions */}
      <BlueSquareDoodle className="loader-doodle loader-doodle-blue absolute top-[14%] left-[6%] w-14 h-14 pointer-events-none z-30 md:hidden" />
      <RedShieldDoodle className="loader-doodle loader-doodle-red absolute top-[16%] right-[6%] w-14 h-14 pointer-events-none z-30 md:hidden" />
      <GreenQuestionDoodle className="loader-doodle loader-doodle-green absolute bottom-[18%] right-[8%] w-14 h-14 pointer-events-none z-30 md:hidden" />

      {/* Loader Content wrapper */}
      <div className="loader-content flex flex-col items-center gap-7 z-30">
        {/* Cute Cartoon Eyes Logo (Redesigned: Clean, no dashed ring) */}
        <div className="relative">
          <div className="relative flex gap-2 items-center bg-[#FCDFA6] border-4 border-obsidian p-2 rounded-full shadow-[6px_6px_0px_0px_#1C1E1C] z-10">
            <div className="w-14 h-14 bg-white border-4 border-obsidian rounded-full relative flex items-center justify-center overflow-hidden">
              <div className="loader-pupil w-6 h-6 bg-obsidian rounded-full absolute" />
            </div>
            <div className="w-14 h-14 bg-white border-4 border-obsidian rounded-full relative flex items-center justify-center overflow-hidden">
              <div className="loader-pupil w-6 h-6 bg-obsidian rounded-full absolute" />
            </div>
          </div>
        </div>

        {/* Text Title */}
        <h1 className="font-tag text-4xl font-black text-blaze-orange tracking-tight uppercase border-3 border-obsidian bg-white px-6 py-3 rounded-2xl shadow-[5px_5px_0px_0px_#1C1E1C] rotate-1">
          MADFAT
        </h1>

        {/* Brutalist 3 Dots Bounce loader */}
        <div className="flex gap-2 justify-center items-center mt-3 h-6">
          <span className="w-3.5 h-3.5 bg-blaze-orange border-2 border-obsidian rounded-full animate-bounce [animation-delay:-0.3s] shadow-[1.5px_1.5px_0px_0px_#1C1E1C]" />
          <span className="w-3.5 h-3.5 bg-blaze-orange border-2 border-obsidian rounded-full animate-bounce [animation-delay:-0.15s] shadow-[1.5px_1.5px_0px_0px_#1C1E1C]" />
          <span className="w-3.5 h-3.5 bg-blaze-orange border-2 border-obsidian rounded-full animate-bounce shadow-[1.5px_1.5px_0px_0px_#1C1E1C]" />
        </div>
      </div>
    </div>
  );
};

// ── Not Found / Unauthorized page ─────────────────────────────
const NotFoundPage = ({ onGoHome }: { onGoHome: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Smooth GSAP entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo('.notfound-box',
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)' }
      );
      gsap.fromTo('.notfound-doodle',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.85, ease: 'back.out(2)', comedy: 1, stagger: 0.15, delay: 0.2 }
      );
      // Floating animation for the mascot box
      gsap.to('.notfound-mascot', {
        y: -8,
        rotate: 2,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);

    // 2. Mouse move handler for interactive eyes
    const handleMouseMove = (e: MouseEvent) => {
      if (!leftPupilRef.current || !rightPupilRef.current) return;

      const pupils = [leftPupilRef.current, rightPupilRef.current];

      pupils.forEach((pupil) => {
        const rect = pupil.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        // Calculate angle and distance
        const dx = e.clientX - eyeCenterX;
        const dy = e.clientY - eyeCenterY;
        const angle = Math.atan2(dy, dx);

        // Limit max offset of pupils inside the eye
        const maxOffset = 6;
        const offsetX = Math.cos(angle) * maxOffset;
        const offsetY = Math.sin(angle) * maxOffset;

        // Smoothly animate the pupil position using GSAP
        gsap.to(pupil, {
          x: offsetX,
          y: offsetY,
          duration: 0.15,
          ease: 'power1.out'
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fff8f2] flex items-center justify-center select-none font-sans px-6 relative overflow-hidden">
      {/* Decorative Floating background elements */}
      <BlueSquareDoodle className="notfound-doodle absolute top-[15%] left-[10%] w-20 h-20 pointer-events-none z-10 hidden md:block" />
      <RedShieldDoodle className="notfound-doodle absolute bottom-[20%] left-[15%] w-20 h-20 pointer-events-none z-10 hidden md:block" />
      <GreenQuestionDoodle className="notfound-doodle absolute top-[25%] right-[12%] w-22 h-22 pointer-events-none z-10 hidden md:block" />

      {/* Main card box */}
      <div className="notfound-box w-full max-w-md bg-white border-4 border-obsidian rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(28,30,28,1)] text-center relative z-20">

        {/* Animated mascot cartoon container */}
        <div className="notfound-mascot flex justify-center mb-6">
          <div className="relative flex gap-2 items-center bg-[#FFECC9] border-4 border-obsidian p-4 rounded-full shadow-[4px_4px_0px_0px_#1C1E1C]">
            {/* Left Eye */}
            <div className="w-14 h-14 bg-white border-4 border-obsidian rounded-full relative flex items-center justify-center overflow-hidden">
              <div ref={leftPupilRef} className="w-6 h-6 bg-obsidian rounded-full absolute" />
            </div>
            {/* Right Eye */}
            <div className="w-14 h-14 bg-white border-4 border-obsidian rounded-full relative flex items-center justify-center overflow-hidden">
              <div ref={rightPupilRef} className="w-6 h-6 bg-obsidian rounded-full absolute" />
            </div>
          </div>
        </div>

        <span className="text-tag text-xs font-black bg-red-100 border-2 border-obsidian px-3.5 py-1 rounded-full text-red-750 inline-block uppercase tracking-wider mb-4 shadow-[2px_2px_0px_0px_rgba(28,30,28,1)]">
          ERROR 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-hero font-extrabold text-obsidian uppercase tracking-tight mb-3">
          HALAMAN HILANG!
        </h1>

        <p className="text-xs sm:text-sm text-on-surface-variant font-bold uppercase leading-relaxed mb-8 max-w-sm mx-auto">
          Ups! Halaman tidak ditemukan atau akses portal admin Anda belum terverifikasi.
        </p>

        <div className="flex justify-center">
          <button
            onClick={onGoHome}
            className="w-full py-3 bg-blaze-orange hover:bg-blaze-orange/95 text-white border-3 border-obsidian rounded-xl text-xs font-bold uppercase transition-all shadow-[3px_3px_0px_0px_rgba(28,30,28,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(28,30,28,1)] cursor-pointer"
          >
            Balik Belanja
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const initialPath = window.location.pathname;

  const [isInitialLoading, setIsInitialLoading] = useState(!initialPath.startsWith('/madfatdashboard'));
  const [products, setProducts] = useState<DigitalProduct[]>(() => {
    try {
      const cached = localStorage.getItem('madfat_cached_products');
      return cached ? JSON.parse(cached) : DIGITAL_PRODUCTS;
    } catch {
      return DIGITAL_PRODUCTS;
    }
  });
  const [websitePackages, setWebsitePackages] = useState<WebsitePackage[]>(() => {
    try {
      const cached = localStorage.getItem('madfat_cached_packages');
      return cached ? JSON.parse(cached) : WEBSITE_PACKAGES;
    } catch {
      return WEBSITE_PACKAGES;
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('madfat_cached_categories');
      return cached ? JSON.parse(cached) : [
        { id: 'streaming', name: 'Streaming' },
        { id: 'gaming', name: 'Gaming' },
        { id: 'education', name: 'Education / AI' },
        { id: 'other', name: 'Other' }
      ];
    } catch {
      return [
        { id: 'streaming', name: 'Streaming' },
        { id: 'gaming', name: 'Gaming' },
        { id: 'education', name: 'Education / AI' },
        { id: 'other', name: 'Other' }
      ];
    }
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; text: string; type?: 'success' | 'error' } | null>(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [isAdmin, setIsAdmin] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const currentPathRef = useRef(currentPath);
  const routeTlRef = useRef<gsap.core.Timeline | null>(null);
  const pendingHashRef = useRef<string | null>(null);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('madfat_admin_auth') === 'true');
  }, [currentPath]);

  const isDashboard = currentPath.startsWith('/madfatdashboard');

  const fetchProducts = useCallback(async () => {
    const sheetsUrl = localStorage.getItem('madfat_sheets_url') || import.meta.env.VITE_SHEETS_API_URL || DEFAULT_SHEETS_URL;
    if (!sheetsUrl) {
      console.warn('Sheets URL not configured, using fallback digital products.');
      return;
    }
    try {
      const data = await fetchProductsFromSheets(sheetsUrl);
      if (data && data.length > 0) {
        setProducts(data);
        localStorage.setItem('madfat_cached_products', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching products from Google Sheets:', error);
    }
  }, []);

  const fetchWebsitePackages = useCallback(async () => {
    const sheetsUrl = localStorage.getItem('madfat_sheets_url') || import.meta.env.VITE_SHEETS_API_URL || DEFAULT_SHEETS_URL;
    if (!sheetsUrl) {
      console.warn('Sheets URL not configured, using fallback website packages.');
      return;
    }
    try {
      const data = await fetchWebsitePackagesFromSheets(sheetsUrl);
      if (data && data.length > 0) {
        setWebsitePackages(data);
        localStorage.setItem('madfat_cached_packages', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching website packages from Google Sheets:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const sheetsUrl = localStorage.getItem('madfat_sheets_url') || import.meta.env.VITE_SHEETS_API_URL || DEFAULT_SHEETS_URL;
    if (!sheetsUrl) return;
    try {
      const data = await fetchCategoriesFromSheets(sheetsUrl);
      if (data && data.length > 0) {
        setCategories(data);
        localStorage.setItem('madfat_cached_categories', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching categories from Google Sheets:', error);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchWebsitePackages(), fetchCategories()]);
  }, [fetchProducts, fetchWebsitePackages, fetchCategories]);

  useEffect(() => {
    if (!currentPath.startsWith('/dashboard')) {
      refreshAllData();
    }
  }, [currentPath, refreshAllData]);

  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  useGsapLiquidButtons(currentPath);

  const scrollToTopNow = useCallback(() => {
    const globalLenis = (window as any).lenis;
    if (globalLenis) {
      globalLenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);
  }, []);

  const scrollToHashAfterRoute = useCallback((hash: string) => {
    window.setTimeout(() => {
      const target = document.querySelector(hash);
      const globalLenis = (window as any).lenis;

      if (target && globalLenis) {
        globalLenis.scrollTo(target, {
          duration: 1.15,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        return;
      }

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 90);
  }, []);

  const animateRouteChange = useCallback((nextPath: string) => {
    const cleanPath = nextPath || '/';
    if (cleanPath === currentPathRef.current) {
      const pendingHash = pendingHashRef.current;
      pendingHashRef.current = null;
      if (pendingHash) {
        scrollToHashAfterRoute(pendingHash);
      } else {
        scrollToTopNow();
      }
      return;
    }

    const wasDashboard = currentPathRef.current.startsWith('/madfatdashboard');
    const isNextDashboard = cleanPath.startsWith('/madfatdashboard');
    if (wasDashboard && isNextDashboard) {
      currentPathRef.current = cleanPath;
      setCurrentPath(cleanPath);
      scrollToTopNow();
      return;
    }

    const overlay = overlayRef.current;
    const content = contentRef.current;
    routeTlRef.current?.kill();

    if (!overlay || !content) {
      const pendingHash = pendingHashRef.current;
      pendingHashRef.current = null;
      currentPathRef.current = cleanPath;
      setCurrentPath(cleanPath);
      scrollToTopNow();
      if (pendingHash) scrollToHashAfterRoute(pendingHash);
      return;
    }

    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
    routeTlRef.current = tl;

    gsap.set(overlay, { display: 'block', yPercent: 100 });

    tl.to(overlay, {
      yPercent: 0,
      duration: 0.36,
      ease: 'power3.inOut'
    })
      .add(() => {
        currentPathRef.current = cleanPath;
        setCurrentPath(cleanPath);
        scrollToTopNow();
        gsap.set(content, {
          opacity: 0,
          y: 20,
          scale: 0.985,
          transformOrigin: 'center top'
        });
      })
      .to(content, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: 'back.out(1.25)'
      }, '+=0.04')
      .to(overlay, {
        yPercent: -100,
        duration: 0.48,
        ease: 'power3.inOut'
      }, '<+=0.08')
      .set(overlay, { display: 'none', yPercent: 100 })
      .set(content, { clearProps: 'opacity,transform' })
      .add(() => {
        const pendingHash = pendingHashRef.current;
        pendingHashRef.current = null;
        if (pendingHash) scrollToHashAfterRoute(pendingHash);
      });
  }, [scrollToHashAfterRoute, scrollToTopNow]);

  useEffect(() => {
    // Reset scroll to top on reload/load
    window.history.scrollRestoration = 'manual';
    scrollToTopNow();

    const handlePopState = () => {
      const nextPath = window.location.pathname || '/';
      const nextHash = window.location.hash;

      if (nextHash && nextPath === '/') {
        pendingHashRef.current = nextHash;
        animateRouteChange('/');
        return;
      }

      pendingHashRef.current = null;
      animateRouteChange(nextPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [animateRouteChange, scrollToTopNow]);

  // Playful scroll pop-in animations for section headings and tagged text blocks
  useEffect(() => {
    if (isInitialLoading) return; // Do not initialize ScrollTrigger animations while loading screen is active

    const timer = setTimeout(() => {
      // Target headings and elements with .animate-pop-in class
      const targets = document.querySelectorAll('.animate-pop-in');
      const anims: gsap.core.Tween[] = [];

      targets.forEach((el) => {
        // Exclude navbar links/brand title and marquee text
        if (el.closest('#navbar') || el.closest('.marquee') || el.closest('.nav-sticker')) return;

        // Set initial clean state (slightly shrunk, y-offset, and invisible)
        gsap.set(el, {
          scale: 0.95,
          y: 20,
          opacity: 0,
          transformOrigin: 'center center'
        });

        // Trigger pop-in with smooth power2.out ease
        const anim = gsap.to(el, {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true
          }
        });
        anims.push(anim);
      });

      // Refresh triggers once layout stabilizes
      ScrollTrigger.refresh();

      return () => {
        anims.forEach((anim) => {
          if (anim.scrollTrigger) {
            anim.scrollTrigger.kill();
          }
          anim.kill();
        });
      };
    }, 450); // Delay slightly to allow lazy elements and layout to render

    return () => clearTimeout(timer);
  }, [currentPath, isInitialLoading]);

  useEffect(() => {
    if (isDashboard) {
      return; // Native scrolling on admin dashboard for absolute reliability
    }
    let lenisInstance: Lenis | null = null;
    let rafId: number | null = null;

    // 50ms delay lets React commit layout changes to the DOM first
    const initTimeout = setTimeout(() => {
      try {
        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
        });

        (window as any).lenis = lenisInstance;

        const raf = (time: number) => {
          lenisInstance?.raf(time);
          rafId = requestAnimationFrame(raf);
        };

        rafId = requestAnimationFrame(raf);

        // Force layout dimensions sync immediately
        lenisInstance.resize();

        // Check if there is a hash target in window.location.hash and scroll to it immediately!
        if (window.location.hash) {
          const target = document.querySelector(window.location.hash);
          if (target) {
            setTimeout(() => {
              (window as any).lenis?.scrollTo(target, { duration: 1.5 });
            }, 60);
          }
        }
      } catch (error) {
        console.error('Lenis initialization failed:', error);
      }
    }, 50);

    return () => {
      clearTimeout(initTimeout);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      (window as any).lenis = null;
    };
  }, [currentPath]);

  const triggerNotification = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, text, type });
    const timeout = setTimeout(() => {
      setNotification(null);
    }, 2800);
    return () => clearTimeout(timeout);
  }, []);

  const handleAddToCart = useCallback((product: DigitalProduct | WebsitePackage) => {
    // If it's a website bundle package, redirect to WhatsApp
    if ('categoryName' in product) {
      const adminWhatsAppNumber = '6281234567890';
      const message = `Halo Admin Madfat! Saya tertarik untuk memesan/berkonsultasi mengenai paket website: ${product.name} (${product.priceText}). Mohon info detailnya.`;
      window.open(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        triggerNotification(`Jumlah ${product.name} berhasil ditambahkan di keranjang!`, 'success');
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      triggerNotification(`Produk ${product.name} telah masuk ke keranjang belanja!`, 'success');
      return [...prevItems, { product, quantity: 1, notes: '' }];
    });
  }, [triggerNotification]);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.product.id === productId);
      if (item) {
        if (quantity > item.quantity) {
          triggerNotification(`Berhasil menambah 1 kuantitas ${item.product.name}!`, 'success');
        } else if (quantity < item.quantity) {
          triggerNotification(`Berhasil mengurangi 1 kuantitas ${item.product.name}!`, 'error');
        }
      }
      return prevItems.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      );
    });
  }, [triggerNotification]);

  const handleUpdateNotes = useCallback((productId: string, notes: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      )
    );
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    triggerNotification('Item dihapus dari keranjang.', 'error');
  }, [triggerNotification]);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    triggerNotification('Semua isi keranjang telah dikosongkan.', 'error');
  }, [triggerNotification]);

  const formatPrice = useCallback((value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const handleDirectWhatsApp = useCallback(() => {
    const adminWhatsAppNumber = '6281234567890';
    const message = `Halo Admin Madfat! Saya ingin berkonsultasi mengenai akun digital premium atau jasa pembuatan website.`;
    window.open(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
  }, []);

  const cartCount = useMemo(() =>
    cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  return (
    <>
      {isInitialLoading && (
        <LoadingScreen onComplete={() => setIsInitialLoading(false)} />
      )}
      <div className="min-h-screen bg-surface text-obsidian relative overflow-x-hidden font-sans">
        <div ref={overlayRef} className="page-slider-overlay" aria-hidden="true" />
        <Suspense fallback={null}>
          {currentPath === '/' && !isInitialLoading && <FloatingDoodles />}
        </Suspense>

        {notification && (
          <div
            className={`fixed top-20 right-6 md:right-12 z-200 border border-orange-100/50 px-5 py-3.5 rounded-xl flex items-center gap-3 shadow-md text-xs sm:text-sm font-sans font-medium animate-slide-up-fade ${notification.type === 'error'
              ? 'bg-[#FEE2E2] text-[#991B1B]'
              : 'bg-[#E8FBF0] text-[#166534]'
              }`}
          >
            <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-semibold ${notification.type === 'error' ? 'bg-[#EF4444]' : 'bg-[#22C55E]'
              }`}>
              {notification.type === 'error' ? '✕' : '✓'}
            </div>
            <span>{notification.text}</span>
          </div>
        )}

        {!isDashboard && (
          <div className="fixed bottom-8 right-8 z-45 flex flex-col items-end gap-3">
            {/* Chat Menu Popup */}
            {isChatMenuOpen && (
              <div className="bg-white border-2 border-obsidian p-2 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[160px] animate-slide-up-fade origin-bottom-right">
                <button
                  onClick={handleDirectWhatsApp}
                  className="flex items-center gap-3 w-full p-2.5 hover:bg-[#25D366]/10 rounded-xl transition-colors text-left group cursor-pointer"
                >
                  <div className="bg-[#25D366] p-2 rounded-full text-white group-hover:scale-110 transition-transform flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 fill-current stroke-none" />
                  </div>
                  <span className="font-sans text-sm font-bold text-obsidian">WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    const discordUsername = 'dotfourty4';
                    // Web direct link to discord user
                    window.open('https://discord.com/users/681860497313628160', '_blank');
                  }}
                  className="flex items-center gap-3 w-full p-2.5 hover:bg-[#5865F2]/10 rounded-xl transition-colors text-left group cursor-pointer"
                >
                  <div className="bg-[#5865F2] p-2 rounded-full text-white group-hover:scale-110 transition-transform flex items-center justify-center">
                    <DiscordIcon className="w-5 h-5" />
                  </div>
                  <span className="font-sans text-sm font-bold text-obsidian">Discord</span>
                </button>
              </div>
            )}
            
            {/* Main Toggle Button */}
            <button
              onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
              className="bg-[#25D366] text-white border-2 border-obsidian p-4 rounded-full shadow-2xl hover:bg-emerald-600 transition-colors cursor-pointer brutalist-shadow-dark flex items-center justify-center gap-2 group"
            >
              <span className="font-tag text-xs font-black uppercase hidden group-hover:inline-block tracking-wider pl-1 text-white">
                {isChatMenuOpen ? 'Tutup' : 'Tanya Admin'}
              </span>
              {isChatMenuOpen ? (
                <X className="w-7 h-7 stroke-current" />
              ) : (
                <MessageCircle className="w-7 h-7 fill-current stroke-none text-white" />
              )}
            </button>
          </div>
        )}



        {!isDashboard && (
          <Suspense fallback={null}>
            <Navbar
              cartCount={cartCount}
              onCartClick={() => setIsCartOpen(true)}
              currentPath={currentPath}
            />
          </Suspense>
        )}

        <main ref={contentRef} className="route-content">
          {isDashboard ? (
            // /dashboard and sub-paths: show login if unauthenticated on sub-paths
            currentPath === '/madfatdashboard' || localStorage.getItem('madfat_admin_auth') === 'true' ? (
              <Suspense fallback={<div className="min-h-screen bg-white" />}>
                <AdminDashboard
                  products={products}
                  setProducts={setProducts}
                  websitePackages={websitePackages}
                  setWebsitePackages={setWebsitePackages}
                  categories={categories}
                  setCategories={setCategories}
                  onRefresh={refreshAllData}
                  formatPrice={formatPrice}
                  currentPath={currentPath}
                  onClose={() => {
                    window.location.href = '/';
                  }}
                  triggerNotification={triggerNotification}
                />
              </Suspense>
            ) : (
              <NotFoundPage onGoHome={() => {
                window.location.href = '/';
              }} />
            )
          ) : currentPath === '/produk' ? (
            <Suspense fallback={<LoadingFallback />}>
              <DigitalProductPage
                products={products}
                categories={categories}
                onAddToCart={handleAddToCart}
                formatPrice={formatPrice}
              />
            </Suspense>
          ) : currentPath === '/jasawebsite' ? (
            <Suspense fallback={<LoadingFallback />}>
              <WebsiteDetailsPage
                websitePackages={websitePackages}
                onAddToCart={handleAddToCart}
                formatPrice={formatPrice}
              />
            </Suspense>
          ) : currentPath === '/' || currentPath === '' ? (
            <>
              <Suspense fallback={<LoadingFallback />}>
                <Hero onDirectWhatsApp={handleDirectWhatsApp} products={products} />
              </Suspense>

              <Suspense fallback={null}>
                <TrustBar />
              </Suspense>

              <Suspense fallback={<LoadingFallback />}>
                <DigitalCatalog
                  products={products}
                  onAddToCart={handleAddToCart}
                  formatPrice={formatPrice}
                />
              </Suspense>

              <Suspense fallback={<LoadingFallback />}>
                <WebsitePackages
                  websitePackages={websitePackages}
                  onAddToCart={handleAddToCart}
                  onDirectWhatsApp={handleDirectWhatsApp}
                />
              </Suspense>

              <Suspense fallback={<LoadingFallback />}>
                <TimelineFlow />
              </Suspense>

              <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto" id="faq">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    <div>
                      <h2 className="animate-pop-in font-hero text-4xl sm:text-5xl font-bold text-obsidian leading-[1.05] tracking-tight mb-6">
                        PERTANYAAN <br />
                        <span className="text-blaze-orange">UMUM.</span>
                      </h2>
                      <p className="font-sans text-sm sm:text-base text-on-surface-variant mb-10 max-w-md">
                        Punya pertanyaan seputar layanan kami? Berikut adalah beberapa jawaban untuk pertanyaan yang paling sering ditanyakan.
                      </p>
                    </div>

                    <div className="p-6 bg-[#ffecc9] rounded-2xl max-w-md">
                      <h4 className="font-hero text-base font-bold text-obsidian mb-2">Masih bingung?</h4>
                      <p className="font-sans text-xs text-on-surface-variant mb-5">
                        Jangan ragu untuk langsung chat admin kami via WhatsApp untuk konsultasi gratis.
                      </p>
                      <button
                        onClick={handleDirectWhatsApp}
                        className="inline-flex items-center gap-2 font-tag text-xs font-bold text-blaze-orange uppercase group hover:text-obsidian transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                      >
                        <span>HUBUNGI KAMI</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <Suspense fallback={<LoadingFallback />}>
                      <FAQAccordion items={FAQ_ITEMS} />
                    </Suspense>
                  </div>
                </div>
              </section>

              <section className="mx-6 md:mx-12 max-w-7xl lg:mx-auto my-16 bg-blaze-orange text-white rounded-[32px] overflow-hidden relative">
                <div className="relative z-10 px-6 py-20 sm:p-24 flex flex-col items-center text-center max-w-3xl mx-auto">
                  <h2 className="animate-pop-in font-hero text-4xl sm:text-6xl font-bold text-white tracking-tight leading-none mb-6 uppercase">
                    READY TO <br />
                    <span className="italic block mt-1">LEVEL UP?</span>
                  </h2>
                  <p className="font-sans text-sm sm:text-base text-white/90 max-w-xl mb-10 leading-relaxed">
                    Jangan tunda pertumbuhan digitalmu. Dapatkan akun premium atau website impianmu hanya dengan beberapa klik.
                  </p>

                  <button
                    onClick={handleDirectWhatsApp}
                    className="btn-liquid btn-liquid-obsidian px-8.5 py-4.5 bg-obsidian text-white rounded-full font-tag text-xs font-bold tracking-wider flex items-center gap-3.5 group cursor-pointer border-2 border-obsidian"
                  >
                    <span className="relative z-10 flex items-center gap-3.5">
                      <span>ORDER VIA WHATSAPP</span>
                      <MessageCircle className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                    </span>
                  </button>
                </div>
              </section>

              {/* Get In Touch Form Section */}
              <section className="mx-6 md:mx-12 max-w-7xl lg:mx-auto mb-20 relative overflow-hidden select-none" id="kontak">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                  {/* Left Column: CTA Info */}
                  <div className="lg:col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left">
                    <h3 className="animate-pop-in font-hero text-4xl sm:text-5xl md:text-5.5xl font-black text-obsidian uppercase leading-[1.05] tracking-tight mb-6">
                      SIAP MENGEMBANGKAN <br />
                      <span className="text-blaze-orange">BISNIS ANDA?</span>
                    </h3>
                    <p className="animate-pop-in font-sans text-sm sm:text-base text-[#5F5B57] max-w-lg mb-2 leading-relaxed">
                      Hubungi kami untuk mendapatkan sesi konsultasi gratis. Kami siap membantu merumuskan strategi kehadiran digital terbaik yang relevan untuk target pasar UMKM Anda.
                    </p>
                  </div>

                  {/* Right Column: Kirim Pesan Card Form */}
                  <div className="lg:col-span-6 animate-pop-in w-full max-w-xl mx-auto">
                    <div className="bg-white border border-[#dfc0b3]/50 rounded-2xl p-6 sm:p-8 shadow-sm">
                      <h4 className="font-hero text-base sm:text-lg font-bold text-obsidian uppercase mb-5 tracking-wide">
                        KIRIM PESAN
                      </h4>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const name = formData.get('name') as string;
                          const email = formData.get('email') as string;
                          const msg = formData.get('message') as string;

                          const adminWhatsAppNumber = '6281234567890';
                          const message = `Halo Admin Madfat!\n\nNama: ${name}\nEmail/Kontak: ${email}\nDetail Kebutuhan: ${msg}`;
                          window.open(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="flex flex-col gap-4 font-sans text-xs sm:text-sm"
                      >
                        <div className="flex flex-col gap-1.5">
                          <label className="font-hero text-xs font-bold text-obsidian uppercase tracking-wide">Nama Lengkap</label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="Contoh: John Doe"
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-blaze-orange transition-colors text-obsidian"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-hero text-xs font-bold text-obsidian uppercase tracking-wide">Alamat Email</label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="Contoh: john@domain.com"
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-blaze-orange transition-colors text-obsidian"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-hero text-xs font-bold text-obsidian uppercase tracking-wide">Detail Pesan / Paket Kebutuhan</label>
                          <textarea
                            name="message"
                            required
                            rows={3}
                            placeholder="Ceritakan gambaran singkat tentang bisnis Anda..."
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-blaze-orange transition-colors text-obsidian resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 mt-2 bg-blaze-orange hover:bg-blaze-orange/90 text-white font-tag text-xs font-bold tracking-wider rounded-lg transition-colors uppercase cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span className="flex items-center justify-center gap-2 text-white font-extrabold">
                            <span>KIRIM SEKARANG</span>
                            <svg className="w-3.5 h-3.5 transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              </section>

              <Suspense fallback={<LoadingFallback />}>
                <TestimonialMarquee />
              </Suspense>
            </>
          ) : (
            <NotFoundPage onGoHome={() => {
              window.location.href = '/';
            }} />
          )}
        </main>

        {!isDashboard && (
          <Suspense fallback={null}>
            <Footer
              onDirectWhatsApp={handleDirectWhatsApp}
              onCartOpen={() => setIsCartOpen(true)}
            />
          </Suspense>
        )}

        <Suspense fallback={null}>
          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateNotes={handleUpdateNotes}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            triggerNotification={triggerNotification}
          />
        </Suspense>
      </div>
    </>
  );
}
