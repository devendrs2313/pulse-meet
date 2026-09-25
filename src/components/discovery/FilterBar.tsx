import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { normalizeCity } from '../../lib/supabase';
import { Search, X, SlidersHorizontal } from 'lucide-react';

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
    selectedFormats,
    toggleFormat,
    selectedCity,
    events
  } = useApp();

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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

  const getCategoryCount = (cat: string) => {
    if (cat === 'All Fields' || cat === 'All') return regionalEvents.length;
    return regionalEvents.filter(e => 
      e.categories?.some(c => c.toLowerCase().includes(cat.toLowerCase()))
    ).length;
  };

  // In mobile view: Place selected tags at the starting of the list
  const displayCategories = React.useMemo(() => {
    if (!isMobile) {
      return availableCategories;
    }

    const activeSelected = selectedCategories.filter(c => c !== 'All Fields');
    if (activeSelected.length === 0) {
      return availableCategories;
    }

    const unselected = availableCategories.filter(
      cat => cat !== 'All Fields' && !activeSelected.includes(cat)
    );

    return [
      ...activeSelected,
      ...(availableCategories.includes('All Fields') ? ['All Fields'] : []),
      ...unselected,
    ];
  }, [availableCategories, selectedCategories, isMobile]);

  useEffect(() => {
    const activeSelected = selectedCategories.filter(c => c !== 'All Fields');
    if (isMobile && activeSelected.length > 0 && categoryScrollRef.current) {
      categoryScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedCategories, isMobile]);

  return (
    <div className="w-full flex flex-col gap-2.5">
      
      {/* Row 1: Category Horizontal Scroll Pills with Live Counts (Image 1 Style) */}
      <div className="relative w-full">
        <div 
          ref={categoryScrollRef}
          onScroll={() => {
            if (!hasScrolled) setHasScrolled(true);
          }}
          className="w-full overflow-x-auto pb-0.5 no-scrollbar flex items-center gap-2 scroll-smooth"
        >
          {/* "All [TotalCount]" Pill */}
          <button
            type="button"
            onClick={() => toggleCategory('All Fields')}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex-shrink-0 inline-flex items-center gap-1.5 ${
              selectedCategories.includes('All Fields') || selectedCategories.length === 0
                ? 'bg-zinc-900 text-white font-bold shadow-xs'
                : 'bg-white text-zinc-700 border border-zinc-200/90 font-medium hover:bg-zinc-50'
            }`}
          >
            <span>All</span>
            <span className={selectedCategories.includes('All Fields') || selectedCategories.length === 0 ? 'text-zinc-300 font-mono text-[11px]' : 'text-zinc-400 font-mono text-[11px]'}>
              {regionalEvents.length}
            </span>
          </button>

          {/* Individual Category Pills with Counts */}
          {displayCategories.filter(c => c !== 'All Fields').map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            const count = getCategoryCount(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex-shrink-0 inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-900 text-white font-bold shadow-xs'
                    : 'bg-white text-zinc-700 border border-zinc-200/90 font-medium hover:bg-zinc-50'
                }`}
              >
                <span>{cat}</span>
                <span className={isSelected ? 'text-zinc-300 font-mono text-[11px]' : 'text-zinc-400 font-mono text-[11px]'}>
                  {count}
                </span>
                {isMobile && isSelected && (
                  <X className="w-3 h-3 ml-0.5 opacity-80 hover:opacity-100" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: "Filters" Pill Button (Image 1 Style) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              showFilters || selectedFormats.length > 0 || freeOnly || searchQuery
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white text-zinc-700 border-zinc-200/90 hover:bg-zinc-50 shadow-2xs'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(selectedFormats.length > 0 || freeOnly || searchQuery) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Direct Format quick pills when filters is open or active */}
          {(showFilters || selectedFormats.length > 0 || freeOnly) && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => toggleFormat('offline')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  selectedFormats.includes('offline')
                    ? 'bg-rose-50 text-rose-800 border-rose-200 font-semibold shadow-2xs'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                In-Person ({inPersonCount})
              </button>
              <button
                type="button"
                onClick={() => toggleFormat('online')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  selectedFormats.includes('online')
                    ? 'bg-sky-50 text-sky-800 border-sky-200 font-semibold shadow-2xs'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Virtual ({virtualCount})
              </button>
              <button
                type="button"
                onClick={() => setFreeOnly(!freeOnly)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  freeOnly
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold shadow-2xs'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Free
              </button>
            </div>
          )}
        </div>

        {/* Counter */}
        <div className="text-[11px] font-mono text-zinc-400 flex-shrink-0">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'gathering' : 'gatherings'}
        </div>
      </div>

      {/* Row 3: Search input (Expanded when Filters is clicked or user starts typing) */}
      {(showFilters || searchQuery) && (
        <div className="relative w-full mt-1 animate-in fade-in duration-200">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, topics, organizers..."
            style={{ paddingLeft: '40px' }}
            className="w-full pl-10 pr-9 py-2 bg-white border border-zinc-200/90 rounded-full text-xs sm:text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

    </div>
  );
};
