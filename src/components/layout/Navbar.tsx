import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CITIES } from '../../data/mockData';
import { MapPin, Bookmark, Users, ChevronDown, Sparkles, ShieldCheck, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedCity, 
    events,
    savedEventIds, 
    setIsMatchModalOpen,
    setIsLocationPromptOpen,
    currentUser,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setIsAdminModalOpen
  } = useApp();

  const savedCount = useMemo(() => {
    return events.filter(e => savedEventIds.includes(e.id)).length;
  }, [events, savedEventIds]);

  const currentCityObj = CITIES.find(c => c.id === selectedCity) || CITIES[0];

  return (
    <header className="fixed top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl xl:max-w-6xl bg-white/95 backdrop-blur-md rounded-full border border-zinc-200/90 shadow-sm transition-all px-3 sm:px-5 md:px-6 py-1.5 sm:py-2">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brandmark & Logo */}
        <div 
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-indigo-700 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">radar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm sm:text-base tracking-tight text-zinc-900 leading-none whitespace-nowrap">PulseMeet</span>
            <span className="text-[9px] font-mono uppercase bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full border border-indigo-200/60 hidden lg:inline-block">Radar</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-zinc-100/90 rounded-full border border-zinc-200/80 flex-shrink-0">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            Explore Events
          </button>

          <button
            onClick={() => setIsMatchModalOpen(true)}
            className="px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/70 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span>Match Compass</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Community Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className={`text-[10px] lg:text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'saved' ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Location Radar Button & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 flex-shrink-0">
          
          {/* Prominent Regional Hub Selector (Opens Location Prompt Scanner) */}
          <button
            onClick={() => setIsLocationPromptOpen(true)}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-950 text-[11px] sm:text-xs font-semibold transition-all shadow-xs group flex-shrink-0 whitespace-nowrap"
            title="Click to scan another city or change region"
          >
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-600"></span>
            </span>
            <MapPin className="w-3 h-3 text-indigo-600 flex-shrink-0" />
            <span className="truncate max-w-[80px] xs:max-w-[110px] md:max-w-[130px] lg:max-w-none">{currentCityObj.name}</span>
            <ChevronDown className="w-2.5 h-2.5 text-indigo-500 group-hover:translate-y-0.5 transition-transform hidden xs:inline flex-shrink-0" />
          </button>

          {/* Super Admin Console Button */}
          {currentUser?.isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold shadow-2xs transition-all cursor-pointer flex-shrink-0"
              title="Open Super Admin User Directory"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="hidden xl:inline">Admin</span>
            </button>
          )}

          {/* Profile Avatar (Logged In) OR Sign In / Sign Up (Visitor) */}
          {currentUser ? (
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer p-0.5 sm:p-1 pr-2 sm:pr-3 rounded-full hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200 flex-shrink-0"
              title="View Profile & Personalization"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-indigo-500/30 overflow-hidden flex-shrink-0">
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[11px] sm:text-xs font-bold text-zinc-900 leading-tight whitespace-nowrap">
                  Hi, {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-zinc-500 font-medium leading-tight whitespace-nowrap hidden lg:inline max-w-[120px] truncate">
                  {currentUser.role}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-all cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
