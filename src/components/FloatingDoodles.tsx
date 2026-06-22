import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const DoodleSmiley = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="#FFECC9" stroke="#1C1E1C" strokeWidth="2.2" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
    <circle cx="9" cy="9" r="1.5" fill="#1C1E1C" />
    <circle cx="15" cy="9" r="1.5" fill="#1C1E1C" />
  </svg>
);

const DoodleBolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="#FCDFA6" stroke="#1C1E1C" strokeWidth="2.2" strokeLinejoin="round" {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const DoodleArrow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#FF7A30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12h18M15 6l6 6-6 6" />
  </svg>
);

const DoodleCloud = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 80" {...props}>
    <path d="M20 50 C 20 30, 45 25, 55 35 C 65 15, 95 20, 100 35 C 112 35, 118 48, 110 58 C 100 70, 10 70, 20 50 Z" fill="#1C1E1C" />
    <path d="M16 46 C 16 26, 41 21, 51 31 C 61 11, 91 16, 96 31 C 108 31, 114 44, 106 54 C 96 66, 6 66, 16 46 Z" fill="#EBF3FF" stroke="#1C1E1C" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const DoodleHeart = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="#FFDAD6" stroke="#1C1E1C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

export default function FloatingDoodles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Doodle 1: Smiley left hero
      gsap.to('.doodle-smiley-1', {
        y: 15,
        rotate: 10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Doodle 2: Bolt right hero
      gsap.to('.doodle-bolt', {
        y: -12,
        rotate: 5,
        duration: 2.5,
        delay: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Doodle 3: Arrow middle left
      gsap.to('.doodle-arrow', {
        x: 8,
        rotate: 6,
        duration: 2.25,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Doodle 4: Heart middle right
      gsap.to('.doodle-heart', {
        scale: 1.15,
        rotate: 10,
        duration: 2.75,
        delay: 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Doodle 5: Cloud bottom left
      gsap.to('.doodle-cloud', {
        y: 10,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Doodle 6: Smiley bottom right (spinning)
      gsap.to('.doodle-smiley-2', {
        rotate: 360,
        duration: 25,
        repeat: -1,
        ease: 'none'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none">
      {/* Doodle 1: Smiley left hero */}
      <DoodleSmiley
        className="doodle-smiley-1 absolute top-[20%] left-4 w-12 h-12 md:w-16 md:h-16 opacity-45"
        style={{ willChange: 'transform' }}
      />

      {/* Doodle 2: Bolt right hero */}
      <DoodleBolt
        className="doodle-bolt absolute top-[15%] right-8 w-10 h-10 md:w-14 md:h-14 opacity-40"
        style={{ willChange: 'transform' }}
      />

      {/* Doodle 3: Arrow middle left */}
      <DoodleArrow
        className="doodle-arrow absolute top-[45%] left-10 w-8 h-8 md:w-12 md:h-12 opacity-35"
        style={{ willChange: 'transform' }}
      />

      {/* Doodle 4: Heart middle right */}
      <DoodleHeart
        className="doodle-heart absolute top-[55%] right-6 w-11 h-11 md:w-14 md:h-14 opacity-40"
        style={{ willChange: 'transform' }}
      />

      {/* Doodle 5: Cloud bottom left */}
      <DoodleCloud
        className="doodle-cloud absolute top-[75%] left-8 w-20 h-14 opacity-35"
        style={{ willChange: 'transform' }}
      />

      {/* Doodle 6: Smiley bottom right */}
      <DoodleSmiley
        className="doodle-smiley-2 absolute top-[82%] right-12 w-12 h-12 opacity-40"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
