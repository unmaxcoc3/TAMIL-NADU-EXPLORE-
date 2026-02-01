
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Sparkles, ChevronRight, Compass, Utensils, Calendar, Tv, ShoppingBag, Zap, LayoutGrid, Globe, X, Mountain, Map, Palmtree, Ticket, Activity, Clapperboard, ShoppingCart, Waves, Gem, Landmark, Coffee, Flame, IceCream, Music, Mic2, GraduationCap, Presentation, TreePine, Sailboat, Tent, FerrisWheel, Joystick, Disc, Glasses, DoorOpen, ShoppingBasket, Store, BookOpen, Warehouse, Clock, RotateCcw } from 'lucide-react';
import { Category, SearchState, Recommendation, District, Language, CATEGORY_LABELS } from './types';
import { RecommendationCard } from './components/RecommendationCard';
import { PlaceDetail } from './components/PlaceDetail';
import { getAIGuideResponse, getAITagline } from './services/geminiService';
import { translations } from './translations';

const DISTRICTS: District[] = [
  'All', 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 
  'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 
  'Kanyakumari', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
  'Tirupattur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

const DISTRICT_HIGHLIGHTS: Record<District, string> = {
  'All': 'All of Tamil Nadu',
  'Chennai': 'Beaches, museums, temples, street food, cafes, concerts, malls, and theaters.',
  'Chengalpattu': 'Mahabalipuram heritage, pristine beaches, adventure resorts, surfing, and camping.',
  'Kancheepuram': 'Ancient temples, world-famous silk saree shopping, and rich heritage tourism.',
  'Tiruvallur': 'Pulicat Lake, ancient temples, and serene lakeside getaways.',
  'Vellore': 'Historical Vellore Fort, Yelagiri Hills trekking, and natural camping spots.',
  'Ranipet': 'Hidden local temples, scenic lakes, and authentic rural tourism.',
  'Tirupattur': 'Yelagiri hill station activities and nature escapes.',
  'Tiruvannamalai': 'Arunachaleswarar temple, spiritual Girivalam trekking, and ashrams.',
  'Viluppuram': 'Historical Gingee Fort trekking and heritage sites.',
  'Kallakurichi': 'Nature trips in Kalvarayan Hills and scenic waterfalls.',
  'Cuddalore': 'The vast Silver Beach and boat rides through mangrove forests.',
  'Mayiladuthurai': 'Divine temple tourism and traditional river delta village life.',
  'Nagapattinam': 'Velankanni Basilica, peaceful beaches, and maritime history.',
  'Tiruvarur': 'Famous chariot temple and traditional heritage spots.',
  'Thanjavur': 'UNESCO Brihadeeswara Temple, heritage sites, and classical art shopping.',
  'Ariyalur': 'Fascinating fossil parks and geological tourism spots.',
  'Perambalur': 'Offbeat rural tourism and local scenic spots.',
  'Pudukkottai': 'Ancient Sittannavasal rock-cut temples, historical forts, and archaeological treasures.',
  'Tiruchirappalli': 'Rockfort Temple, Srirangam temple complex, and bustling local markets.',
  'Karur': 'Premium textile shopping and peaceful riverbank excursions.',
  'Namakkal': 'The hairpin bends of Kolli Hills, trekking, and hidden waterfalls.',
  'Salem': 'Yercaud hill station retreats and coffee plantations.',
  'Dharmapuri': 'The majestic Hogenakkal Falls and river boating experiences.',
  'Krishnagiri': 'Vast dam views, lush mango farms, and scenic hill drives.',
  'Erode': 'Bhavani river confluence, textile markets, and rural beauty.',
  'Tiruppur': 'Premier garment shopping and the heart of the textile industry.',
  'Coimbatore': 'Adventure sports, modern malls, boutique cafes, and Isha center.',
  'Nilgiris': 'Ooty hill station, tea gardens, mountain trekking, and lake boating.',
  'Dindigul': 'Kodaikanal hill station, mountain trekking, and pine forests.',
  'Madurai': 'Iconic Meenakshi Temple, legendary street food, and vibrant shopping.',
  'Theni': 'Meghamalai misty peaks, waterfalls, and spice plantation trekking.',
  'Sivaganga': 'Chettinad heritage mansions, unique architecture, and spicy cuisine.',
  'Ramanathapuram': 'Spiritual Rameswaram, coral reefs, and pristine coastal beaches.',
  'Virudhunagar': 'Local temples, rural heritage, and unique food specialties.',
  'Thoothukudi': 'Harbor tourism, pristine beaches, and famous local macaroons.',
  'Tirunelveli': 'Nature\'s spa at Courtallam Falls and river-based tourism.',
  'Tenkasi': 'Cascading waterfalls and adventurous hill trekking.',
  'Kanyakumari': 'Southernmost tip sunrise, Vivekananda Rock, and beach sunsets.'
};

interface SubCategory {
  name: string;
  icon: React.ElementType;
}

const Target = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

const SUB_CATEGORIES: Record<Category, SubCategory[]> = {
  [Category.TRAVEL]: [
    { name: 'Beaches', icon: Waves },
    { name: 'Hill stations', icon: Mountain },
    { name: 'Waterfalls', icon: Palmtree },
    { name: 'Temples & heritage sites', icon: Landmark },
    { name: 'Weekend getaway spots', icon: DoorOpen },
    { name: 'Hidden/offbeat places', icon: Gem },
  ],
  [Category.FOOD]: [
    { name: 'Budget food', icon: ShoppingBasket },
    { name: 'Street food spots', icon: Flame },
    { name: 'Cafes', icon: Coffee },
    { name: 'Biryani & local specialties', icon: Utensils },
    { name: 'Dessert places', icon: IceCream },
    { name: 'Late-night food', icon: Clock },
  ],
  [Category.EVENTS]: [
    { name: 'Concerts', icon: Music },
    { name: 'Stand-up comedy', icon: Mic2 },
    { name: 'College culturals', icon: GraduationCap },
    { name: 'Exhibitions', icon: Presentation },
    { name: 'Festivals', icon: Ticket },
    { name: 'Workshops', icon: Zap },
  ],
  [Category.ADVENTURE]: [
    { name: 'Trekking', icon: TreePine },
    { name: 'Surfing', icon: Waves },
    { name: 'Camping', icon: Tent },
    { name: 'Kayaking', icon: Sailboat },
    { name: 'Go-karting', icon: Zap },
    { name: 'Paintball', icon: Target },
    { name: 'Cycling trails', icon: Activity },
  ],
  [Category.ENTERTAINMENT]: [
    { name: 'Movie theatres', icon: Clapperboard },
    { name: 'Gaming arenas', icon: Joystick },
    { name: 'Bowling', icon: Disc },
    { name: 'VR experiences', icon: Glasses },
    { name: 'Escape rooms', icon: DoorOpen },
    { name: 'Indoor fun zones', icon: FerrisWheel },
  ],
  [Category.SHOPPING]: [
    { name: 'Budget shopping areas', icon: ShoppingBag },
    { name: 'Street markets', icon: Store },
    { name: 'Malls', icon: Warehouse },
    { name: 'Bookstores', icon: BookOpen },
    { name: 'Local unique shops', icon: Gem },
  ],
};

const CATEGORIES = [
  { id: Category.TRAVEL, icon: Map, color: 'bg-emerald-50 text-emerald-600', accent: 'emerald' },
  { id: Category.FOOD, icon: Utensils, color: 'bg-orange-50 text-orange-600', accent: 'orange' },
  { id: Category.EVENTS, icon: Ticket, color: 'bg-purple-50 text-purple-600', accent: 'purple' },
  { id: Category.ADVENTURE, icon: Activity, color: 'bg-amber-50 text-amber-600', accent: 'amber' },
  { id: Category.ENTERTAINMENT, icon: Clapperboard, color: 'bg-pink-50 text-pink-600', accent: 'pink' },
  { id: Category.SHOPPING, icon: ShoppingCart, color: 'bg-indigo-50 text-indigo-600', accent: 'indigo' },
];

const HILL_STATIONS = [
  { name: 'Ooty (Udhagamandalam)', district: 'Nilgiris' as District },
  { name: 'Coonoor', district: 'Nilgiris' as District },
  { name: 'Kotagiri', district: 'Nilgiris' as District },
  { name: 'Kodaikanal', district: 'Dindigul' as District },
  { name: 'Yercaud', district: 'Salem' as District },
  { name: 'Yelagiri', district: 'Tirupattur' as District },
  { name: 'Valparai', district: 'Coimbatore' as District },
];

const FEATURED_PLACES: Recommendation[] = [
  {
    id: 'brihadisvara-temple',
    name: 'Brihadisvara Temple',
    nameTamil: 'தஞ்சை பெரிய கோவில்',
    category: Category.TRAVEL,
    district: 'Thanjavur',
    description: 'A 1000-year-old architectural marvel built by Raja Raja Chola I, featuring the tallest vimanam in the world.',
    location: 'Membalam Rd, Balaji Nagar',
    area: 'Thanjavur City',
    priceCategory: 'Free',
    cost: 'Free Entry',
    bestTime: 'Early morning or Sunset',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1581010866018-7d7283a80436?q=80&w=1200'
  }
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showHillPicker, setShowHillPicker] = useState(false);
  const [showSubCategoryPicker, setShowSubCategoryPicker] = useState(false);
  const [activeParentCategory, setActiveParentCategory] = useState<Category | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Recommendation | null>(null);
  const [aiTagline, setAiTagline] = useState<string>("");
  const [loadingTagline, setLoadingTagline] = useState(false);
  
  const [search, setSearch] = useState<SearchState>({
    query: '',
    category: 'All',
    district: 'All',
    isLoading: false,
    results: [],
    error: null,
  });

  const t = translations[lang];

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Location denied"),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string, customCategory?: Category | 'All', customDistrict?: District) => {
    if (e) e.preventDefault();
    
    const query = customQuery ?? search.query;
    const category = customCategory ?? search.category;
    const district = customDistrict ?? search.district;

    setSearch(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      query: customQuery && !query.includes(customQuery) ? customQuery : prev.query,
      category,
      district,
      results: []
    }));

    if (e || customCategory || customDistrict || customQuery) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Refresh AI Tagline for new district/context
    refreshTagline(district === 'All' ? 'Tamil Nadu' : district);

    try {
      const fullQuery = district !== 'All' 
        ? `${query || 'Attractions'} in ${district}. Context: ${DISTRICT_HIGHLIGHTS[district]}`
        : query || "Trending spots in Tamil Nadu";

      const aiResults = await getAIGuideResponse(fullQuery, category as string, district, userLocation);
      setSearch(prev => ({ ...prev, results: aiResults, isLoading: false }));
    } catch (err: any) {
      setSearch(prev => ({ ...prev, isLoading: false, error: "Something went wrong while searching. Please try again." }));
    }
  };

  const refreshTagline = async (subject: string) => {
    setLoadingTagline(true);
    const slogan = await getAITagline(subject);
    setAiTagline(slogan);
    setLoadingTagline(false);
  };

  const handleDistrictSelect = (district: District) => {
    setShowDistrictPicker(false);
    handleSearch(undefined, `Top discoveries in ${district}`, "All", district);
  };

  const handleHillSelect = (hill: typeof HILL_STATIONS[0]) => {
    setShowHillPicker(false);
    handleSearch(undefined, `Best sights in ${hill.name}`, Category.TRAVEL, hill.district);
  };

  const handleCategoryClick = (cat: Category) => {
    setActiveParentCategory(cat);
    setShowSubCategoryPicker(true);
  };

  const handleSubCategorySelect = (sub: string) => {
    if (!activeParentCategory) return;
    setShowSubCategoryPicker(false);
    handleSearch(undefined, `${sub} in ${search.district === 'All' ? 'Tamil Nadu' : search.district}`, activeParentCategory, search.district);
  };

  useEffect(() => {
    handleSearch(undefined, "Top attractions", "All", "All");
  }, []);

  if (selectedPlace) {
    return (
      <PlaceDetail 
        item={selectedPlace} 
        lang={lang} 
        onBack={() => {
          setSelectedPlace(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-200">
              TN
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none cursor-pointer" onClick={() => handleSearch(undefined, "Top attractions", "All", "All")}>
                TAMIL NADU <span className="text-orange-600">EXPLORE</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">தமிழ்நாடு எக்ஸ்ப்ளோர்</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl hidden lg:block">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                value={search.query}
                onChange={(e) => setSearch(prev => ({ ...prev, query: e.target.value }))}
                placeholder={t.askAI}
                className="w-full bg-slate-100 border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-orange-100 focus:ring-4 focus:ring-orange-50 transition-all outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <Globe className="w-4 h-4 text-blue-500" />
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-orange-500" />
              <select 
                value={search.district}
                onChange={(e) => handleSearch(undefined, undefined, undefined, e.target.value as District)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer max-w-[120px]"
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d === 'All' ? t.allDistricts : d}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* District Picker Modal */}
      {showDistrictPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDistrictPicker(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowDistrictPicker(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.selectDistrict}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {DISTRICTS.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDistrictSelect(d)}
                  className="p-3 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 hover:shadow-md transition-all text-[11px] font-black text-slate-700 uppercase tracking-tight text-center"
                >
                  {d === 'All' ? t.allDistricts : d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hill Station Picker Modal */}
      {showHillPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-900/60 backdrop-blur-sm" onClick={() => setShowHillPicker(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowHillPicker(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mountain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.selectHill}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HILL_STATIONS.map((hill) => (
                <button
                  key={hill.name}
                  onClick={() => handleHillSelect(hill)}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg transition-all active:scale-95 group text-left"
                >
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm group-hover:text-emerald-700 transition-colors">
                      {hill.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {hill.district} District
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Category Picker Modal */}
      {showSubCategoryPicker && activeParentCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSubCategoryPicker(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowSubCategoryPicker(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 ${CATEGORIES.find(c => c.id === activeParentCategory)?.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                {React.createElement(CATEGORIES.find(c => c.id === activeParentCategory)?.icon || LayoutGrid, { className: "w-8 h-8" })}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{CATEGORY_LABELS[lang][activeParentCategory]}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">{t.refineSearch}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SUB_CATEGORIES[activeParentCategory].map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => handleSubCategorySelect(sub.name)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 hover:bg-white hover:shadow-xl transition-all active:scale-95 group text-left hover:border-orange-500`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${CATEGORIES.find(c => c.id === activeParentCategory)?.color}`}>
                    <sub.icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-tight group-hover:text-slate-900">
                    {sub.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-16 mb-16 shadow-2xl transition-all duration-700">
          <div className="absolute top-0 right-0 w-3/4 h-full opacity-30 mix-blend-overlay transition-opacity duration-1000">
            <img 
              src={search.district === 'All' 
                ? "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop" 
                : `https://source.unsplash.com/featured/1200x800?${encodeURIComponent(search.district + ' Tamil Nadu landmark')}`
              } 
              className="w-full h-full object-cover" 
              key={search.district}
            />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5" /> {search.district === 'All' ? 'Truly Local Insights' : `Exploring ${search.district}`}
            </div>
            
            <div className="mb-4">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight uppercase tracking-tight animate-in slide-in-from-left duration-700">
                {t.greeting} <br/>
                <span className="text-orange-400">
                  {search.district === 'All' ? t.state : `${t.ofDistrict}${search.district}.`}
                </span>
              </h2>
              
              {/* Dynamic AI Tagline */}
              <div className="h-8 flex items-center">
                {loadingTagline ? (
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating Magic...
                  </div>
                ) : aiTagline && (
                  <div className="text-orange-200 italic font-medium text-sm md:text-base animate-in fade-in duration-1000 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-orange-400" /> "{aiTagline}"
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 mb-10 max-w-2xl animate-in fade-in duration-1000">
              <p className="text-slate-200 text-lg font-medium leading-relaxed">
                {search.district === 'All' 
                  ? t.subheading 
                  : <><span className="text-orange-400 font-black uppercase text-xs tracking-widest block mb-2">{t.subheadingDistrict}</span>{DISTRICT_HIGHLIGHTS[search.district]}</>
                }
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowDistrictPicker(true)} 
                className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 transition-all flex items-center gap-3 shadow-xl shadow-orange-900/40 active:scale-95"
              >
                {t.ctaState} <ChevronRight className="w-5 h-5" />
              </button>
              {search.district !== 'All' ? (
                <button 
                  onClick={() => handleSearch(undefined, "Top attractions", "All", "All")} 
                  className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" /> {t.viewAllState}
                </button>
              ) : (
                <button 
                  onClick={() => setShowHillPicker(true)} 
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-black rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Mountain className="w-5 h-5" /> {t.ctaHill}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-orange-600 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{t.browseInterest}</h3>
            </div>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-5 hide-scrollbar snap-x snap-mandatory px-4 -mx-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group flex-shrink-0 w-32 md:w-40 p-6 rounded-[2rem] border-2 transition-all duration-500 text-left active:scale-95 flex flex-col items-center text-center snap-center ${
                  search.category === cat.id 
                    ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100' 
                    : 'border-white bg-white hover:border-orange-100 hover:shadow-xl'
                }`}
              >
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <div className="font-black text-[10px] md:text-xs text-slate-800 tracking-tight uppercase line-clamp-2">
                  {CATEGORY_LABELS[lang][cat.id]}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section ref={resultsRef} className="mb-20 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-600 font-black text-sm uppercase tracking-widest mb-2">
                <LayoutGrid className="w-4 h-4" /> {t.recommended}
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                {search.district === 'All' ? (lang === 'en' ? 'Tamil Nadu' : 'தமிழ்நாடு') : search.district} <span className="text-orange-600">{t.discoveries}</span>
              </h3>
              {search.query && (
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                   {t.resultsFor} "{search.query}"
                 </p>
              )}
            </div>
            <div className="flex items-center gap-4">
               {search.isLoading && <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />}
               <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                {search.results.length} {t.places}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {search.results.map((item) => (
              <RecommendationCard 
                key={item.id} 
                item={item} 
                onSelect={(place) => setSelectedPlace(place)}
              />
            ))}
            {search.isLoading && search.results.length === 0 && (
               Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-[2rem] h-80 animate-pulse flex flex-col p-8">
                  <div className="w-16 h-8 bg-slate-100 rounded-lg mb-6"></div>
                  <div className="w-full h-8 bg-slate-100 rounded-lg mb-4"></div>
                  <div className="w-3/4 h-4 bg-slate-50 rounded-lg mb-auto"></div>
                  <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
                </div>
              ))
            )}
          </div>

          {search.error && (
            <div className="mt-12 bg-orange-50 border-2 border-orange-100 p-8 rounded-[2rem] text-center max-w-2xl mx-auto shadow-sm">
              <Sparkles className="w-8 h-8 text-orange-400 mx-auto mb-4" />
              <p className="font-black text-orange-900 mb-2 uppercase tracking-wide">Guide Info</p>
              <p className="text-sm text-orange-800/80 font-medium leading-relaxed">{search.error}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl">TN</div>
              <h1 className="text-xl font-black text-white uppercase tracking-tighter">TAMIL NADU EXPLORE</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed font-medium">
              Discover the hidden treasures of Tamil Nadu. From spiritual sanctuaries to culinary havens, explore the soul of South India.
            </p>
          </div>
          <div>
            <h4 className="font-black text-white text-xs uppercase tracking-widest mb-6">{t.discoverMore}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><button onClick={() => handleSearch(undefined, "Temples", Category.TRAVEL, "Thanjavur")} className="hover:text-orange-500 transition-colors">Temple Heritage</button></li>
              <li><button onClick={() => handleHillSelect(HILL_STATIONS[0])} className="hover:text-orange-500 transition-colors">Hill Retreats</button></li>
              <li><button onClick={() => handleSearch(undefined, "Dosa spots", Category.FOOD, "Chennai")} className="hover:text-orange-500 transition-colors">Food Trails</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white text-xs uppercase tracking-widest mb-6">{t.statePride}</h4>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase mb-1">State Language</p>
              <p className="text-sm text-orange-400 font-black">தமிழ் வாழ்க!</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 text-center text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
          {t.madeWithHeart} • 2025
        </div>
      </footer>
    </div>
  );
};

export default App;
