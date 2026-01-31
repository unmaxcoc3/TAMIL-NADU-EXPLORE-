
export enum Category {
  TRAVEL = 'Travel & Heritage',
  FOOD = 'Local Eats & Cuisines',
  EVENTS = 'Culture & Festivals',
  ENTERTAINMENT = 'Leisure & Fun',
  SHOPPING = 'Handicrafts & Markets',
  ADVENTURE = 'Nature & Outdoors'
}

export type District = 
  | 'All' 
  | 'Chennai' 
  | 'Madurai' 
  | 'Coimbatore' 
  | 'Trichy' 
  | 'Thanjavur' 
  | 'The Nilgiris' 
  | 'Kanyakumari' 
  | 'Salem' 
  | 'Tirunelveli';

export type PriceCategory = 'Free' | 'Budget' | 'Mid-range' | 'Premium';

export interface Recommendation {
  id: string;
  name: string;
  nameTamil?: string;
  category: Category;
  description: string;
  location: string;
  area: string;
  district: District;
  priceCategory: PriceCategory;
  cost?: string;
  bestTime?: string;
  rating?: number;
  imageUrl?: string;
  links?: { title: string; uri: string }[];
}

export interface SearchState {
  query: string;
  category: Category | 'All';
  district: District;
  isLoading: boolean;
  results: Recommendation[];
  error: string | null;
}
