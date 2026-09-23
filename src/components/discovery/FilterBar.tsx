import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { normalizeCity } from '../../lib/supabase';
import { Search, X, Sparkles, MapPin, Globe, ChevronRight } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    selectedCategories,
    toggleCategory,
    availableCategories,
    searchQuery,
    setSearchQuery,
    freeOnly,
    setFreeOnly,
    filteredEvents,
    setIsMatchModalOpen,
    selectedFormats,
    toggleFormat,
    selectedCity,
    events
  } = useApp();

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute live counts for current regional hub
  const regionalEvents = events.filter(e => 
    selectedCity === 'remote' ? true : normalizeCity(e.city) === normalizeCity(selectedCity)
  );
  const inPersonCount = regionalEvents.filter(e => e.mode === 'offline' || e.mode === 'both').length;
  const virtualCount = regionalEvents.filter(e => e.mode === 'online' || e.mode === 'both').length;

  // In mobile view: Place selected tags at the starting of the list so they are immediately visible without scrolling
  // In desktop view: Preserve the standard natural category order
  const displayCategories = React.useMemo(() => {
    if (!isMobile) {
      return availableCategories;
    }

    const activeSelected = selectedCategories.filter(c => c !== 'All Fields');
    if (activeSelected.length === 0) {
      return availableCategories;
    }

    // Active selected tags come first at the start!
    const unselected = availableCategories.filter(
      cat => cat !== 'All Fields' && !activeSelected.includes(cat)
    );

    return [
      ...activeSelected,
      ...(availableCategories.includes('All Fields') ? ['All Fields'] : []),
      ...unselected,
    ];
  }, [availableCategories, selectedCategories, isMobile]);

  // When a tag is selected in mobile view, smoothly scroll to start so the selected tag is instantly visible
  useEffect(() => {
    const activeSelected = selectedCategories.filter(c => c !== 'All Fields');
    if (isMobile && activeSelected.length > 0 && categoryScrollRef.current) {
      categoryScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedCategories, isMobile]);

  // On mobile view, give a gentle slide peek nudge after mount so the user immediately knows the tags can be slid
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        if (categoryScrollRef.current && !hasScrolled) {
          categoryScrollRef.current.scrollTo({ left: 45, behavior: 'smooth' });
          setTimeout(() => {
            if (categoryScrollRef.current && !hasScrolled) {
              categoryScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
          }, 650);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [hasScrolled]);

  return (
    <div className="w-full flex flex-col gap-2.5">
      
      {/* Row 1: Search & Match Compass Filter Tool */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, topics, organizers..."
            style={{ paddingLeft: '40px' }}
            className="w-full pl-10 pr-9 py-2 bg-white border border-zinc-200 rounded-xl text-xs sm:text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Compact Match Compass Tool */}
        <button
          type="button"
          onClick={() => setIsMatchModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-semibold transition-all shadow-2xs flex-shrink-0 group"
          title="Match Compass: Find gatherings suited for you"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-12 transition-transform" />
          <span className="hidden xs:inline">Match Compass</span>
          <span className="xs:hidden">Match</span>
        </button>
      </div>

      {/* Row 2: Compact Format Pills, Free Filter & Counter */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {/* Left: In-Person, Virtual, Free buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => toggleFormat('offline')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              selectedFormats.includes('offline')
                ? 'bg-rose-50 text-rose-800 border-rose-200 font-semibold shadow-2xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <MapPin className="w-3 h-3 text-rose-500" />
            <span>In-Person</span>
            <span className="text-[10px] font-mono opacity-70">({inPersonCount})</span>
          </button>

          <button
            type="button"
            onClick={() => toggleFormat('online')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              selectedFormats.includes('online')
                ? 'bg-sky-50 text-sky-800 border-sky-200 font-semibold shadow-2xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Globe className="w-3 h-3 text-sky-500" />
            <span>Virtual</span>
            <span className="text-[10px] font-mono opacity-70">({virtualCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFreeOnly(!freeOnly)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              freeOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold shadow-2xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${freeOnly ? 'bg-emerald-600' : 'bg-zinc-300'}`}></span>
            <span>Free Only</span>
          </button>
        </div>

        {/* Right: Event Count */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="text-[11px] text-zinc-500 font-medium px-2.5 py-1 bg-zinc-100/90 rounded-lg border border-zinc-200/70 whitespace-nowrap">
            <strong>{filteredEvents.length}</strong> events
          </div>
        </div>
      </div>

      {/* Row 3: Category Horizontal Scroll Pills with UX Slide Animation Hint */}
      <div className="relative w-full">
        <div 
          ref={categoryScrollRef}
          onScroll={() => {
            if (!hasScrolled) setHasScrolled(true);
          }}
          className="w-full overflow-x-auto pb-0.5 no-scrollbar flex items-center gap-1.5 scroll-smooth"
        >
          {displayCategories.map((cat) => {
            const isSelected = selectedCategories.includes(cat) || (cat === 'All Fields' && selectedCategories.filter(c => c !== 'All Fields').length === 0);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 inline-flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-white text-zinc-600 border border-zinc-200/90 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <span>{cat}</span>
                {isMobile && isSelected && cat !== 'All Fields' && (
                  <X className="w-3 h-3 ml-0.5 opacity-80 hover:opacity-100" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right edge subtle gradient fade and swipe cue for mobile */}
        <div 
          className={`sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-9 bg-gradient-to-l from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent flex items-center justify-end pr-0.5 transition-opacity duration-300 ${
            hasScrolled ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <ChevronRight className="w-3 h-3 text-indigo-500/80 animate-pulse" />
        </div>
      </div>

    </div>
  );
};
