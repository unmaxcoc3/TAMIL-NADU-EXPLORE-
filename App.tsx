
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Sparkles, ChevronRight, Compass, Utensils, Calendar, Tv, ShoppingBag, Zap, Filter, LayoutGrid } from 'lucide-react';
import { Category, SearchState, Recommendation, District } from './types';
import { RecommendationCard } from './components/RecommendationCard';
import { getAIGuideResponse } from './services/geminiService';

const DISTRICTS: District[] = ['All', 'Chennai', 'Madurai', 'Coimbatore', 'Trichy', 'Thanjavur', 'The Nilgiris', 'Kanyakumari', 'Salem', 'Tirunelveli'];

const CATEGORIES = [
  { id: Category.TRAVEL, icon: Compass, color: 'bg-emerald-50 text-emerald-600' },
  { id: Category.FOOD, icon: Utensils, color: 'bg-orange-50 text-orange-600' },
  { id: Category.EVENTS, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
  { id: Category.ENTERTAINMENT, icon: Tv, color: 'bg-pink-50 text-pink-600' },
  { id: Category.SHOPPING, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600' },
  { id: Category.ADVENTURE, icon: Zap, color: 'bg-amber-50 text-amber-600' },
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
    rating: 4.9
  },
  {
    id: 'meenakshi-temple',
    name: 'Meenakshi Amman Temple',
    nameTamil: 'மதுரை மீனாட்சி அம்மன் கோவில்',
    category: Category.TRAVEL,
    district: 'Madurai',
    description: 'The historic center of Madurai, known for its stunning gopurams and the Hall of Thousand Pillars.',
    location: 'Madurai Main',
    area: 'Madurai Center',
    priceCategory: 'Free',
    cost: 'Free Entry',
    bestTime: 'December to February',
    rating: 5.0
  },
  {
    id: 'vivekananda-rock',
    name: 'Vivekananda Rock Memorial',
    nameTamil: 'விவேகானந்தர் பாறை',
    category: Category.TRAVEL,
    district: 'Kanyakumari',
    description: 'A sacred monument built on a rock island where Swami Vivekananda meditated, at the confluence of three seas.',
    location: 'Kanyakumari Coast',
    area: 'Ocean Front',
    priceCategory: 'Budget',
    cost: '₹50 ferry ride',
    bestTime: 'Sunrise',
    rating: 4.8
  },
  {
    id: 'ooty-toy-train',
    name: 'Nilgiri Mountain Railway',
    nameTamil: 'நீலகிரி மலை இரயில்',
    category: Category.TRAVEL,
    district: 'The Nilgiris',
    description: 'A UNESCO heritage toy train ride offering breathtaking views of tea gardens and misty hills.',
    location: 'Mettupalayam to Ooty',
    area: 'Western Ghats',
    priceCategory: 'Budget',
    cost: '₹200 - ₹500',
    bestTime: 'Summer (March - June)',
    rating: 4.9
  },
  {
    id: 'dhanushkodi-ghost-town',
    name: 'Dhanushkodi Ghost Town',
    nameTamil: 'தனுஷ்கோடி',
    category: Category.ADVENTURE,
    description: 'A hauntingly beautiful town destroyed by a cyclone, where the Indian Ocean and Bay of Bengal meet.',
    location: 'Rameswaram Tip',
    area: 'Rameswaram',
    district: 'Tirunelveli', 
    priceCategory: 'Free',
    cost: 'Free access',
    bestTime: 'Early morning',
    rating: 4.7
  },
  {
    id: 'madurai-jigarthanda',
    name: 'Famous Jigarthanda',
    nameTamil: 'மதுரை ஜிகர்தண்டா',
    category: Category.FOOD,
    district: 'Madurai',
    description: 'The legendary cooling drink of Madurai made with almond gum, sarsaparilla syrup, and thick milk.',
    location: 'Anna Nagar / Town Hall Road',
    area: 'Madurai',
    priceCategory: 'Budget',
    cost: '₹40 - ₹80',
    bestTime: 'Anytime',
    rating: 4.8
  }
];

const App: React.FC = () => {
  const [search, setSearch] = useState<SearchState>({
    query: '',
    category: 'All',
    district: 'All',
    isLoading: false,
    results: [],
    error: null,
  });

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
      query: customQuery ? '' : prev.query,
      category,
      district,
      results: FEATURED_PLACES.filter(p => 
        (category === 'All' || p.category === category) && 
        (district === 'All' || p.district === district)
      )
    }));

    if (e || customCategory || customDistrict) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      const aiResults = await getAIGuideResponse(query || "Trending spots", category as string, district, userLocation);
      setSearch(prev => {
        const combined = [...prev.results];
        aiResults.forEach(aiItem => {
          if (!combined.some(c => c.id === aiItem.id || c.name === aiItem.name)) {
            combined.push(aiItem);
          }
        });
        return { ...prev, results: combined, isLoading: false };
      });
    } catch (err: any) {
      let errorMsg = "Couldn't load fresh insights. Showing curated favorites.";
      if (err.message === "API_KEY_MISSING" || err.message === "API_KEY_INVALID") {
        errorMsg = "Note: Explore is running in 'Offline Mode'. Connect your Gemini API Key in settings to unlock real-time AI insights!";
      }
      setSearch(prev => ({ ...prev, isLoading: false, error: errorMsg }));
    }
  };

  useEffect(() => {
    setSearch(prev => ({ ...prev, results: FEATURED_PLACES.slice(0, 4) }));
    handleSearch(undefined, "Top attractions", "All", "All");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-200">
              TN
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                TAMIL NADU <span className="text-orange-600">EXPLORE</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">தமிழ்நாடு எக்ஸ்ப்ளோர்</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl mx-8 hidden lg:block">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                value={search.query}
                onChange={(e) => setSearch(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Ask our AI guide... 'Spicy street food in Madurai'"
                className="w-full bg-slate-100 border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-orange-100 focus:ring-4 focus:ring-orange-50 transition-all outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-orange-500" />
              <select 
                value={search.district}
                onChange={(e) => handleSearch(undefined, undefined, undefined, e.target.value as District)}
                className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-16 mb-16 shadow-2xl">
          <div className="absolute top-0 right-0 w-3/4 h-full opacity-30 mix-blend-overlay">
            <img src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Truly Local Insights
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
              Explore the Heart <br/>
              <span className="text-orange-400">of Tamil Nadu.</span>
            </h2>
            <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-xl font-medium leading-relaxed">
              From the misty hills of the Nilgiris to the bustling streets of Madurai, find your next favorite spot.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => handleSearch(undefined, "Best heritage walks", "All", "Madurai")} className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 transition-all flex items-center gap-3 shadow-xl shadow-orange-900/40 active:scale-95">
                Explore Madurai <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => handleSearch(undefined, "Hill station gems", Category.TRAVEL, "The Nilgiris")} className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-black rounded-2xl hover:bg-white/20 transition-all">
                Plan a Hill Escape
              </button>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-orange-600 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">BROWSE BY INTEREST</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSearch(undefined, undefined, cat.id)}
                className={`group p-6 rounded-[2rem] border-2 transition-all duration-500 text-left active:scale-95 flex flex-col items-center text-center ${
                  search.category === cat.id 
                    ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100' 
                    : 'border-white bg-white hover:border-orange-100 hover:shadow-xl'
                }`}
              >
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <div className="font-black text-xs text-slate-800 tracking-tight uppercase">{cat.id.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </section>

        <section ref={resultsRef} className="mb-20 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-600 font-black text-sm uppercase tracking-widest mb-2">
                <LayoutGrid className="w-4 h-4" /> Recommended for You
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                {search.district === 'All' ? 'Tamil Nadu' : search.district} <span className="text-orange-600">Discoveries</span>
              </h3>
            </div>
            <div className="flex items-center gap-4">
               {search.isLoading && <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />}
               <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                {search.results.length} PLACES
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {search.results.map((item) => (
              <RecommendationCard key={item.id} item={item} />
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
              <p className="font-black text-orange-900 mb-2 uppercase tracking-wide">AI Guide Info</p>
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
              We are dedicated to uncovering the rich tapestry of Tamil Nadu's culture, food, and landscapes. A state where ancient traditions meet modern vibrancy.
            </p>
          </div>
          <div>
            <h4 className="font-black text-white text-xs uppercase tracking-widest mb-6">Discover More</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><button onClick={() => handleSearch(undefined, "Temples", Category.TRAVEL, "Thanjavur")} className="hover:text-orange-500 transition-colors">Temple Heritage</button></li>
              <li><button onClick={() => handleSearch(undefined, "Coffee estates", Category.TRAVEL, "The Nilgiris")} className="hover:text-orange-500 transition-colors">Hill Retreats</button></li>
              <li><button onClick={() => handleSearch(undefined, "Dosa spots", Category.FOOD, "Chennai")} className="hover:text-orange-500 transition-colors">Food Trails</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white text-xs uppercase tracking-widest mb-6">State Pride</h4>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase mb-1">State Language</p>
              <p className="text-sm text-orange-400 font-black">தமிழ் வாழ்க!</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 text-center text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
          MADE WITH HEART FOR TAMIL NADU • 2025
        </div>
      </footer>
    </div>
  );
};

export default App;
