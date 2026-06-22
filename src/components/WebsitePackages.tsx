import React from 'react';
import { Check } from 'lucide-react';
import { gsap } from 'gsap';
import { WebsitePackage } from '../types';

interface WebsitePackagesProps {
  websitePackages: WebsitePackage[];
  onAddToCart: (pack: WebsitePackage) => void;
  onDirectWhatsApp: () => void;
}

export default function WebsitePackages({
  websitePackages,
  onAddToCart,
  onDirectWhatsApp
}: WebsitePackagesProps) {
  // Use the first 5 packages
  const activePackages = websitePackages.slice(0, 5);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const currentTargetScrollRef = React.useRef<number | null>(null);
  const scrollTweenRef = React.useRef<gsap.core.Tween | null>(null);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const card = container.firstElementChild as HTMLElement;
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        
        let baseScroll = currentTargetScrollRef.current !== null ? currentTargetScrollRef.current : container.scrollLeft;
        const targetScroll = Math.max(0, baseScroll - (cardWidth + 24));
        currentTargetScrollRef.current = targetScroll;

        container.style.scrollSnapType = 'none';
        container.style.scrollBehavior = 'auto';

        if (scrollTweenRef.current) {
          scrollTweenRef.current.kill();
        }

        const obj = { x: container.scrollLeft };
        scrollTweenRef.current = gsap.to(obj, {
          x: targetScroll,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
          onUpdate: () => {
            container.scrollLeft = obj.x;
          },
          onComplete: () => {
            container.style.scrollSnapType = 'x mandatory';
            currentTargetScrollRef.current = null;
          }
        });
      }
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const card = container.firstElementChild as HTMLElement;
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        let baseScroll = currentTargetScrollRef.current !== null ? currentTargetScrollRef.current : container.scrollLeft;
        const targetScroll = Math.min(maxScroll, baseScroll + (cardWidth + 24));
        currentTargetScrollRef.current = targetScroll;

        container.style.scrollSnapType = 'none';
        container.style.scrollBehavior = 'auto';

        if (scrollTweenRef.current) {
          scrollTweenRef.current.kill();
        }

        const obj = { x: container.scrollLeft };
        scrollTweenRef.current = gsap.to(obj, {
          x: targetScroll,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
          onUpdate: () => {
            container.scrollLeft = obj.x;
          },
          onComplete: () => {
            container.style.scrollSnapType = 'x mandatory';
            currentTargetScrollRef.current = null;
          }
        });
      }
    }
  };

  return (
    <section className="bg-obsidian py-20 px-6 md:px-12 relative overflow-hidden" id="website">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 max-w-3xl mx-auto">
          <h2 className="animate-pop-in font-hero text-4xl sm:text-5xl md:text-6xl font-bold text-[#fff8f2] leading-[1.05] tracking-tight uppercase mb-6">
            BUAT BISNIS <br />
            GO DIGITAL <br />
            <span className="text-blaze-orange">SEKARANG.</span>
          </h2>
          <p className="animate-pop-in font-sans text-sm sm:text-base text-white/50 max-w-lg leading-relaxed">
            Solusi pembuatan website profesional dengan performa tinggi, desain modern, dan teroptimasi SEO.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="mt-12">
          <h3 className="animate-pop-in font-hero text-center text-2xl sm:text-3xl font-bold mb-4 uppercase tracking-wide text-white">
            Pilihan Paket <span className="text-glow-peach block sm:inline italic">Website</span>
          </h3>

          {/* Mobile Navigation Arrows */}
          <div className="flex md:hidden justify-center gap-3 mb-6 select-none">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full border-2 border-white bg-obsidian text-white flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_#FF7A30] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#FF7A30] cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-full border-2 border-white bg-obsidian text-white flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_#FF7A30] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#FF7A30] cursor-pointer"
            >
              →
            </button>
          </div>

          {/* Centered Flex Container - Horizontal Scroll on Mobile, wrapped on Desktop */}
          <div ref={scrollContainerRef} className="flex flex-row md:flex-wrap md:justify-center overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-6 px-4 -mx-4 md:mx-auto md:px-0 gap-6 md:max-w-[920px]">
            {activePackages.map((pkg, i) => {
              const isOrange = i % 2 === 0;
              const displayTitle = pkg.name.includes(':') ? pkg.name.split(':')[1].trim() : pkg.name;

              return (
                <div
                  key={pkg.id}
                  className={`animate-pop-in flex-shrink-0 w-[70vw] sm:w-[280px] snap-center min-h-[430px] sm:min-h-[460px] py-6 px-5 sm:py-8 sm:px-6 rounded-[24px] sm:rounded-[32px] border-2 flex flex-col justify-between relative cursor-default select-none transition-all duration-300 ${
                    isOrange
                      ? 'bg-[#FF7A30] border-obsidian text-white shadow-[5px_5px_0px_0px_#ffffff] hover:border-white'
                      : 'bg-white border-obsidian text-obsidian shadow-[5px_5px_0px_0px_#FF7A30] hover:border-blaze-orange'
                  }`}
                  style={{ willChange: 'transform' }}
                >
                  {/* Badge position for Featured card */}
                  {pkg.isFeatured && (
                    <span className="absolute top-3.5 right-3.5 bg-[#FF7A30] text-white font-tag text-[8px] font-bold px-2 py-0.5 rounded border border-obsidian uppercase tracking-wider">
                      {pkg.badge || 'POPULER'}
                    </span>
                  )}

                  <div>
                    {/* Category Label */}
                    <span
                      className={`block font-tag text-[9px] font-bold uppercase tracking-widest mb-1.5 ${
                        isOrange ? 'text-[#fff2de]/80' : 'text-[#8C8A87]'
                      }`}
                    >
                      {pkg.categoryName}
                    </span>

                    {/* Title */}
                    <h4
                      className={`font-hero text-xl font-bold tracking-tight mb-2 uppercase border-b pb-1.5 ${
                        isOrange ? 'text-white border-white/20' : 'text-obsidian border-obsidian/10'
                      }`}
                    >
                      {displayTitle.replace('WEB', '').replace('BUSINESS', '').trim()}
                    </h4>

                    {/* Subtitle */}
                    <p
                      className={`font-sans text-[11px] leading-relaxed mb-3 sm:mb-4 min-h-[30px] sm:min-h-[40px] ${
                        isOrange ? 'text-[#fff8f2]/95' : 'text-[#5F5B57]'
                      }`}
                    >
                      {pkg.sub}
                    </p>

                    {/* Price */}
                    <div className="mb-3 sm:mb-4">
                      <span
                        className={`text-[8px] uppercase font-bold block tracking-widest ${
                          isOrange ? 'text-[#fff8f2]/70' : 'text-[#8C8A87]'
                        }`}
                      >
                        Harga Paket
                      </span>
                      <span
                        className={`font-hero text-2xl font-bold italic ${
                          isOrange ? 'text-white' : 'text-[#FF7A30]'
                        }`}
                      >
                        {pkg.priceText}
                      </span>
                    </div>

                    {/* Features list - Shortened to 3 items */}
                    <ul
                      className={`space-y-1.5 mb-5 sm:space-y-2 sm:mb-6 text-[10px] font-medium border-t border-dashed pt-3.5 ${
                        isOrange ? 'border-white/20 text-[#fff8f2]/95' : 'border-obsidian/10 text-[#5F5B57]'
                      }`}
                    >
                      {(Array.isArray(pkg.features) ? pkg.features : []).slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check
                            className={`w-3 h-3 flex-shrink-0 mt-0.5 ${
                              isOrange ? 'text-white' : 'text-[#FF7A30]'
                            }`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => onAddToCart(pkg)}
                    className={`btn-liquid ${
                      isOrange ? 'btn-liquid-white bg-white text-obsidian' : 'btn-liquid-orange bg-[#FF7A30] text-white'
                    } w-full py-2.5 rounded-full border-2 border-obsidian font-tag text-[10px] font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_#1C1E1C] cursor-pointer`}
                    style={{ willChange: 'transform' }}
                  >
                    <span className={`relative z-10 ${isOrange ? 'text-obsidian' : 'text-white'}`}>
                      {pkg.btnText || 'PILIH PAKET'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* See More Details Button */}
        <div className="mt-8 text-center select-none">
          <a
            href="/jasawebsite"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/jasawebsite');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="btn-liquid btn-liquid-orange inline-block px-8 py-3.5 bg-[#FF7A30] text-white rounded-full font-tag text-xs font-bold tracking-wider uppercase border-2 border-obsidian shadow-[4px_4px_0px_0px_#ffffff] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#ffffff] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#ffffff] transition-all duration-150"
          >
            <span className="relative z-10">LIHAT LEBIH DETAIL</span>
          </a>
        </div>

      </div>
    </section>
  );
}
