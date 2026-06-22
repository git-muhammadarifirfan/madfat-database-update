export interface DigitalProduct {
  id: string;
  name: string;
  category: 'streaming' | 'gaming' | 'education' | 'other';
  price: number;
  sub: string;
  description: string;
  icon: string; // Lucide icon name or initial
  color: string; // Background color class
  hot?: boolean;
  bestSeller?: boolean;
  image?: string;
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
