
import React from 'react';
import { Recommendation, Category, PriceCategory } from '../types';
import { MapPin, Clock, Star, ExternalLink, Compass, Utensils, Calendar, Tv, ShoppingBag, Zap, Tag, ChevronRight } from 'lucide-react';

const CategoryIcon = ({ category }: { category: Category | string }) => {
  switch (category) {
    case Category.TRAVEL: return <Compass className="w-5 h-5 text-emerald-600" />;
    case Category.FOOD: return <Utensils className="w-5 h-5 text-orange-600" />;
    case Category.EVENTS: return <Calendar className="w-5 h-5 text-purple-600" />;
    case Category.ENTERTAINMENT: return <Tv className="w-5 h-5 text-pink-600" />;
    case Category.SHOPPING: return <ShoppingBag className="w-5 h-5 text-indigo-600" />;
    case Category.ADVENTURE: return <Zap className="w-5 h-5 text-amber-600" />;
    default: return <MapPin className="w-5 h-5 text-blue-600" />;
  }
};

const PriceBadge = ({ price }: { price: PriceCategory | string }) => {
  const styles: Record<string, string> = {
    'Free': 'bg-green-100 text-green-700 border-green-200',
    'Budget': 'bg-blue-100 text-blue-700 border-blue-200',
    'Mid-range': 'bg-amber-100 text-amber-700 border-amber-200',
    'Premium': 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[price] || 'bg-slate-100 border-slate-200 text-slate-700'} uppercase tracking-tight`}>
      {price}
    </span>
  );
};

export const RecommendationCard: React.FC<{ 
  item: Recommendation;
  onSelect?: (item: Recommendation) => void;
}> = ({ item, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect?.(item)}
      className="bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-6 flex flex-col h-full group cursor-pointer overflow-hidden relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 items-center">
          <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-orange-50 transition-colors">
            <CategoryIcon category={item.category} />
          </div>
          <PriceBadge price={item.priceCategory} />
        </div>
        {item.rating && (
          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-black border border-yellow-100">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            {item.rating}
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors uppercase tracking-tight">{item.name}</h3>
          {item.nameTamil && <span className="text-sm font-bold text-slate-400 mt-1">{item.nameTamil}</span>}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded-md uppercase tracking-widest">{item.district}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.area}</span>
        </div>
      </div>

      <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed mt-4 font-medium">{item.description}</p>
      
      <div className="mt-auto space-y-4">
        <div className="p-4 bg-slate-50/50 rounded-2xl space-y-2 border border-slate-100/50 group-hover:bg-white group-hover:border-orange-100 transition-all">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-orange-400" />
            <span className="truncate uppercase tracking-tight">{item.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {item.cost && (
              <div className="flex items-center gap-1.5 text-slate-700 text-[10px] font-black uppercase tracking-tight">
                <Tag className="w-3.5 h-3.5 text-orange-500" />
                <span>{item.cost}</span>
              </div>
            )}
            {item.bestTime && (
              <div className="flex items-center gap-1.5 text-slate-700 text-[10px] font-black uppercase tracking-tight">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{item.bestTime}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {item.links?.slice(0, 3).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                 <ExternalLink className="w-2 h-2 text-slate-400" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black text-orange-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            View Detail <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
