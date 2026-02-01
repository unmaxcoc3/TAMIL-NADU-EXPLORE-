
export enum Category {
  TRAVEL = 'Places to Visit',
  FOOD = 'Food & Restaurants',
  EVENTS = 'Events & Happenings',
  ADVENTURE = 'Activities & Adventures',
  ENTERTAINMENT = 'Entertainment & Fun',
  SHOPPING = 'Shopping & Markets'
}

export type Language = 'en' | 'ta' | 'hi';

export const CATEGORY_LABELS: Record<Language, Record<Category, string>> = {
  en: {
    [Category.TRAVEL]: 'Places to Visit',
    [Category.FOOD]: 'Food & Restaurants',
    [Category.EVENTS]: 'Events',
    [Category.ADVENTURE]: 'Activities',
    [Category.ENTERTAINMENT]: 'Entertainment',
    [Category.SHOPPING]: 'Shopping',
  },
  ta: {
    [Category.TRAVEL]: 'பார்க்க வேண்டிய இடங்கள்',
    [Category.FOOD]: 'உணவு மற்றும் உணவகங்கள்',
    [Category.EVENTS]: 'நிகழ்வுகள்',
    [Category.ADVENTURE]: 'செயல்பாடுகள்',
    [Category.ENTERTAINMENT]: 'பொழுதுபோக்கு',
    [Category.SHOPPING]: 'ஷாப்பிங்',
  },
  hi: {
    [Category.TRAVEL]: 'देखने लायक स्थान',
    [Category.FOOD]: 'भोजन और रेस्तरां',
    [Category.EVENTS]: 'कार्यक्रम',
    [Category.ADVENTURE]: 'गतिविधियाँ',
    [Category.ENTERTAINMENT]: 'मनोरंजन',
    [Category.SHOPPING]: 'खरीदारी',
  }
};

export type District = 
  | 'All' 
  | 'Ariyalur' | 'Chengalpattu' | 'Chennai' | 'Coimbatore' | 'Cuddalore' 
  | 'Dharmapuri' | 'Dindigul' | 'Erode' | 'Kallakurichi' | 'Kancheepuram' 
  | 'Karur' | 'Krishnagiri' | 'Madurai' | 'Mayiladuthurai' | 'Nagapattinam' 
  | 'Kanyakumari' | 'Namakkal' | 'Nilgiris' | 'Perambalur' | 'Pudukkottai' 
  | 'Ramanathapuram' | 'Ranipet' | 'Salem' | 'Sivaganga' | 'Tenkasi' 
  | 'Thanjavur' | 'Theni' | 'Thoothukudi' | 'Tiruchirappalli' | 'Tirunelveli' 
  | 'Tirupattur' | 'Tiruppur' | 'Tiruvallur' | 'Tiruvannamalai' | 'Tiruvarur' 
  | 'Vellore' | 'Viluppuram' | 'Virudhunagar';

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
