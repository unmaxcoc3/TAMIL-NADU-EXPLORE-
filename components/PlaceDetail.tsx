
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Tag, Star, ExternalLink, Compass, Sparkles, Loader2, Share2, Heart, Info, Landmark } from 'lucide-react';
import { Recommendation, Language } from '../types';
import { translations } from '../translations';
import { generatePlaceImage } from '../services/geminiService';

interface PlaceDetailProps {
  item: Recommendation;
  lang: Language;
  onBack: () => void;
}

export const PlaceDetail: React.FC<PlaceDetailProps> = ({ item, lang, onBack }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(item.imageUrl || null);
  const [loadingImage, setLoadingImage] = useState(!item.imageUrl);
  const t = translations[lang];

  useEffect(() => {
    if (!item.imageUrl) {
      const fetchImage = async () => {
        try {
          const generated = await generatePlaceImage(item.name, item.description);
          setImageUrl(generated);
        } finally {
          setLoadingImage(false);
        }
      };
      fetchImage();
    }
  }, [item.name, item.description, item.imageUrl]);

  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          {loadingImage ? (
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <span className="text-xs font-black uppercase tracking-widest">{t.generatingImage}</span>
            </div>
          ) : (
            <img 
              src={imageUrl || ''} 
              alt={item.name}
              className="w-full h-full object-cover animate-in zoom-in duration-1000"
            />
          )}
        </div>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
        
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </button>
          
          <div className="flex gap-2">
            <button className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all group">
              <Heart className="w-4 h-4 group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-lg">
                  {item.category}
                </span>
                {item.rating && (
                  <div className="flex items-center gap-1 bg-yellow-500 text-slate-900 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                    <Star className="w-3 h-3 fill-slate-900" /> {item.rating}
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-white leading-tight uppercase tracking-tighter">
                {item.name}
              </h1>
              {item.nameTamil && (
                <span className="text-xl md:text-3xl font-bold text-orange-400">
                  {item.nameTamil}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-2xl p-4 rounded-3xl border border-white/20 text-white">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                 <MapPin className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Location</p>
                 <p className="text-sm font-bold">{item.area}, {item.district}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Detailed Info */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-orange-600 rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.overview}</h2>
              </div>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                {item.description}
              </p>
            </section>

            <section className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-10">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI Curated Insight</h3>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                Experience the authentic essence of {item.name}. Local travelers recommend visiting {item.bestTime} to truly capture the spirit of the area. 
                Whether you are exploring its {item.category.toLowerCase()} or simply taking in the local atmosphere of {item.area}, it stands as a testament 
                to Tamil Nadu's diverse cultural landscape.
              </p>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">{t.practicalInfo}</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Cost Details</p>
                    <p className="text-sm font-bold">{item.cost || item.priceCategory}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Best Time</p>
                    <p className="text-sm font-bold">{item.bestTime || 'Anytime'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Category</p>
                    <p className="text-sm font-bold">{item.category}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  <span className="font-black text-orange-500 uppercase">Tip:</span> Use local transport like autos or buses for the most authentic experience in {item.area}.
                </p>
              </div>
            </div>

            {item.links && item.links.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-orange-500" /> {t.relatedLinks}
                </h4>
                <div className="space-y-3">
                  {item.links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 rounded-2xl border border-transparent hover:border-orange-100 transition-all group"
                    >
                      <span className="text-xs font-bold text-slate-600 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {link.title}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-orange-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
