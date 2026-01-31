
export enum Category {
  TRAVEL = 'Travel & Hidden Spots',
  FOOD = 'Food & Street Eats',
  EVENTS = 'Live Events & Festivals',
  ENTERTAINMENT = 'Fun & Entertainment',
  SHOPPING = 'Shopping & Thrift',
  ADVENTURE = 'Activities & Adventure'
}

export type PriceCategory = 'Free' | 'Budget' | 'Mid-range' | 'Premium';

export interface Recommendation {
  id: string;
  name: string;
  category: Category;
  description: string;
  location: string; // Full address or landmark
  area: string; // Specific neighborhood or town (e.g., Adyar, T. Nagar, Mahabalipuram)
  priceCategory: PriceCategory;
  cost?: string; // Detailed cost info (e.g., ₹500 for two)
  bestTime?: string;
  rating?: number;
  imageUrl?: string;
  links?: { title: string; uri: string }[];
}

export interface SearchState {
  query: string;
  category: Category | 'All';
  isLoading: boolean;
  results: Recommendation[];
  error: string | null;
}
