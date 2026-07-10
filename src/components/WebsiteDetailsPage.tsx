import React, { useEffect, useRef } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { gsap } from 'gsap';
import { WebsitePackage } from '../types';

interface WebsiteDetailsPageProps {
  websitePackages: WebsitePackage[];
  onAddToCart: (pack: WebsitePackage) => void;
  formatPrice: (value: number) => string;
}

export default function WebsiteDetailsPage({
  websitePackages,
  onAddToCart,
  formatPrice
}: WebsiteDetailsPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentTargetScrollRef = useRef<number | null>(null);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Synchronously set initial hidden state to prevent any paint flash
      gsap.set('.page-pop-btn', { opacity: 0, y: 15 });
      gsap.set('.page-header-title', { y: 40, scale: 0, opacity: 0, rotate: -6 });
      gsap.set('.page-header-desc', { scale: 0, opacity: 0 });
      gsap.set('.subpage-card', { opacity: 0, y: 35, scale: 0.95 });

      // 1. Back button pop-in
      gsap.to('.page-pop-btn', {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.25
      });

      // 2. Header text bouncy pop-in
      gsap.to('.page-header-title', {
        y: 0,
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 0.65,
        ease: 'back.out(2.2)',
        delay: 0.3,
        transformOrigin: 'left center'
      });

      gsap.to('.page-header-desc', {
        scale: 1,
        opacity: 1,
        duration: 0.55,
        ease: 'back.out(1.5)',
        delay: 0.4,
        transformOrigin: 'left center'
      });

      // 3. Cards pop-in staggered delay
      gsap.to('.subpage-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.5,
        clearProps: 'transform,y,scale'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getProfessionalFeatures = (pkgId: string) => {
    switch (pkgId) {
      case 'bundle-a':
        return [
          '1 Halaman Utama (Landing Page)',
          'Desain Responsif & Mobile-Friendly',
          'Integrasi Kontak WhatsApp Direct',
          'Hosting & Subdomain Netlify Gratis'
        ];
      case 'bundle-b':
        return [
          'Etalase Produk (5-30 Item)',
          'Sistem Checkout Langsung ke WhatsApp',
          'Gratis Domain (.com/.id) 1 Tahun',
          'Setup SEO Basic & Google Indexing'
        ];
      case 'bundle-c':
        return [
          'Website Company Profile Multi-Halaman',
          'Integrasi Database Klien / Formulir',
          'Gratis Domain & Hosting Premium 1 Tahun',
          'Dukungan Pemeliharaan Sistem 6 Bulan'
        ];
      case 'bundle-d':
        return [
          'Sistem POS Web Kasir & Inventaris',
          'Manajemen Autentikasi Pengguna & Staff',
          'Fitur Ekspor Laporan Finansial (PDF/Excel)',
          'Cloud VPS Hosting & Garansi Sistem 1 Tahun'
        ];
      case 'bundle-e':
      default:
        return [
          'Arsitektur Custom (React / Next.js)',
          'Integrasi API Pihak Ketiga & Payment Gateway',
          'Optimasi Keamanan & Performa Tinggi',
          'Dedicated Server Setup (AWS / DigitalOcean)'
        ];
    }
  };

  return (
    <div ref={containerRef} className="bg-[#fff8f2] min-h-screen pt-28 pb-10 md:pt-36 md:pb-16 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        <div className="mb-4 md:mb-6 page-pop-btn">
          <a
            href="/"
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-obsidian rounded-xl bg-white text-obsidian hover:bg-[#FF7A30] hover:text-white transition-colors duration-200 shadow-[3px_3px_0px_0px_#1C1E1C] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1C1E1C] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1C1E1C] font-tag text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Kembali Ke Beranda</span>
          </a>
        </div>

        {/* Page Header */}
        <div className="mb-8 md:mb-10 text-center max-w-3xl mx-auto">
          <h1 className="page-header-title font-hero text-4xl sm:text-5xl md:text-6xl font-bold text-obsidian tracking-tight uppercase mb-2 md:mb-3">
            DETAIL LAYANAN <span className="text-blaze-orange">WEBSITE.</span>
          </h1>
          <p className="page-header-desc font-sans text-xs sm:text-sm md:text-base text-[#5F5B57] max-w-xl mx-auto">
            Kami membangun platform digital berorientasi hasil yang dirancang khusus untuk meningkatkan performa bisnis dan efisiensi operasional Anda.
          </p>
        </div>

        {/* System Functionality Highlights Section */}
        <div className="mb-10 border-b-2 border-dashed border-obsidian/20 pb-6 md:pb-8 select-none subpage-card">
          <div className="text-center md:text-left mb-4 md:mb-6">
            <span className="font-tag text-sm sm:text-lg font-black uppercase text-blaze-orange tracking-wide block mb-1">
              KEAHLIAN SISTEM KAMI
            </span>
            <h2 className="font-hero text-2xl sm:text-3xl font-extrabold uppercase text-obsidian mt-1">
              PENGEMBANGAN SISTEM DAN FUNGSI UTAMA BISNIS.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#5F5B57] mt-1 max-w-2xl">
              Fokus utama kami adalah membangun fungsionalitas sistem yang tangguh untuk membantu mengotomatisasi proses bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
            <div className="flex gap-4">
              <span className="font-hero text-4xl font-black text-blaze-orange/30 shrink-0">01</span>
              <div>
                <h4 className="font-hero text-sm font-bold text-obsidian uppercase mb-1">Sistem POS & Manajemen Inventaris</h4>
                <p className="font-sans text-xs text-[#5F5B57] leading-relaxed">
                  Pantau stok barang, kelola transaksi kasir secara real-time, dan ekspor data laporan keuangan langsung dari dashboard admin yang responsif.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="font-hero text-4xl font-black text-blaze-orange/30 shrink-0">02</span>
              <div>
                <h4 className="font-hero text-sm font-bold text-obsidian uppercase mb-1">Sistem Reservasi & Penjadwalan Mandiri</h4>
                <p className="font-sans text-xs text-[#5F5B57] leading-relaxed">
                  Otomatisasi proses booking jasa dan penjadwalan layanan untuk klien Anda dengan integrasi notifikasi konfirmasi langsung.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="font-hero text-4xl font-black text-blaze-orange/30 shrink-0">03</span>
              <div>
                <h4 className="font-hero text-sm font-bold text-obsidian uppercase mb-1">Company Profile & Kredibilitas Korporasi</h4>
                <p className="font-sans text-xs text-[#5F5B57] leading-relaxed">
                  Presentasikan profil perusahaan, struktur organisasi, and portofolio proyek secara profesional untuk meningkatkan konversi prospek bisnis B2B.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="font-hero text-4xl font-black text-blaze-orange/30 shrink-0">04</span>
              <div>
                <h4 className="font-hero text-sm font-bold text-obsidian uppercase mb-1">E-Commerce & Transaksi WhatsApp</h4>
                <p className="font-sans text-xs text-[#5F5B57] leading-relaxed">
                  Katalog produk dinamis dengan sistem keranjang belanja yang memudahkan pembeli mengirimkan detail pesanan terformat langsung ke nomor WhatsApp admin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing/Package Heading */}
        <h2 className="animate-pop-in font-hero text-center text-xl sm:text-2xl font-bold mb-3 md:mb-4 text-obsidian uppercase tracking-wide">
          PILIH TINGKATAN <span className="text-blaze-orange">PAKET ANDA.</span>
        </h2>

        {/* Mobile Navigation Arrows */}
        <div className="flex md:hidden justify-center gap-3 mb-4 select-none">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-full border-2 border-obsidian bg-white text-obsidian flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_#FF7A30] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#FF7A30] cursor-pointer"
          >
            ←
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-full border-2 border-obsidian bg-white text-obsidian flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_#FF7A30] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#FF7A30] cursor-pointer"
          >
            →
          </button>
        </div>

        {/* Compact Package Cards Grid */}
        <div ref={scrollContainerRef} className="flex flex-row md:flex-wrap md:justify-center overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-6 px-4 -mx-4 md:mx-auto md:px-0 gap-6 md:max-w-[920px]">
          {websitePackages.filter(pkg => !pkg.isOutOfStock).map((pkg, i) => {
            const isOrange = i % 2 === 0;
            const displayTitle = pkg.name.includes(':') ? pkg.name.split(':')[1].trim() : pkg.name;
            return (
              <div
                key={pkg.id}
                className={`subpage-card flex-shrink-0 w-[70vw] sm:w-[280px] snap-center min-h-[430px] sm:min-h-[460px] py-6 px-5 sm:py-8 sm:px-6 rounded-[24px] sm:rounded-[32px] border-2 flex flex-col justify-between relative cursor-default select-none transition-all duration-300 ${
                  isOrange
                    ? 'bg-[#FF7A30] border-obsidian text-white shadow-[5px_5px_0px_0px_#ffffff]'
                    : 'bg-white border-obsidian text-obsidian shadow-[5px_5px_0px_0px_#FF7A30]'
                }`}
                style={{ willChange: 'transform' }}
              >
                {pkg.isFeatured && (
                  <span className="absolute top-3.5 right-3.5 bg-[#FF7A30] text-white font-tag text-[8px] font-bold px-2 py-0.5 rounded border border-obsidian uppercase tracking-wider">
                    {pkg.badge || 'POPULER'}
                  </span>
                )}

                <div>
                  <span
                    className={`block font-tag text-[9px] font-bold uppercase tracking-widest mb-1.5 ${
                      isOrange ? 'text-[#fff2de]/80' : 'text-[#8C8A87]'
                    }`}
                  >
                    {pkg.categoryName}
                  </span>

                  <h4
                    className={`font-hero text-xl font-bold tracking-tight mb-2 uppercase border-b pb-1.5 ${
                      isOrange ? 'text-white border-white/20' : 'text-obsidian border-obsidian/10'
                    }`}
                  >
                    {displayTitle.replace('WEB', '').replace('BUSINESS', '').trim()}
                  </h4>

                  <p
                    className={`font-sans text-[11px] leading-relaxed mb-3 sm:mb-4 min-h-[30px] sm:min-h-[40px] ${
                      isOrange ? 'text-[#fff8f2]/95' : 'text-[#5F5B57]'
                    }`}
                  >
                    {pkg.sub}
                  </p>

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

        {/* Custom Website Callout (Simplified: No container card box, clean hero styling, white button) */}
        <div className="mt-8 md:mt-12 text-center select-none subpage-card max-w-2xl mx-auto border-t border-dashed border-obsidian/20 pt-6 md:pt-10">
          <span className="font-tag text-sm sm:text-lg font-black uppercase text-blaze-orange tracking-wide block mb-1">
            SOLUSI ENTERPRISE / CUSTOM
          </span>
          <h3 className="font-hero text-2xl sm:text-3xl font-black uppercase text-obsidian mt-1 mb-2 tracking-tight">
            BUTUH CUSTOM WEBSITE ATAU SISTEM KHUSUS?
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#5F5B57] leading-relaxed mb-6">
            Kami siap merancang dan mendevelop sistem kustom (seperti dashboard internal, integrasi API perbankan/payment gateway, hingga modul khusus) yang disesuaikan penuh dengan workflow bisnis Anda.
          </p>
          <button
            onClick={() => {
              const adminWhatsAppNumber = '6289672300222';
              const message = 'Halo Admin Madfat! Saya ingin berkonsultasi mengenai pembuatan website dengan fitur dan sistem kustom khusus.';
              window.open(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="btn-liquid btn-liquid-white px-8 py-3.5 bg-white text-obsidian rounded-full font-tag text-xs font-black tracking-wider border-2 border-obsidian shadow-[3px_3px_0px_0px_#1C1E1C] cursor-pointer uppercase"
          >
            <span className="relative z-10 text-obsidian">KONSULTASI SEKARANG</span>
          </button>
        </div>

        {/* Simple Website FAQ Section (Simplified: Flat layout, no background card box) */}
        <div className="mt-8 md:mt-12 select-none subpage-card max-w-4xl mx-auto border-t border-dashed border-obsidian/20 pt-6 md:pt-10">
          <h3 className="font-hero text-xl sm:text-2xl font-black text-obsidian uppercase mb-6 tracking-wide text-center">
            TANYA JAWAB LENGKAP & DETAIL
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 font-sans text-xs sm:text-sm">
            <div>
              <h4 className="font-hero font-bold text-obsidian uppercase mb-1">Q: Berapa lama waktu pengerjaan website?</h4>
              <p className="text-[#5F5B57] leading-relaxed">
                Estimasi pengerjaan berkisar antara 3 hingga 14 hari kerja setelah semua aset dan berkas konten kami terima, tergantung kompleksitas sistem paket pilihan Anda.
              </p>
            </div>
            <div>
              <h4 className="font-hero font-bold text-obsidian uppercase mb-1">Q: Apakah harga sudah termasuk biaya hosting & domain?</h4>
              <p className="text-[#5F5B57] leading-relaxed">
                Ya, seluruh paket (kecuali Basic) sudah menyertakan pendaftaran domain premium (.com/.id) serta setup cloud server/hosting berkinerja tinggi gratis untuk tahun pertama.
              </p>
            </div>
            <div>
              <h4 className="font-hero font-bold text-obsidian uppercase mb-1">Q: Apakah sistem web yang dibuat aman?</h4>
              <p className="text-[#5F5B57] leading-relaxed">
                Kami menerapkan standar pengamanan modern, autentikasi terenkripsi untuk staff admin, dan backup basis data berkala untuk mencegah kebocoran data.
              </p>
            </div>
            <div>
              <h4 className="font-hero font-bold text-obsidian uppercase mb-1">Q: Bagaimana jika terjadi kendala pasca perilisan?</h4>
              <p className="text-[#5F5B57] leading-relaxed">
                Kami menyediakan garansi pemeliharaan sistem terdedikasi untuk memastikan sistem Anda berjalan optimal tanpa gangguan bug atau downtime.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-12 text-center subpage-card">
          <a
            href="/"
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 font-tag text-xs font-bold text-blaze-orange hover:text-obsidian transition-colors uppercase"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Kembali Ke Beranda</span>
          </a>
        </div>

      </div>
    </div>
  );
}
