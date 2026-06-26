export interface Category {
  id: string;
  name: string;
}

export interface DigitalProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  sub: string;
  description: string;
  icon: string; // Lucide icon name or initial
  color: string; // Background color class
  hot?: boolean;
  bestSeller?: boolean;
  image?: string;
  isOutOfStock?: boolean;
}

export interface WebsitePackage {
  id: string;
  name: string;
  priceText: string;
  price: number;
  sub: string;
  features: string[];
  isFeatured?: boolean;
  badge?: string;
  categoryName: string;
  btnText?: string;
  isOutOfStock?: boolean;
}

export interface CartItem {
  product: DigitalProduct | WebsitePackage;
  quantity: number;
  notes: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatarColor: string;
  avatarImage?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
