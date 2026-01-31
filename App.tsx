
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Sparkles, Navigation, ChevronRight, Compass, Utensils, Calendar, Tv, ShoppingBag, Zap } from 'lucide-react';
import { Category, SearchState, Recommendation } from './types';
import { RecommendationCard } from './components/RecommendationCard';
import { getAIGuideResponse } from './services/geminiService';

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
    id: 'mahabalipuram-shore-temple',
    name: 'Shore Temple',
    category: Category.TRAVEL,
    description: 'An iconic 8th-century structural temple overlooking the Bay of Bengal, a UNESCO World Heritage site.',
    location: 'Shore Temple Rd, Mahabalipuram',
    area: 'Mahabalipuram',
    priceCategory: 'Budget',
    cost: '₹40 entry fee',
    bestTime: 'October to March',
    rating: 4.8
  },
  {
    id: 'marina-beach',
    name: 'Marina Beach',
    category: Category.TRAVEL,
    description: 'The second longest urban beach in the world, perfect for evening walks and local sundal.',
    location: 'Beach Road, Triplicane',
    area: 'Triplicane',
    priceCategory: 'Free',
    cost: 'Free Entry',
    bestTime: 'Evening 4 PM - 8 PM',
    rating: 4.5
  },
  {
    id: 'sowcarpet-street-food',
    name: 'Kakada Ramprasad Chat',
    category: Category.FOOD,
    description: 'The holy grail of North Indian street food in Chennai. Famous for their Badam Milk and Aloo Tikki.',
    location: 'Ormes Road, Kilpauk / Sowcarpet',
    area: 'Sowcarpet',
    priceCategory: 'Budget',
    cost: '₹200 for two',
    bestTime: 'Evenings',
    rating: 4.7
  },
  {
    id: 'saravana-bhavan-mylapore',
    name: 'Hotel Saravana Bhavan',
    category: Category.FOOD,
    description: 'World-renowned vegetarian restaurant chain offering authentic South Indian meals and tiffins.',
    location: 'Mylapore Tank',
    area: 'Mylapore',
    priceCategory: 'Mid-range',
    cost: '₹500 for two',
    bestTime: 'Breakfast or Lunch',
    rating: 4.4
  },
  {
    id: 'margazhi-music-festival',
    name: 'Margazhi Music Festival',
    category: Category.EVENTS,
    description: 'The world\'s largest cultural event featuring thousands of Carnatic music and Bharatanatyam performances.',
    location: 'Various Sabhas',
    area: 'Chennai City',
    priceCategory: 'Mid-range',
    cost: 'Varies by Sabha',
    bestTime: 'December - January',
    rating: 4.9
  },
  {
    id: 'vgp-marine-kingdom',
    name: 'VGP Marine Kingdom',
    category: Category.ENTERTAINMENT,
    description: 'India\'s first walkthrough underwater aquarium featuring diverse marine life and tunnels.',
    location: 'East Coast Road, Injambakkam',
    area: 'ECR',
    priceCategory: 'Premium',
    cost: '₹600+ per adult',
    bestTime: 'Day time',
    rating: 4.6
  },
  {
    id: 'pondy-bazaar',
    name: 'Pondy Bazaar Pedestrian Plaza',
    category: Category.SHOPPING,
    description: 'The shopping heart of Chennai. From budget street shops to high-end brands and textiles.',
    location: 'Thyagaraya Road, T. Nagar',
    area: 'T. Nagar',
    priceCategory: 'Budget',
    cost: 'Free entry, great for deals',
    bestTime: 'Morning or Evening',
    rating: 4.5
  },
  {
    id: 'covelong-surfing',
    name: 'Covelong Point Surfing',
    category: Category.ADVENTURE,
    description: 'Premier surfing destination in India offering lessons, festivals, and great waves.',
    location: 'Kovalam Village, ECR',
    area: 'Kovalam',
    priceCategory: 'Mid-range',
    cost: '₹1500 per lesson',
    bestTime: 'Year round',
    rating: 4.8
  }
];

