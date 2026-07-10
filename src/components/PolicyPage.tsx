import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { gsap } from 'gsap';

interface PolicyPageProps {
  type: 'privacy' | 'terms';
}

export default function PolicyPage({ type }: PolicyPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.policy-pop-btn', { opacity: 0, y: 15 });
      gsap.set('.policy-title', { y: 40, scale: 0.95, opacity: 0 });
      gsap.set('.policy-content-card', { opacity: 0, y: 35 });

      gsap.to('.policy-pop-btn', {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.1
      });

      gsap.to('.policy-title', {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(1.5)',
        delay: 0.15
      });

      gsap.to('.policy-content-card', {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power2.out',
        delay: 0.25,
        clearProps: 'transform,y'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [type]);

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const isPrivacy = type === 'privacy';

  return (
    <div ref={containerRef} className="bg-[#fff8f2] min-h-screen pt-28 pb-10 md:pt-36 md:pb-16 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <div className="mb-6 md:mb-8 policy-pop-btn">
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
        <div className="mb-8 md:mb-12 text-center md:text-left policy-title">
          <h1 className="font-hero text-3xl sm:text-4xl md:text-5xl font-black text-obsidian tracking-tight uppercase mb-2">
            {isPrivacy ? (
              <>KEBIJAKAN <span className="text-blaze-orange">PRIVASI.</span></>
            ) : (
              <>SYARAT & <span className="text-blaze-orange">KETENTUAN.</span></>
            )}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#5F5B57] max-w-xl">
            {isPrivacy
              ? 'Kebijakan Privasi Madfat dalam melindungi data pribadi Anda.'
              : 'Syarat dan Ketentuan penggunaan layanan website madfat.site.'}
          </p>
        </div>

        {/* Content Card */}
        <div className="policy-content-card bg-white border-2 border-obsidian rounded-2xl p-6 sm:p-10 shadow-[5px_5px_0px_0px_#FF7A30] font-sans text-xs sm:text-sm text-[#1C1E1C] leading-relaxed">
          {isPrivacy ? (
            <div className="space-y-6">
              <div>
                <h2 className="font-hero text-lg sm:text-xl font-extrabold uppercase text-obsidian mb-2">Kebijakan Privasi Madfat</h2>
                <p>
                  Selamat datang di Madfat. Kami sangat menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga informasi Anda saat Anda mengunjungi dan melakukan pembelian produk digital di situs web kami <strong>madfat.site</strong>.
                </p>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">1. Informasi yang Kami Kumpulkan</h3>
                <p className="mb-2">Kami mengumpulkan informasi yang Anda berikan secara sukarela saat bertransaksi di website kami, meliputi:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Informasi Akun & Kontak:</strong> Nama lengkap, alamat email, dan nomor telepon.</li>
                  <li><strong>Informasi Transaksi:</strong> Detail produk digital yang Anda beli dan riwayat pembayaran.</li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">2. Bagaimana Kami Menggunakan Informasi Anda</h3>
                <p className="mb-2">Kami menggunakan data Anda secara terbatas hanya untuk keperluan operasional internal, yaitu:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Memproses transaksi dan mengirimkan akses unduhan atau lisensi produk digital langsung ke email Anda.</li>
                  <li>Memberikan layanan bantuan (customer support) jika Anda mengalami kendala saat mengakses produk.</li>
                  <li>Mengamankan akun Anda dan mencegah tindakan penipuan di website kami.</li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">3. Keamanan dan Penyimpanan Data</h3>
                <p>
                  Karena produk kami berbentuk digital, keamanan data akun dan akses Anda adalah prioritas kami. Kami menggunakan sistem enkripsi dan pengamanan teknis yang memadai untuk melindungi data Anda dari akses yang tidak sah, kebocoran, atau perubahan tanpa izin.
                </p>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">4. Pembagian Informasi dengan Pihak Ketiga</h3>
                <p>
                  Kami tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak luar untuk kepentingan pemasaran. Kami hanya membagikan data dengan mitra penyedia layanan pembayaran (payment gateway) pihak ketiga yang tepercaya guna memproses transaksi keuangan Anda secara aman.
                </p>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">5. Kebijakan Lapisan Non-Iklan</h3>
                <p>
                  Website Madfat tidak menggunakan platform iklan berbayar pihak ketiga (seperti Google Ads atau Meta Pixels) yang melacak perilaku penelusuran Anda untuk target pemasaran eksternal.
                </p>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">6. Hak Anda atas Data Pribadi</h3>
                <p className="mb-2">Sesuai dengan regulasi perlindungan data yang berlaku, Anda memiliki hak untuk:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Mengakses dan melihat informasi pribadi yang kami simpan.</li>
                  <li>Memperbarui atau memperbaiki data akun Anda jika ada kesalahan.</li>
                  <li>Meminta penghapusan akun dan data pribadi Anda dari sistem kami secara permanen.</li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">7. Perubahan Kebijakan</h3>
                <p>
                  Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu jika terdapat perubahan pada sistem operasional website kami. Setiap perubahan akan langsung dipublikasikan di halaman ini.
                </p>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">8. Kontak Kami</h3>
                <p className="mb-2">Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin mengajukan penghapusan data, silakan hubungi kami melalui:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email: <a href="mailto:hello@madfat.site" className="text-blaze-orange hover:underline font-bold">hello@madfat.site</a></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="font-hero text-lg sm:text-xl font-extrabold uppercase text-obsidian mb-2">Syarat dan Ketentuan Madfat</h2>
                <p>
                  Selamat datang di Madfat. Dengan mengakses dan melakukan pembelian di website kami <strong>madfat.site</strong>, Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan yang berlaku di bawah ini.
                </p>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">1. Ketentuan Umum</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Layanan ini dioperasikan oleh Madfat, penyedia produk digital tepercaya.</li>
                  <li>Kami berhak untuk mengubah, menambah, atau memperbarui Syarat dan Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.</li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">2. Akun dan Keamanan</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Anda wajib memberikan informasi yang akurat dan lengkap saat membuat akun atau melakukan pembelian.</li>
                  <li>Anda bertanggung jawab penuh untuk menjaga kerahasiaan informasi akun dan kata sandi Anda.</li>
                  <li>Madfat tidak bertanggung jawab atas kerugian akibat penyalahgunaan akun Anda oleh pihak lain.</li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">3. Pembelian dan Pengiriman Produk Digital</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Seluruh produk digital yang dijual di website ini berupa produk non-fisik (seperti unduhan berkas, akses lisensi, atau layanan digital).</li>
                  <li>Setelah pembayaran berhasil, produk akan dikirimkan melalui WhatsApp yang telah Anda gunakan untuk order.</li>
                  <li>Mohon teliti dan berhati-hati terhadap pesan yang dikirim oleh selain nomor resmi kami. Madfat tidak bertanggung jawab atas segala bentuk penipuan yang mengatasnamakan kami di luar nomor resmi tersebut.</li>
                  <li>Anda bertanggung jawab memastikan perangkat Anda kompatibel untuk membuka atau menjalankan produk digital yang dibeli.</li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">4. Hak Kekayaan Intelektual (Hak Cipta)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Seluruh produk digital, desain, teks, grafis, dan materi di website Madfat adalah hak milik eksklusif Madfat atau pemberi lisensi kami.</li>
                  <li>Pembelian produk memberikan Anda hak pakai personal (lisensi non-eksklusif) dan tidak memberikan hak milik.</li>
                  <li>Anda dilarang keras menggandakan, mendistribusikan ulang, menjual kembali (reselling), atau membagikan produk digital Madfat kepada pihak lain tanpa izin tertulis dari kami.</li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">5. Kebijakan Pengembalian Uang (Refund Policy)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Karena sifat produk digital yang dapat langsung diakses atau diunduh setelah pembelian, semua transaksi pada dasarnya bersifat final.</li>
                  <li>Refund dapat diproses sesuai dengan ketentuan yang berlaku.</li>
                  <li>Ketentuan pengembalian dana hanya dipertimbangkan jika terjadi kendala teknis dari sistem Madfat yang menyebabkan produk tidak dapat diakses sama sekali setelah proses verifikasi oleh tim kami.</li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">6. Batasan Tanggung Jawab</h3>
                <p>
                  Madfat tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau hilangnya keuntungan pengguna yang disebabkan oleh kesalahan penggunaan produk atau gangguan teknis pada perangkat pengguna.
                </p>
              </div>

              <div className="border-t border-dashed border-[#dfc0b3]/55 pt-6">
                <h3 className="font-hero text-sm sm:text-base font-bold uppercase text-obsidian mb-2">7. Kontak Resmi Kami</h3>
                <p className="mb-2">Untuk memastikan keamanan transaksi Anda, berikut adalah satu-satunya kontak resmi Madfat untuk pengiriman produk dan layanan pelanggan:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email: <a href="mailto:hello@madfat.site" className="text-blaze-orange hover:underline font-bold">hello@madfat.site</a></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Back Button */}
        <div className="mt-8 text-center policy-content-card">
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
