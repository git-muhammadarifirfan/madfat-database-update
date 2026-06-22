import { DigitalProduct, WebsitePackage, Testimonial, FAQItem } from './types';

export const DIGITAL_PRODUCTS: DigitalProduct[] = [
  {
    id: 'netflix',
    name: 'Netflix Premium',
    category: 'streaming',
    price: 35000,
    sub: 'UHD 4K Resolution & Anti Screen Limit',
    description: 'Nonton film berkualitas 4K tanpa batasan sharing screen. Garansi penuh sepanjang masa aktif.',
    icon: 'Netflix',
    color: 'bg-red-600',
    hot: true,
  },
  {
    id: 'spotify',
    name: 'Spotify Family',
    category: 'streaming',
    price: 45000,
    sub: 'Individual Plan 12 Bulan Aktif.',
    description: 'Dengarkan lagu favoritmu secara offline tanpa gangguan iklan. Kualitas audio premium tertinggi.',
    icon: 'Spotify',
    color: 'bg-green-500',
    hot: false,
  },
  {
    id: 'youtube-premium',
    name: 'Youtube Premium',
    category: 'streaming',
    price: 15000,
    sub: 'Tanpa Iklan & Play In Background',
    description: 'Nikmati jutaan video dan musik tanpa jeda iklan, pemutaran di latar belakang, dan akses download video offline.',
    icon: 'Youtube',
    color: 'bg-red-600',
    bestSeller: true,
  },
  {
    id: 'discord-nitro',
    name: 'Discord Nitro',
    category: 'gaming',
    price: 65000,
    sub: 'Full Nitro 1 Bulan + 2 Boosts',
    description: 'Dapatkan 2 server boosts, custom emoji, profil animasi, share screen 1080p, dan ukuran upload 100MB.',
    icon: 'Discord',
    color: 'bg-indigo-500',
    hot: false,
  },
  {
    id: 'disney-hotstar',
    name: 'Disney+ Hotstar',
    category: 'streaming',
    price: 25000,
    sub: 'Akun Privat 1 Bulan',
    description: 'Akses penuh konten eksklusif Marvel, Disney, Pixar, Star Wars, dan film lokal terbaik.',
    icon: 'Disney',
    color: 'bg-blue-600',
  },
  {
    id: 'canva-pro',
    name: 'Canva Pro Lifetime',
    category: 'education',
    price: 15000,
    sub: 'Tim Admin Lifetime',
    description: 'Akses penuh ke semua template premium, penghapus latar belakang instan, dan brand kit tanpa batas.',
    icon: 'Canva',
    color: 'bg-purple-500',
  },
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus GPT-4o',
    category: 'education',
    price: 110000,
    sub: 'Shared / 30 Hari Aktif',
    description: 'Gunakan kecerdasan buatas GPT-4o tanpa batas, analisis file data besar, dan generate gambar DALL-E.',
    icon: 'ChatGPT',
    color: 'bg-teal-600',
    hot: true,
  },
  {
    id: 'midjourney',
    name: 'Midjourney VIP',
    category: 'gaming',
    price: 85000,
    sub: 'Basic Premium 1 Bulan',
    description: 'Hasilkan ilustrasi dan konsep desain ultra-realistis dengan generator AI terbaik di Discord.',
    icon: 'Midjourney',
    color: 'bg-stone-800',
  }
];

