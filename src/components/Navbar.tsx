import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { useGsapLiquidButtons } from '../hooks/useGsapLiquidButtons';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  brandName?: string;
  currentPath: string;
}

/* Animated Cartoon Doodle Googly Eyes using GSAP */
const AnimatedGooglyEyes = () => (
  <div className="flex gap-0.5 items-center bg-[#FCDFA6] border-2 border-obsidian p-0.5 rounded-full shadow-[1.5px_1.5px_0px_0px_#1C1E1C] shrink-0 select-none pointer-events-none">
    <div className="w-4 h-4 bg-white border-2 border-obsidian rounded-full relative flex items-center justify-center overflow-hidden">
      <div className="nav-eye-1 w-1.5 h-1.5 bg-obsidian rounded-full absolute" />
    </div>
    <div className="w-4 h-4 bg-white border-2 border-obsidian rounded-full relative flex items-center justify-center overflow-hidden">
      <div className="nav-eye-2 w-1.5 h-1.5 bg-obsidian rounded-full absolute" />
    </div>
  </div>
);

/* Hanging animated badge sticker using GSAP */
const AnimatedHangingDoodle = () => (
  <div className="nav-sticker absolute -bottom-5 left-8 bg-blaze-orange text-white border-2 border-obsidian rounded-lg px-2 py-0.5 text-[8px] font-bold shadow-[2px_2px_0px_0px_#1C1E1C] origin-top select-none pointer-events-none z-[60]">
    ✨ BARU!
  </div>
);

export default function Navbar({ cartCount, onCartClick, brandName = "Madfat", currentPath }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const containerRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useGsapLiquidButtons(currentPath);

  useEffect(() => {
    if (currentPath === '/produk') {
      setActiveLink('/produk');
    } else if (currentPath === '/jasawebsite') {
      setActiveLink('/jasawebsite');
    } else {
      setActiveLink('/');
    }
  }, [currentPath]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Calculate scroll progress ratio
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;

      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: progress,
          duration: 0.15,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Eye tracking & Doodle swing effects
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    let eyesCtx: gsap.Context | null = null;

    if (isMobile) {
      // Loop wiggling eyes on mobile
      eyesCtx = gsap.context(() => {
        gsap.to('.nav-eye-1', {
          x: 2,
          y: 1,
          duration: 1.75,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
        gsap.to('.nav-eye-2', {
          x: 2,
          y: 1,
          duration: 1.75,
          delay: 0.15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }, containerRef);
    } else {
      // Track cursor coordinates on desktop
      const handleMouseMove = (e: MouseEvent) => {
        const pupils = document.querySelectorAll('.nav-eye-1, .nav-eye-2');
        pupils.forEach((pupil) => {
          const rect = pupil.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          const distance = Math.min(2.5, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 60);

          gsap.to(pupil, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            duration: 0.15,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        });
      };
      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }

    return () => {
      if (eyesCtx) eyesCtx.revert();
    };
  }, []);

  // Badge swinging loop
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.nav-sticker', {
        rotate: 8,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const navLinks = [
    { name: 'BERANDA', href: '/' },
    { name: 'AKUN DIGITAL', href: '/produk' },
    { name: 'JASA WEBSITE', href: '/jasawebsite' },
    { name: 'FAQ', href: '#faq' },
    { name: 'KONTAK', href: '#kontak' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/')) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/' + href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      setActiveLink(href);
      const globalLenis = (window as any).lenis;
      if (globalLenis) {
        globalLenis.scrollTo(href, {
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      // Also update hash in url without reloading or jumping
      window.history.pushState({}, '', href);
    }
  };

  return (
    <>
      <nav
        ref={containerRef}
        id="navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-[#fff8f2] py-2 border-b border-sand-gold/30 shadow-sm'
          : 'bg-[#fff8f2] py-4 border-b border-sand-gold/20'
          }`}
      >
        {/* Hanging Doodle Stiker */}
        <AnimatedHangingDoodle />

        {/* Scroll Progress Bar at the top of Navbar */}
        <div
          ref={progressBarRef}
          className="absolute top-0 left-0 h-1 bg-blaze-orange z-50 w-full"
          style={{ transform: 'scaleX(0)', transformOrigin: 'left center', willChange: 'transform' }}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo with Googly Eyes */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="font-tag text-3xl sm:text-[34px] font-bold text-blaze-orange tracking-tight">
              {brandName}
            </span>
            <AnimatedGooglyEyes />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-tag text-xs sm:text-[13px] font-normal tracking-wider">
            {navLinks.map((link) => {
              const isActive = activeLink === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`nav-link-underline relative py-1.5 transition-colors duration-200 uppercase ${isActive ? 'text-blaze-orange active' : 'text-obsidian hover:text-blaze-orange'
                    }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Cart Icon & CTA */}
          <div className="flex items-center gap-4">
            <button
              id="nav-cart-btn"
              onClick={onCartClick}
              className="relative p-2 text-blaze-orange hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-obsidian text-white font-tag text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-blaze-orange">
                  {cartCount}
                </span>
              )}
            </button>

            <a
              href="/produk"
              onClick={(e) => handleLinkClick(e, '/produk')}
              className="btn-liquid btn-liquid-orange hidden md:inline-block px-6 py-3 bg-blaze-orange text-white rounded-full font-tag text-[12px] font-black tracking-wider border-2 border-obsidian shadow-[4px_4px_0px_0px_#1C1E1C] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1C1E1C] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1C1E1C] transition-[transform,box-shadow] duration-150"
            >
              <span className="relative z-10">MULAI ORDER</span>
            </a>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-obsidian cursor-pointer hover:text-blaze-orange transition-colors bg-transparent border-none outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation (Embedded inside nav, top-full to anchor seamlessly) */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#fff8f2] border-t border-b-3 border-obsidian z-45 md:hidden shadow-[0_12px_24px_rgba(28,30,28,0.12)] animate-fade-in-down">
            <div className="flex flex-col font-tag uppercase">
              {navLinks.map((link, idx) => {
                const isActive = activeLink === link.href;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`py-3.5 px-6 text-sm font-bold tracking-wider border-b border-sand-gold/10 flex items-center gap-3 transition-colors ${
                      isActive 
                        ? 'text-blaze-orange bg-[#FCDFA6]/20' 
                        : 'text-obsidian hover:bg-[#fff2de]/50'
                    }`}
                  >
                    <span className={`text-[10px] ${isActive ? 'text-blaze-orange' : 'text-obsidian/40'}`}>0{idx + 1}.</span>
                    <span>{link.name}</span>
                  </a>
                );
              })}
              
              <div className="p-6 flex flex-col gap-3.5 bg-[#fff8f2]">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onCartClick();
                  }}
                  className="w-full py-3.5 bg-[#FCDFA6] border-2 border-obsidian rounded-xl text-obsidian text-center font-black tracking-wider shadow-[3px_3px_0px_0px_#1C1E1C] active:translate-y-[1.5px] active:shadow-[1.5px_1.5px_0px_0px_#1C1E1C] transition-all cursor-pointer text-xs uppercase"
                >
                  LIHAT KERANJANG ({cartCount})
                </button>
                <a
                  href="/produk"
                  onClick={(e) => handleLinkClick(e, '/produk')}
                  className="w-full py-3.5 bg-blaze-orange text-white border-2 border-obsidian rounded-xl text-center font-black tracking-wider shadow-[3px_3px_0px_0px_#1C1E1C] active:translate-y-[1.5px] active:shadow-[1.5px_1.5px_0px_0px_#1C1E1C] transition-all text-xs uppercase"
                >
                  MULAI ORDER
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
