
import React from 'react';
import { Recommendation, Category, PriceCategory } from '../types';
import { MapPin, Clock, Star, ExternalLink, Compass, Utensils, Calendar, Tv, ShoppingBag, Zap, Tag } from 'lucide-react';

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

export const RecommendationCard: React.FC<{ item: Recommendation }> = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 items-center">
          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
            <CategoryIcon category={item.category} />
          </div>
          <PriceBadge price={item.priceCategory} />
        </div>
        {item.rating && (
          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-sm font-medium border border-yellow-100">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            {item.rating}
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">{item.name}</h3>
          {item.nameTamil && <span className="text-sm font-medium text-slate-400 mt-0.5">{item.nameTamil}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{item.district}</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{item.area}</span>
        </div>
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed mt-2">{item.description}</p>
      
      <div className="mt-auto space-y-3">
        <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100/50">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate italic">{item.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {item.cost && (
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                <Tag className="w-3.5 h-3.5 text-orange-400" />
                <span>{item.cost}</span>
              </div>
            )}
            {item.bestTime && (
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{item.bestTime}</span>
              </div>
            )}
          </div>
        </div>

        {item.links && item.links.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            {item.links.map((link, idx) => (
              <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm">
                Source <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