export const WEBSITE_PACKAGES: WebsitePackage[] = [
  {
    id: 'bundle-a',
    name: 'LANDING PAGE BASIC',
    priceText: 'Rp 300K - 550K',
    price: 300000,
    sub: 'Sangat representatif untuk profil bisnis, personal branding, atau peluncuran produk baru secara digital.',
    features: [
      '1 Halaman Informasi Utama Lengkap',
      'Profil Usaha & Deskripsi Layanan',
      'Galeri Dokumentasi & Testimoni',
      'Integrasi Peta Lokasi Google Maps',
      'Tombol WhatsApp & Tautan Bio Sosial'
    ],
    isFeatured: false,
    badge: '',
    categoryName: 'BASIC PACKAGE',
    btnText: 'PILIH PAKET'
  },
  {
    id: 'bundle-b',
    name: 'KATALOG ONLINE UMKM',
    priceText: 'Rp 500K - 1.5Jt',
    price: 500000,
    sub: 'Media etalase digital untuk menampilkan produk Anda secara mendetail.',
    features: [
      'Kapasitas 5 hingga 30 Produk',
      'Kategorisasi & Informasi Harga Jelas',
      'Detail Deskripsi & Galeri Foto',
      'Pemesanan Langsung via WhatsApp',
      'Kemudahan Distribusi dengan Satu Tautan',
      'Bisa Terintegrasi Payment Gateway'
    ],
    isFeatured: true,
    badge: 'TERPOPULER',
    categoryName: 'CATALOG PACKAGE',
    btnText: 'PILIH PAKET'
  },
  {
    id: 'bundle-c',
    name: 'COMPANY PROFILE & REALTIME DB',
    priceText: 'Rp 650K - 2Jt',
    price: 650000,
    sub: 'Meningkatkan kepercayaan klien profesional lewat website interaktif dengan database tersinkronisasi.',
    features: [
      'Integrasi Realtime Database',
      'Struktur Informasi & Layanan Lengkap',
      'Daftar Rekanan & Portofolio Klien',
      'Halaman Informasi Umum (FAQ) & Kontak',
      'Konsultasi Terintegrasi WhatsApp'
    ],
    isFeatured: false,
    badge: '',
    categoryName: 'COMPANY PROFILE',
    btnText: 'PILIH PAKET'
  },
  {
    id: 'bundle-d',
    name: 'POS & APLIKASI BISNIS',
    priceText: 'Rp 800K - 2.5Jt',
    price: 800000,
    sub: 'Kelola operasional, transaksi kasir, dan pantau stok inventaris secara digital melalui Web atau Android.',
    features: [
      'Autentikasi Akun Admin yang Aman',
      'Pencatatan Stok & Manajemen Produk',
      'Modul Kasir & Pencatatan Transaksi',
      'Laporan Penjualan & Ekspor Data',
      'Kustomisasi Alur Kerja Bisnis Anda'
    ],
    isFeatured: false,
    badge: '',
    categoryName: 'BUSINESS SYSTEM',
    btnText: 'PILIH PAKET'
  },
  {
    id: 'bundle-e',
    name: 'CUSTOM & MOBILE APP',
    priceText: 'Mulai Rp 600rb - 10jt',
    price: 600000,
    sub: 'Pengembangan sistem berskala khusus untuk operasional perusahaan, maupun prototipe penelitian akademik/skripsi.',
    features: [
      'Pengembangan Eksklusif dari Awal',
      'Skema Biaya Fleksibel & Transparan',
      'Implementasi Fitur Sesuai Spesifikasi',
      'Konsultasi Struktur & Arsitektur Kode',
      'Cocok untuk Tugas Akhir & Studi Kasus'
    ],
    isFeatured: false,
    badge: '',
    categoryName: 'CUSTOM PROJECT',
    btnText: 'HUBUNGI KAMI'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Andi Wijaya',
    role: 'Content Creator',
    text: 'Proses cepat banget, kurang dari 10 menit akun Netflix udah aktif. Rekomen banget buat yang mau streaming murah!',
    rating: 5,
    avatarColor: 'bg-amber-500'
  },
  {
    name: 'Siti Rahma',
    role: 'Freelancer',
    text: 'Pesen website landing page disini hasilnya memuaskan. Design modern dan SEO oke banget buat jualan.',
    rating: 5,
    avatarColor: 'bg-blaze-orange'
  },
  {
    name: 'Budi Santoso',
    role: 'Kedai Kopi Kuliner',
    text: 'Sudah langganan Canva Pro setahun disini, aman gak pernah kena hold. Mantap Madfat emang terpercaya!',
    rating: 5,
    avatarColor: 'bg-yellow-500'
  },
  {
    name: 'Jessica',
    role: 'Mahasiswi UI/UX',
    text: 'Harganya ramah di kantong mahasiswa. Adminnya juga fast respon banget kalau ditanya-tanya soal akun.',
    rating: 5,
    avatarColor: 'bg-purple-500'
  },
  {
    name: 'Rian Pratama',
    role: 'Owner Tech Startup',
    text: 'Membangun Landing Page untuk campaign digital kami berlangsung lancar kilat. Nilai tambah besar ada di setup optimasi SEO default.',
    rating: 5,
    avatarColor: 'bg-emerald-500'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Apakah akun yang dijual legal?',
    answer: 'Ya, seluruh produk digital (Netflix, Disney, Spotify, Discord Nitro, dll) yang kami tawarkan didapatkan melalui metode pembayaran resmi dan legal. Kami melarang keras segala bentuk phising atau exploit illegal.'
  },
  {
    question: 'Berapa lama proses aktivasi akun?',
    answer: 'Jika pembayaran dan checkout diserahkan ke WhatsApp, admin kami biasanya langsung mengonfirmasi dalam waktu 5 - 15 menit saja! Pengiriman akun dikirim langsung via chat chat whatsapp Anda.'
  },
  {
    question: 'Apakah ada garansi jika akun bermasalah?',
    answer: 'Tentu saja! Madfat berkomitmen penuh memberikan garansi 100% selama masa aktif subscription Anda. Jika akun mengalami hambatan, sisa durasi dijamin dengan pergantian akun baru secara instan.'
  },
  {
    question: 'Berapa lama pengerjaan website?',
    answer: 'Pengerjaan dimulai dengan konsultasi konsep/mockup desain. Setelah Anda menyetujui, kami lanjut ke proses pengerjaan pembuatan struktur web & animasi, review revisi, dan terakhir perilisan domain / hosting.'
  },
  {
    question: 'Apakah saya bisa mengajukan custom fitur di luar paket website?',
    answer: 'Sangat bisa! Silakan memilih Bundle D (Custom App) atau langsung chat admin kami. Kami siap mendesain sistem integrasi API, database interaktif, hingga visual animasi high-end sesuai permintaan khusus bisnis Anda.'
  }
];
