import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function TimelineFlow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.timeline-step',
        {
          opacity: 0,
          y: 35,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.25,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="bg-obsidian py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h3 className="animate-pop-in font-hero text-center text-3xl sm:text-[40px] font-bold mb-16 text-white uppercase">
          ALUR <span className="text-blaze-orange">PENGERJAAN.</span>
        </h3>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-12 relative">
          
          {/* Connector Line in desktop */}
          <div className="hidden md:block absolute top-10 left-16 right-16 h-1 bg-dashed border-t-2 border-dashed border-white/20 z-0" />

          {/* Step 1 */}
          <div className="timeline-step flex items-center md:flex-col gap-4 md:gap-0 text-left md:text-center relative z-10 p-2">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-blaze-orange text-white rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center font-hero text-lg md:text-2xl font-bold border-3 md:border-4 border-obsidian brutalist-shadow-dark rotate-3">
              01
            </div>
            <div className="flex-grow md:mt-6">
              <h4 className="font-hero text-sm md:text-lg font-bold text-white mb-0.5 md:mb-2">Diskusi & Brief</h4>
              <p className="font-sans text-[11px] sm:text-xs md:text-sm text-white/50 leading-relaxed max-w-xs md:mx-auto">
                Sampaikan kebutuhan fitur, sitemap menu, serta referensi website impian Anda kepada admin kami.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="timeline-step flex items-center md:flex-col gap-4 md:gap-0 text-left md:text-center relative z-10 p-2">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-white text-obsidian rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center font-hero text-lg md:text-2xl font-bold border-3 md:border-4 border-obsidian brutalist-shadow-dark -rotate-6">
              02
            </div>
            <div className="flex-grow md:mt-6">
              <h4 className="font-hero text-sm md:text-lg font-bold text-white mb-0.5 md:mb-2">Proses Development</h4>
              <p className="font-sans text-[11px] sm:text-xs md:text-sm text-white/50 leading-relaxed max-w-xs md:mx-auto">
                Kreator kami langsung mengkode layout website Anda dengan interaksi Framer Motion dan kecepatan load tinggi.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="timeline-step flex items-center md:flex-col gap-4 md:gap-0 text-left md:text-center relative z-10 p-2">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-cream-warm text-obsidian rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center font-hero text-lg md:text-2xl font-bold border-3 md:border-4 border-obsidian brutalist-shadow-dark rotate-2">
              03
            </div>
            <div className="flex-grow md:mt-6">
              <h4 className="font-hero text-sm md:text-lg font-bold text-white mb-0.5 md:mb-2">Review & Launch</h4>
              <p className="font-sans text-[11px] sm:text-xs md:text-sm text-white/50 leading-relaxed max-w-xs md:mx-auto">
                Setelah revisi dan feedback diselesaikan, web siap dirilis online menggunakan setup hosting & domain premium Anda!
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