const App: React.FC = () => {
  const [search, setSearch] = useState<SearchState>({
    query: '',
    category: 'All',
    isLoading: false,
    results: [],
    error: null,
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Location access denied or unavailable."),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string, customCategory?: Category | 'All') => {
    if (e) e.preventDefault();
    
    const finalQuery = customQuery || search.query;
    const finalCategory = customCategory || search.category;

    const filteredFeatured = FEATURED_PLACES.filter(place => 
      finalCategory === 'All' || place.category === finalCategory
    );

    setSearch(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      query: customQuery ? '' : prev.query,
      category: finalCategory,
      results: filteredFeatured
    }));

    if (customCategory || e) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    try {
      const aiResults = await getAIGuideResponse(finalQuery || "Trending things to do", finalCategory, userLocation);
      
      setSearch(prev => {
        const combined = [...prev.results];
        aiResults.forEach(aiItem => {
          if (!combined.find(c => c.id === aiItem.id)) {
            combined.push(aiItem);
          }
        });
        return { ...prev, results: combined, isLoading: false };
      });
    } catch (err) {
      setSearch(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: prev.results.length === 0 ? "Failed to fetch new recommendations. Please try again." : null 
      }));
    }
  };

  useEffect(() => {
    const initialResults = FEATURED_PLACES.slice(0, 6);
    setSearch(prev => ({ ...prev, results: initialResults }));
    handleSearch(undefined, "Top rated tourist attractions and street food spots", "All");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              TE
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 hidden sm:block uppercase">
              TAMIL NADU <span className="text-blue-600">EXPLORE</span>
            </h1>
          </div>
          
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search.query}
                onChange={(e) => setSearch(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Where to today? e.g. 'Beach spots near Chennai'"
                className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100">
              <Navigation className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">Tamil Nadu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="md:hidden mb-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search.query}
              onChange={(e) => setSearch(prev => ({ ...prev, query: e.target.value }))}
              placeholder="What do you want to do?"
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </form>
        </div>

        <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 mb-12">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Discovery
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight uppercase">
              Don't ask "Where to go?" <br/>
              <span className="text-blue-400 italic font-serif">TAMIL NADU EXPLORE</span> knows.
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-lg">
              Discover handpicked spots and personalized recommendations for food, travel, and adventure across the state.
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleSearch(undefined, "Hidden nature spots in Tamil Nadu", Category.TRAVEL)}
                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
              >
                Plan My Weekend <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1580191947416-62d35a55e71d?q=80&w=800&auto=format&fit=crop" 
              alt="Temple Architecture" 
              className="w-full h-full object-cover opacity-40 mix-blend-overlay grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent"></div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Explore by Category</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  handleSearch(undefined, `Best ${cat.id} recommendations`, cat.id);
                }}
                className={`group p-4 rounded-2xl border transition-all duration-300 text-left active:scale-95 ${
                  search.category === cat.id 
                    ? 'border-blue-400 bg-blue-50 ring-4 ring-blue-100 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-slate-800 line-clamp-1">{cat.id}</div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Discover</div>
              </button>
            ))}
          </div>
        </div>

        <section ref={resultsRef} className="mb-20 scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              {search.category === 'All' ? 'Curated Picks' : `Top ${search.category}`}
              {search.isLoading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
            </h3>
            {search.results.length > 0 && (
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                {search.results.length} Found
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {search.results.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
            
            {search.isLoading && search.results.length < 3 && (
               Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl h-64 animate-pulse flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                </div>
              ))
            )}
          </div>

          {search.error && (
            <div className="mt-8 bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100 max-w-lg mx-auto">
              <p className="font-bold mb-2">Notice</p>
              <p className="text-sm opacity-80">{search.error}</p>
            </div>
          )}

          {!search.isLoading && search.results.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No spots found yet. Try searching for something specific!</p>
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => {
            const queries = ["Best street food in Sowcarpet", "Unique thrift stores Chennai", "Surfing lessons ECR", "Offbeat hill stations near Salem"];
            const randomQuery = queries[Math.floor(Math.random() * queries.length)];
            handleSearch(undefined, randomQuery, 'All');
          }}
          className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group flex items-center gap-3 border border-white/10 backdrop-blur-sm"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
             <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="pr-4 font-bold text-sm">Surprise Me!</span>
        </button>
      </div>

      <footer className="bg-white border-t border-slate-100 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">TE</div>
              <h1 className="text-lg font-bold text-slate-900 uppercase">TAMIL NADU EXPLORE</h1>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Your comprehensive guide to Tamil Nadu's treasures. We combine handpicked local favorites with real-time discovery.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Quick Discover</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => handleSearch(undefined, "Beaches near Chennai", Category.TRAVEL)} className="hover:text-blue-600 transition-colors">Beaches</button></li>
              <li><button onClick={() => handleSearch(undefined, "Hill stations in Tamil Nadu", Category.TRAVEL)} className="hover:text-blue-600 transition-colors">Hill Stations</button></li>
              <li><button onClick={() => handleSearch(undefined, "Best Biryani Chennai", Category.FOOD)} className="hover:text-blue-600 transition-colors">Street Food</button></li>
              <li><button onClick={() => handleSearch(undefined, "Hidden gems Kodaikanal", Category.TRAVEL)} className="hover:text-blue-600 transition-colors">Offbeat Spots</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">About</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Made for Tamil Nadu ❤️</li>
              <li>Hand-curated local spots</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-50 text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} TAMIL NADU EXPLORE. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
