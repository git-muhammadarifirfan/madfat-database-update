import React, { useState, useEffect, useRef } from 'react';
import { Plus, Tv, Music, Gamepad, GraduationCap, Sparkles, ArrowLeft, Search } from 'lucide-react';
import { gsap } from 'gsap';
import { DigitalProduct, Category } from '../types';

interface DigitalProductPageProps {
  products: DigitalProduct[];
  categories: Category[];
  onAddToCart: (product: DigitalProduct) => void;
  formatPrice: (value: number) => string;
}

export default function DigitalProductPage({
  products,
  categories,
  onAddToCart,
  formatPrice
}: DigitalProductPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Synchronously hide elements immediately to prevent FOUC (flash of unstyled content)
      gsap.set('.page-pop-btn', { opacity: 0, y: 15 });
      gsap.set('.page-header-title', { y: 40, scale: 0, opacity: 0, rotate: -6 });
      gsap.set('.page-header-desc', { scale: 0, opacity: 0 });
      gsap.set('.subpage-filter-button', { opacity: 0, y: 15, scale: 0.95 });
      gsap.set('.page-search-input', { opacity: 0, y: 15, scale: 0.95 });
      gsap.set('.subpage-card', { opacity: 0, y: 35, scale: 0.95 });

      // 1. Back button slide up
      gsap.to('.page-pop-btn', {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.3
      });

      // 2. Header text bouncy pop-in (same style as hero)
      gsap.to('.page-header-title', {
        y: 0,
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 0.7,
        ease: 'back.out(2.2)',
        delay: 0.35,
        transformOrigin: 'left center'
      });

      gsap.to('.page-header-desc', {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(1.5)',
        delay: 0.45,
        transformOrigin: 'left center'
      });

      // 3. Filter category buttons pop in
      gsap.to(['.subpage-filter-button', '.page-search-input'], {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.55
      });

      // 4. Cards pop-in staggered delay (same as TimelineFlow alur pengerjaan)
      gsap.to('.subpage-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.65,
        clearProps: 'transform,y,scale'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const isMountedRef = useRef(false);

  const animateCards = () => {
    // Kill any running card animations first
    gsap.killTweensOf('.subpage-card');
    gsap.fromTo('.subpage-card',
      { opacity: 0, y: 22, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all'
      }
    );
  };

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    animateCards();
  }, [activeCategory]);

  // Re-animate cards when search query changes (debounced)
  const searchAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (searchAnimTimeoutRef.current) clearTimeout(searchAnimTimeoutRef.current);
    searchAnimTimeoutRef.current = setTimeout(() => {
      animateCards();
    }, 80);
    return () => {
      if (searchAnimTimeoutRef.current) clearTimeout(searchAnimTimeoutRef.current);
    };
  }, [searchQuery]);

  const filteredProducts = products.filter(p => {
    if (p.isOutOfStock) return false;
    const matchesCategory = activeCategory === 'all' || (() => {
      const cat = categories.find(c => c.id === activeCategory);
      if (!cat) return p.category === activeCategory;
      return p.category.toLowerCase() === cat.id.toLowerCase() ||
        p.category.toLowerCase() === cat.name.toLowerCase();
    })();
    // When searchQuery is empty, show all products regardless
    if (!searchQuery.trim()) return matchesCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCategories = categories.filter(cat => {
    return products.some(p => {
      if (p.isOutOfStock) return false;
      return p.category.toLowerCase() === cat.id.toLowerCase() ||
        p.category.toLowerCase() === cat.name.toLowerCase();
    });
  });

  const filterCategories = [
    { id: 'all', label: 'SEMUA' },
    ...activeCategories.slice(0, 8).map(c => ({ id: c.id, label: c.name.toUpperCase() }))
  ];

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div ref={containerRef} className="bg-[#fff8f2] min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Back Button */}
        <div className="mb-10 page-pop-btn" style={{ opacity: 0 }}>
          <a
            href="/"
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 font-tag text-xs font-bold text-blaze-orange hover:text-obsidian transition-colors uppercase"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Kembali Ke Beranda</span>
          </a>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="page-header-title font-hero text-4xl sm:text-5xl md:text-6xl font-bold text-obsidian tracking-tight uppercase mb-4" style={{ opacity: 0 }}>
            SEMUA AKUN <span className="text-blaze-orange">PREMIUM.</span>
          </h1>
          <p className="page-header-desc font-sans text-sm sm:text-base text-[#5F5B57] max-w-xl" style={{ opacity: 0 }}>
            Pilih dari seluruh daftar akun premium legal, proses aktivasi instan, dan garansi penuh sepanjang masa aktif.
          </p>
        </div>

        {/* Search and Filters Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 select-none">
          {/* Filter Categories */}
          <div className="flex flex-wrap gap-3 order-2 md:order-1">
            {filterCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`subpage-filter-button btn-liquid ${activeCategory === cat.id ? 'btn-liquid-orange bg-blaze-orange text-white' : 'btn-liquid-white bg-white text-obsidian'
                  } px-6 py-2.5 rounded-full border-2 border-obsidian font-tag text-xs font-bold transition-all shadow-[2px_2px_0px_0px_#1C1E1C] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#1C1E1C] cursor-pointer`}
                style={{ opacity: 0 }}
              >
                <span className="relative z-10">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 order-1 md:order-2 page-search-input" style={{ opacity: 0 }}>
            <input
              type="text"
              placeholder="Cari akun premium..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-obsidian rounded-full text-xs font-tag font-bold text-obsidian placeholder-gray-400 outline-none focus:border-blaze-orange transition-colors shadow-[2px_2px_0px_0px_#1C1E1C]"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian stroke-[3]" />
          </div>
        </div>

        {/* Grid Products - Full items */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#f5f0eb] border-2 border-obsidian rounded-2xl shadow-[5px_5px_0px_0px_#1C1E1C]">
            <p className="font-hero text-lg font-bold text-obsidian uppercase">Produk Tidak Ditemukan</p>
            <p className="font-sans text-xs text-[#5F5B57] mt-1">Coba cari kata kunci atau kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="subpage-card bg-[#f5f0eb] border-2 border-obsidian rounded-2xl shadow-[5px_5px_0px_0px_#1C1E1C] relative overflow-hidden flex flex-row sm:flex-col items-center sm:items-stretch justify-between p-3.5 sm:p-6 gap-3.5 sm:gap-6 flex select-none cursor-default"
                style={{ willChange: 'transform' }}
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
                    <span className="font-tag text-[9px] font-bold text-[#8C8A87] block uppercase">Harga</span>
                    <span className="font-tag text-lg font-bold text-blaze-orange italic">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                    className="btn-liquid btn-liquid-white w-10 h-10 rounded-xl bg-obsidian text-white border-2 border-obsidian flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#FF7A30]"
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
                    title="Tambah ke Keranjang"
                  >
                    <Plus className="w-4 h-4 stroke-[3] relative z-10" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
