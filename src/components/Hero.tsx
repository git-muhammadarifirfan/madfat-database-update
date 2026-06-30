import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import mascot from '../mascot.svg';
import OptimizedImage from './OptimizedImage';
import { gsap } from 'gsap';
import { DigitalProduct } from '../types';

interface HeroProps {
  onDirectWhatsApp: () => void;
  products: DigitalProduct[];
}

function Hero({ onDirectWhatsApp, products }: HeroProps) {
  const [ratingVal, setRatingVal] = useState(0);
  const [clientCount, setClientCount] = useState(0);

  // Helper to format price to Rupiah
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const spotifyProduct = products.find(p => p.id === 'prod-002' || p.id === 'spotify' || p.name.toLowerCase().includes('spotify')) || { name: 'Spotify Family', sub: 'Individual Plan 12 Bulan', price: 45000, image: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' };
  const netflixProduct = products.find(p => p.id === 'prod-001' || p.id === 'netflix' || p.name.toLowerCase().includes('netflix')) || { name: 'Netflix Premium', sub: 'UHD 4K + Anti Screen Limit', price: 35000, image: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg' };
  const aiProduct = products.find(p => p.id === 'prod-016' || p.id === 'chatgpt-plus' || p.category === 'education' || p.category === 'cat-003' || p.id.toLowerCase().includes('chatgpt') || p.name.toLowerCase().includes('chatgpt') || p.id.toLowerCase().includes('canva') || p.name.toLowerCase().includes('canva')) || { name: 'ChatGPT Plus', sub: 'Shared / 30 Hari Aktif', price: 110000, image: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg' };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.65 }
      });

      // Mascot cartoon pop from bottom center
      tl.fromTo('.hero-mascot',
        { scale: 0, opacity: 0, y: 80 },
        { scale: 1, opacity: 0.95, y: 0, duration: 0.8, ease: 'back.out(1.5)', transformOrigin: 'center bottom' }
      );

      // Cartoon pop-in bounce for the title lines
      tl.fromTo('.hero-title-line', 
        { y: 40, scale: 0, opacity: 0, rotate: -6 },
        { y: 0, scale: 1, opacity: 1, rotate: 0, stagger: 0.1, duration: 0.7, ease: 'back.out(2.2)', transformOrigin: 'left center' },
        '-=0.7'
      );

      // Description pop-in
      tl.fromTo('.hero-desc',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', transformOrigin: 'center center' },
        '-=0.55'
      );

      // Buttons pop-in matching the title lines entry style
      tl.fromTo('.hero-btn',
        { y: 40, scale: 0, opacity: 0, rotate: -6 },
        { y: 0, scale: 1, opacity: 1, rotate: 0, stagger: 0.08, duration: 0.7, ease: 'back.out(2.2)', transformOrigin: 'center center' },
        '-=0.5'
      );

      // Pop in customer avatars
      tl.fromTo('.hero-avatar',
        { scale: 0, x: -15, opacity: 0 },
        { scale: 1, x: 0, opacity: 1, stagger: 0.08, duration: 0.55, ease: 'back.out(2.0)' },
        '-=0.45'
      );

      // Stagger light/pop-in stars from left to right
      tl.fromTo('.hero-proof-star',
        { scale: 0, rotate: -35 },
        { scale: 1, rotate: 0, stagger: 0.08, duration: 0.5, ease: 'back.out(2.5)' },
        '-=0.35'
      );

      // Pop in the rating text
      tl.fromTo('.hero-proof-text',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.8)', transformOrigin: 'left center' },
        '-=0.3'
      );

      // Playful bouncy pop-in for the cards
      tl.fromTo('.hero-card-spotify',
        { scale: 0, rotate: -25, opacity: 0, y: 50 },
        { scale: 1, rotate: 6, opacity: 1, y: 0, ease: 'back.out(2.0)', duration: 0.75, transformOrigin: 'center center' },
        '-=0.55'
      );

      // Playful bouncy pop-in for the cards
      tl.fromTo('.hero-card-netflix',
        { scale: 0, rotate: 25, opacity: 0, y: -50 },
        { scale: 1, rotate: 12, opacity: 1, y: 0, ease: 'back.out(2.0)', duration: 0.75, transformOrigin: 'center center' },
        '-=0.65'
      );

      tl.fromTo('.hero-card-disney',
        { scale: 0, rotate: -20, opacity: 0, y: 60 },
        { scale: 1, rotate: 12, opacity: 1, y: 0, ease: 'back.out(2.0)', duration: 0.75, transformOrigin: 'center center' },
        '-=0.65'
      );

      // Count up rating and clients
      const numberObj = { rating: 0, clients: 0 };
      gsap.to(numberObj, {
        rating: 4.9,
        clients: 89,
        duration: 1.6,
        ease: 'power2.out',
        delay: 0.4,
        onUpdate: () => {
          setRatingVal(parseFloat(numberObj.rating.toFixed(1)));
          setClientCount(Math.floor(numberObj.clients));
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const handleCardHover = (element: HTMLDivElement, initialRotate: number) => {
    gsap.to(element, {
      scale: 1.05,
      rotate: initialRotate + 2,
      zIndex: 40,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleCardReset = (element: HTMLDivElement, initialRotate: number, initialZIndex: number) => {
    gsap.to(element, {
      scale: 1,
      rotate: initialRotate,
      zIndex: initialZIndex,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  return (
    <header className="relative min-h-screen flex items-center pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto" id="home">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">

        {/* Hero Left Content */}
        <div className="lg:col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left z-10">
          <h1 className="font-bricolage font-black text-obsidian tracking-tighter leading-[0.95] text-[54px] sm:text-[76px] md:text-[94px] lg:text-[110px] uppercase mb-6">
            <span className="hero-title-line inline-block whitespace-nowrap">AKUN DIGITAL,</span> <br />
            <span className="hero-title-line inline-block text-blaze-orange tracking-normal text-[36px] sm:text-[52px] md:text-[64px] lg:text-[72px] mt-2">HARGA MURAH.</span>
          </h1>

          <p className="hero-desc font-sans text-lg md:text-xl text-[#5F5B57] max-w-2xl mb-10 leading-relaxed">
            Nikmati layanan premium favoritmu tanpa kuras kantong. Dari streaming film hingga pengembangan website profesional, kami siap membantu pertumbuhan digitalmu dengan cepat and aman.
          </p>

          <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
            <div className="hero-btn">
              <a
                href="#digital"
                className="btn-liquid btn-liquid-orange inline-block px-10 py-4 bg-blaze-orange text-white rounded-full font-tag text-sm font-bold tracking-wider shadow-[4px_4px_0px_0px_#1C1E1C] border-2 border-obsidian hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1C1E1C] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1C1E1C] transition-[transform,box-shadow] duration-150 cursor-pointer text-center"
              >
                <span className="relative z-10">LIHAT KATALOG</span>
              </a>
            </div>
            <div className="hero-btn">
              <button
                onClick={onDirectWhatsApp}
                className="btn-liquid btn-liquid-white px-10 py-4 bg-white border-2 border-obsidian text-obsidian rounded-full font-tag text-sm font-bold tracking-wider shadow-[4px_4px_0px_0px_#1C1E1C] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1C1E1C] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1C1E1C] transition-[transform,box-shadow] duration-150 cursor-pointer text-center"
              >
                <span className="relative z-10">HUBUNGI ADMIN</span>
              </button>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-14 flex items-center justify-center lg:justify-start gap-3.5 select-none w-full">
            <div className="flex -space-x-3.5">
              <div className="hero-avatar w-[38px] h-[38px] rounded-full border-2 border-obsidian overflow-hidden bg-[#FEDCC6]">
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=120&h=120"
                  alt="Customer-1"
                  width={38}
                  height={38}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hero-avatar w-[38px] h-[38px] rounded-full border-2 border-obsidian overflow-hidden bg-[#FEDCC6]">
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=120&h=120"
                  alt="Customer-2"
                  width={38}
                  height={38}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hero-avatar w-[38px] h-[38px] rounded-full border-2 border-obsidian bg-[#1C1E1C] text-white flex items-center justify-center font-tag text-[10px] font-bold italic tracking-tighter">
                +1k
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-start">
              <div className="flex text-blaze-orange gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="hero-proof-star w-4 h-4 fill-current text-blaze-orange" />
                ))}
              </div>
              <p className="hero-proof-text font-tag text-xs font-bold uppercase text-[#8C8A87] tracking-wider mt-1">
                {ratingVal.toFixed(1)} Stars dari {clientCount}+ Klien
              </p>
            </div>
          </div>
        </div>

        {/* Hero Right Visuals - Stacked Cartoon Cards */}
        <div className="lg:col-span-6 relative h-[340px] sm:h-[450px] lg:h-[550px] w-full select-none z-0 mt-8 lg:mt-0 flex items-center justify-center lg:justify-end lg:pr-6">
          <div className="relative w-[380px] h-[450px] origin-center scale-[0.65] sm:scale-[0.85] lg:scale-100 translate-x-[40px] lg:translate-x-0 transition-all duration-200">
            {/* Mascot Image Behind Cards */}
            <img
              src={mascot}
              alt="Madfat Mascot"
              className="hero-mascot hidden lg:block absolute -top-[200px] -left-[400px] w-[900px] h-[900px] max-w-none object-contain z-0 pointer-events-none opacity-90 border-0 outline-none"
            />

            {/* Spotify card - Left & Behind */}
            <div
              className="hero-card-spotify absolute top-[130px] left-[-110px] w-[260px] p-6 bg-[#1C1E1C] text-white rounded-3xl border-2 border-obsidian shadow-[8px_8px_0px_0px_#FF7A30] cursor-pointer"
              style={{ transform: 'rotate(6deg)', zIndex: 10, willChange: 'transform' }}
              onMouseEnter={(e) => handleCardHover(e.currentTarget, 6)}
              onMouseLeave={(e) => handleCardReset(e.currentTarget, 6, 10)}
            >
              {/* Spotify Logo Space - Circular Spotify Green */}
              <div className="w-[52px] h-[52px] bg-[#1C1E1C] border-2 border-obsidian rounded-full mb-5 flex items-center justify-center overflow-hidden">
                <img
                  src={spotifyProduct.image || "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"}
                  alt={spotifyProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-hero text-lg font-normal text-white mb-0.5">{spotifyProduct.name}</h3>
              <p className="font-sans text-xs text-[#A0A0A0] mb-4 leading-tight">{spotifyProduct.sub}</p>
              <span className="font-bricolage text-[#FF7A30] text-xl font-normal">{formatPrice(spotifyProduct.price)}</span>
            </div>

            {/* Netflix card - Top & Right */}
            <div
              className="hero-card-netflix absolute top-[10px] right-[-30px] w-[260px] p-6 bg-white rounded-3xl border-2 border-obsidian shadow-[8px_8px_0px_0px_#FF7A30] cursor-pointer"
              style={{ transform: 'rotate(12deg)', zIndex: 30, willChange: 'transform' }}
              onMouseEnter={(e) => handleCardHover(e.currentTarget, 12)}
              onMouseLeave={(e) => handleCardReset(e.currentTarget, 12, 30)}
            >
              {/* Netflix Logo Space - Netflix Red */}
              <div className="w-[52px] h-[52px] bg-[#1C1E1C] border-2 border-obsidian rounded-full mb-5 flex items-center justify-center overflow-hidden">
                <img
                  src={netflixProduct.image || "https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg"}
                  alt={netflixProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-hero text-lg font-normal text-obsidian mb-0.5">{netflixProduct.name}</h3>
              <p className="font-sans text-xs text-[#8C8A87] mb-4 leading-tight">{netflixProduct.sub}</p>
              <span className="font-bricolage text-[#FF7A30] text-xl font-normal">{formatPrice(netflixProduct.price)}</span>
            </div>

            {/* AI card (ChatGPT/Canva) - Bottom & Middle */}
            <div
              className="hero-card-disney absolute top-[260px] left-[20px] w-[260px] p-6 bg-white rounded-3xl border-2 border-obsidian shadow-[8px_8px_0px_0px_#FF7A30] cursor-pointer"
              style={{ transform: 'rotate(12deg)', zIndex: 20, willChange: 'transform' }}
              onMouseEnter={(e) => handleCardHover(e.currentTarget, 12)}
              onMouseLeave={(e) => handleCardReset(e.currentTarget, 12, 20)}
            >
              {/* AI Logo Space */}
              <div className="w-[52px] h-[52px] bg-[#10a37f] border-2 border-obsidian rounded-full mb-5 flex items-center justify-center overflow-hidden">
                <img
                  src={aiProduct.image || "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"}
                  alt={aiProduct.name}
                  className="w-full h-full object-cover animate-spin-slow"
                />
              </div>
              <h3 className="font-hero text-lg font-normal text-obsidian mb-0.5">{aiProduct.name}</h3>
              <p className="font-sans text-xs text-[#8C8A87] mb-4 leading-tight">{aiProduct.sub}</p>
              <span className="font-bricolage text-[#FF7A30] text-xl font-normal">{formatPrice(aiProduct.price)}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

export default React.memo(Hero);
