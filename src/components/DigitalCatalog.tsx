import React, { useEffect, useRef } from 'react';
import { Plus, Tv, Music, Gamepad, GraduationCap, Sparkles, MessageCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { DigitalProduct } from '../types';

interface DigitalCatalogProps {
  products: DigitalProduct[];
  onAddToCart: (product: DigitalProduct) => void;
  formatPrice: (value: number) => string;
}

/* Doodle elements with standard SVG types */
const DoodleStar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="#FF7A30" stroke="#1C1E1C" strokeWidth="2.5" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const DoodleSquiggle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 20" fill="none" stroke="#1C1E1C" strokeWidth="3.5" strokeLinecap="round" {...props}>
    <path d="M5 10c15-10 30 10 45 0s30-10 45 0" />
  </svg>
);

export default function DigitalCatalog({
  products,
  onAddToCart,
  formatPrice
}: DigitalCatalogProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Catalog Star 1 spin
      gsap.to('.catalog-star-1', {
        rotate: 360,
        duration: 25,
        repeat: -1,
        ease: 'none'
      });

      // Catalog Star 2 scale
      gsap.to('.catalog-star-2', {
        scale: 1.2,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleBtnMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleBtnMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleBtnMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleBtnMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.1,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleBusinessWhatsApp = () => {
    const adminWhatsAppNumber = '6281234567890';
    const message = `Halo Admin Madfat! Saya tertarik dengan penawaran Kustom Order & Kebutuhan Bisnis/Bulk untuk akun digital. Mohon info detailnya.`;
    window.open(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section 
      ref={containerRef}
      className="bg-[#fff8f2] py-20 px-6 md:px-12 group relative overflow-hidden" 
      id="digital"
    >

      {/* Decorative Floating Doodle Ornaments */}
      <DoodleStar
        className="catalog-star-1 absolute top-10 left-6 w-12 h-12 opacity-80 hidden md:block"
        style={{ willChange: 'transform' }}
      />
      <DoodleStar
        className="catalog-star-2 absolute bottom-24 right-10 w-16 h-16 opacity-75 hidden lg:block"
        style={{ willChange: 'transform' }}
      />
      <DoodleSquiggle className="absolute top-1/2 left-2 w-20 opacity-60 hidden xl:block" />

      <div className="max-w-7xl mx-auto relative z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="relative">
            <h2 className="font-hero text-4xl sm:text-5xl md:text-6xl font-bold text-obsidian tracking-tight leading-none mb-4 uppercase">
              KATALOG <span className="text-blaze-orange">TERLARIS.</span>
            </h2>
            <p className="animate-pop-in font-sans text-sm sm:text-base text-[#5F5B57] max-w-xl">
              Pilih dari akun premium legal terlaris dengan proses aktivasi instan dan garansi uang kembali.
            </p>
            <DoodleSquiggle className="w-32 mt-2 text-blaze-orange stroke-blaze-orange" />
          </div>
        </div>

        {/* Grid Products - Limited to 4 items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.filter(p => !p.isOutOfStock).slice(0, 4).map((product) => {
            return (
              <div
                key={product.id}
                className="animate-pop-in bg-[#f5f0eb] border-2 border-obsidian rounded-2xl shadow-[5px_5px_0px_0px_#1C1E1C] relative overflow-hidden flex flex-row sm:flex-col items-center sm:items-stretch justify-between p-3.5 sm:p-6 gap-3.5 sm:gap-6 flex cursor-default select-none"
              >
                {/* Top Badges */}
                {product.hot && (
                  <span className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 bg-blaze-orange text-white font-tag text-[8px] sm:text-[9px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-obsidian shadow-[1px_1px_0px_0px_#1C1E1C]">
                    HOT
                  </span>
                )}
                {product.bestSeller && (
                  <span className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 bg-blaze-orange text-white font-tag text-[8px] sm:text-[9px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-obsidian shadow-[1px_1px_0px_0px_#1C1E1C]">
                    BEST
                  </span>
                )}

                {/* Left part in mobile (Image Logo) */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 border-obsidian shadow-[2px_2px_0px_0px_#1C1E1C] shrink-0 overflow-hidden bg-obsidian flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-lg sm:text-xl text-white">★</span>
                  )}
                </div>

                {/* Middle part in mobile (Texts) */}
                <div className="flex-1 min-w-0 pr-6 sm:pr-0">
                  <h3 className="font-hero text-sm sm:text-lg font-bold text-obsidian mb-0.5 whitespace-normal break-words">
                    {product.name}
                  </h3>
                  <p className="font-tag text-[9px] sm:text-[10px] font-bold text-[#8C8A87] mb-1 sm:mb-3 uppercase tracking-wider truncate">
                    {product.sub}
                  </p>
                  <p className="font-sans text-xs text-[#5F5B57] hidden sm:block mb-6 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Price directly below title in mobile */}
                  <div className="sm:hidden">
                    <span className="font-tag text-xs font-bold text-blaze-orange italic">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                {/* Footer (for Desktop) */}
                <div className="hidden sm:flex items-center justify-between pt-4 border-t-2 border-dashed border-[#dfc0b3] w-full">
                  <div>
                    <span className="font-tag text-[9px] font-bold text-[#8C8A87] block uppercase">Harga Mulai</span>
                    <span className="font-tag text-lg font-bold text-blaze-orange italic">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                    className="btn-liquid btn-liquid-white w-10 h-10 rounded-xl bg-obsidian text-white border-2 border-obsidian flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#FF7A30]"
                    style={{ willChange: 'transform' }}
                    title="Tambah ke Keranjang"
                  >
                    <Plus className="w-5 h-5 stroke-[3] relative z-10" />
                  </button>
                </div>

                {/* Mobile Add to Cart Button */}
                <div className="sm:hidden shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                    className="btn-liquid btn-liquid-white w-9 h-9 rounded-lg bg-obsidian text-white border-2 border-obsidian flex items-center justify-center cursor-pointer shadow-[1.5px_1.5px_0px_0px_#FF7A30]"
                    style={{ willChange: 'transform' }}
                    title="Tambah ke Keranjang"
                  >
                    <Plus className="w-4 h-4 stroke-[3] relative z-10" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* See All Button - Visible on both Mobile & Desktop */}
        <div className="mt-12 text-center select-none">
          <a
            href="/produk"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/produk');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="btn-liquid btn-liquid-orange inline-block px-10 py-4 bg-blaze-orange text-white rounded-full font-tag text-xs font-bold tracking-wider uppercase border-2 border-obsidian shadow-[4px_4px_0px_0px_#1C1E1C] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1C1E1C] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1C1E1C] transition-all duration-150"
          >
            <span className="relative z-10">LIHAT SEMUA</span>
          </a>
        </div>

        {/* Business Custom & Reseller Order Section */}
        <div className="mt-20 relative">
          <div className="bg-[#ffecc9] p-8 md:p-12 rounded-[40px_20px_40px_20px] border-3 border-obsidian shadow-[8px_8px_0px_0px_#1C1E1C] flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">

            {/* Background design accents */}
            <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-[#fcdfa6] rounded-full opacity-30 pointer-events-none" />

            <div className="flex flex-col gap-3 max-w-2xl text-center lg:text-left z-10">
              <span className="inline-block self-center lg:self-start bg-blaze-orange text-white font-tag text-[10px] font-bold px-3 py-1 rounded border-2 border-obsidian uppercase tracking-wider shadow-[2px_2px_0px_0px_#1C1E1C] -rotate-2">
                RESELLER & CORPORATE
              </span>
              <h3 className="animate-pop-in font-hero text-2xl sm:text-3xl font-bold text-obsidian tracking-tight uppercase mt-2">
                KUSTOM ORDER & KEBUTUHAN BISNIS
              </h3>
              <p className="animate-pop-in font-sans text-sm md:text-base text-[#5F5B57] leading-relaxed">
                Butuh akun digital dalam jumlah besar (*bulk*) untuk kebutuhan kantor, tim bisnis, reseller, atau ingin mengajukan kustom lisensi lainnya? Kami berikan penawaran harga spesial termurah!
              </p>
            </div>

            <button
              onClick={handleBusinessWhatsApp}
              className="btn-liquid btn-liquid-obsidian px-8.5 py-4.5 bg-obsidian text-white rounded-full font-tag text-xs font-bold tracking-wider flex items-center gap-3.5 group cursor-pointer shadow-[4px_4px_0px_0px_#FF7A30] border-2 border-obsidian z-10 shrink-0"
            >
              <span className="relative z-10 flex items-center gap-3.5">
                <span>HUBUNGI ADMIN BISNIS</span>
                <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
