import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../data';
import { gsap } from 'gsap';

export default function TestimonialMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const ctx = gsap.context(() => {
      // Infinite linear scroll
      const tween = gsap.to(marquee, {
        xPercent: -50,
        repeat: -1,
        duration: 28,
        ease: 'none',
      });

      // Create an undulating speed wave (fast -> slow -> fast -> slow)
      const speedControl = gsap.to(tween, {
        timeScale: 0.18,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Slow down to a crawlspeed (0.06) on hover without fully stopping
      const onMouseEnter = () => {
        speedControl.pause();
        gsap.to(tween, { timeScale: 0.06, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      };

      // Resume speed wave fluctuation
      const onMouseLeave = () => {
        gsap.to(tween, {
          timeScale: speedControl.progress() > 0.5 ? 0.18 : 1.0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            speedControl.play();
          }
        });
      };

      marquee.addEventListener('mouseenter', onMouseEnter);
      marquee.addEventListener('mouseleave', onMouseLeave);

      return () => {
        marquee.removeEventListener('mouseenter', onMouseEnter);
        marquee.removeEventListener('mouseleave', onMouseLeave);
      };
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-20 bg-[#fff8f2] overflow-hidden select-none" id="testimonials">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <h2 className="font-hero text-center text-3xl sm:text-[40px] font-bold text-obsidian uppercase">
          Testimoni <span className="text-blaze-orange">User.</span>
        </h2>
      </div>

      {/* Marquee Loop with alternating black and white cards */}
      <div className="marquee py-6">
        <div ref={marqueeRef} className="marquee-content flex gap-8 whitespace-nowrap">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`w-80 p-6 shrink-0 rounded-2xl border-2 transition-all duration-300 mr-4 inline-block select-none ${
                  isEven 
                    ? 'bg-obsidian text-white border-blaze-orange shadow-[5px_5px_0px_0px_#FF7A30]'
                    : 'bg-white text-obsidian border-[#FF7A30] shadow-[5px_5px_0px_0px_#1C1E1C]'
                }`}
              >
                <div className="flex text-blaze-orange mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className={`font-sans text-xs leading-relaxed mb-4 whitespace-normal italic ${
                  isEven ? 'text-white/90' : 'text-on-surface-variant'
                }`}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border border-obsidian text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase ${
                    isEven ? 'bg-[#FF7A30] text-white' : 'bg-obsidian text-white'
                  }`}>
                    {t.name.slice(0, 1)}
                  </div>
                  <div>
                    <h5 className={`font-hero text-xs font-bold ${isEven ? 'text-white' : 'text-obsidian'}`}>{t.name}</h5>
                    <p className={`font-tag text-[9px] uppercase font-bold ${isEven ? 'text-white/60' : 'text-on-surface-variant/70'}`}>{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
