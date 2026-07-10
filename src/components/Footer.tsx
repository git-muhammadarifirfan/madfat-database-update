import React from 'react';
import { Instagram, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onDirectWhatsApp: () => void;
  onCartOpen: () => void;
}

export default function Footer({ onDirectWhatsApp, onCartOpen }: FooterProps) {
  return (
    <footer className="bg-[#fff8f2] border-t border-[#e8ddd2] pt-8 md:pt-16 pb-6 md:pb-10" id="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 md:mb-16">
        
        {/* Col 1: Brand details */}
        <div className="space-y-4">
          <span className="font-hero text-2xl font-extrabold text-blaze-orange italic block">
            Madfat
          </span>
          <p className="font-sans text-xs text-on-surface-variant/60 leading-relaxed max-w-xs">
            Partner solusi digital terpercaya untuk segala kebutuhan hiburan dan pengembangan bisnis Anda di Indonesia.
          </p>
          <div className="flex gap-3 pt-3">
            <a 
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-obsidian/20 rounded-full flex items-center justify-center hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-colors text-obsidian"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="mailto:admin@madfat.co"
              className="w-10 h-10 border border-obsidian/20 rounded-full flex items-center justify-center hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-colors text-obsidian"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <button 
              onClick={onDirectWhatsApp}
              className="w-10 h-10 border border-obsidian/20 rounded-full flex items-center justify-center hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-colors cursor-pointer bg-transparent text-obsidian"
              aria-label="WhatsApp Admin"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Col 2: Akun Digital */}
        <div className="hidden md:block">
          <h4 className="font-hero text-sm font-bold text-obsidian mb-4 tracking-wider uppercase">
            AKUN DIGITAL
          </h4>
          <ul className="space-y-2.5 font-sans text-xs text-on-surface-variant/60">
            <li><a href="#digital" className="hover:text-blaze-orange transition-colors">Netflix Premium</a></li>
            <li><a href="#digital" className="hover:text-blaze-orange transition-colors">Spotify Family</a></li>
            <li><a href="#digital" className="hover:text-blaze-orange transition-colors">Youtube Premium</a></li>
            <li><a href="#digital" className="hover:text-blaze-orange transition-colors">Discord Nitro</a></li>
            <li><a href="#digital" className="hover:text-blaze-orange transition-colors">Canva Pro</a></li>
          </ul>
        </div>

        {/* Col 3: Jasa Website */}
        <div className="hidden md:block">
          <h4 className="font-hero text-sm font-bold text-obsidian mb-4 tracking-wider uppercase">
            JASA WEBSITE
          </h4>
          <ul className="space-y-2.5 font-sans text-xs text-on-surface-variant/60">
            <li><a href="#website" className="hover:text-blaze-orange transition-colors">Starter Web</a></li>
            <li><a href="#website" className="hover:text-blaze-orange transition-colors">Pro Web</a></li>
            <li><a href="#website" className="hover:text-blaze-orange transition-colors">Business Web</a></li>
            <li><a href="#website" className="hover:text-blaze-orange transition-colors">Custom App</a></li>
            <li><a href="#website" className="hover:text-blaze-orange transition-colors">UI/UX Design</a></li>
          </ul>
        </div>

        {/* Col 4: Support */}
        <div className="block">
          <h4 className="font-hero text-sm font-bold text-obsidian mb-4 tracking-wider uppercase">
            SUPPORT
          </h4>
          <ul className="space-y-2.5 font-sans text-xs text-on-surface-variant/60">
            <li>
              <a
                href="/syarat-ketentuan"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/syarat-ketentuan');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-blaze-orange transition-colors"
              >
                Syarat & Ketentuan
              </a>
            </li>
            <li>
              <a
                href="/kebijakan-privasi"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/kebijakan-privasi');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-blaze-orange transition-colors"
              >
                Kebijakan Privasi
              </a>
            </li>
            <li>
              <button onClick={onDirectWhatsApp} className="hover:text-blaze-orange transition-colors text-left cursor-pointer bg-transparent border-none p-0 outline-none">
                Hubungi Kami
              </button>
            </li>
            <li>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.querySelector('#faq');
                  const globalLenis = (window as any).lenis;
                  if (target) {
                    if (window.location.pathname !== '/') {
                      window.history.pushState({}, '', '/#faq');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    } else if (globalLenis) {
                      globalLenis.scrollTo(target, { duration: 1.2 });
                    } else {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    window.history.pushState({}, '', '/#faq');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="hover:text-blaze-orange transition-colors"
              >
                Bantuan/FAQ
              </a>
            </li>
            <li>
              <button onClick={onCartOpen} className="hover:text-blaze-orange transition-colors text-left cursor-pointer bg-transparent border-none p-0 outline-none">
                Cek Status Order
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Credits */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-obsidian/10 flex flex-col sm:flex-row justify-center items-center gap-4 text-[11px] text-on-surface-variant/40 font-medium">
        <span>
          &copy; {new Date().getFullYear()} Madfat. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
