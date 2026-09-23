import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CITIES } from '../../data/mockData';
import { MapPin, Bell, Bookmark, Users, ChevronDown, Sparkles, ShieldCheck, UserPlus, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedCity, 
    savedEventIds, 
    setIsMatchModalOpen,
    setIsLocationPromptOpen,
    currentUser,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setIsAdminModalOpen,
    openNotificationModal
  } = useApp();

  const [showNudge, setShowNudge] = useState<boolean>(() => {
    return !sessionStorage.getItem('pulse_bell_nudged');
  });
  const notifyRef = useRef<HTMLDivElement>(null);

  const currentCityObj = CITIES.find(c => c.id === selectedCity) || CITIES[0];

  // Auto-close nudge after 6 seconds
  useEffect(() => {
    if (!showNudge) return;
    const timer = setTimeout(() => {
      setShowNudge(false);
      sessionStorage.setItem('pulse_bell_nudged', 'true');
    }, 6000);
    return () => clearTimeout(timer);
  }, [showNudge]);

  const dismissNudge = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowNudge(false);
    sessionStorage.setItem('pulse_bell_nudged', 'true');
  };

  const handleOpenNotificationConfig = () => {
    dismissNudge();
    openNotificationModal({ city: selectedCity });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm transition-all">
      <div className="h-14 sm:h-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brandmark & Logo */}
        <div 
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
            <span className="material-symbols-outlined text-[18px] sm:text-[22px]">radar</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base sm:text-lg tracking-tight text-zinc-900 leading-tight">PulseMeet</span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded-full border border-indigo-200/60">Radar</span>
            </div>
            <span className="text-xs text-zinc-500 font-normal hidden sm:inline">Curated event gatherings</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-zinc-100 rounded-full border border-zinc-200/80">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            Explore Events
          </button>

          <button
            onClick={() => setIsMatchModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/70 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Match Compass</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
            {savedEventIds.length > 0 && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'saved' ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {savedEventIds.length}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Location Radar Button & Notifications */}
        {/* Right: Location Radar Button & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          
          {/* Prominent Regional Hub Selector (Opens Location Prompt Scanner) */}
          <button
            onClick={() => setIsLocationPromptOpen(true)}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-950 text-[11px] sm:text-xs font-semibold transition-all shadow-xs group"
            title="Click to scan another city or change region"
          >
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-600"></span>
            </span>
            <MapPin className="w-3 h-3 text-indigo-600 flex-shrink-0" />
            <span className="truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">{currentCityObj.name}</span>
            <ChevronDown className="w-2.5 h-2.5 text-indigo-500 group-hover:translate-y-0.5 transition-transform hidden xs:inline" />
          </button>

          {/* Quick Notification Bell with Nudge Animation */}
          <div className="relative" ref={notifyRef}>
            <button
              onClick={handleOpenNotificationConfig}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all relative ${
                showNudge 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-300 ring-2 ring-indigo-500/30 shadow-xs' 
                  : 'bg-zinc-100 hover:bg-zinc-200/70 border-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
              title="Configure Radar Alerts & Email Notifications"
            >
              <Bell className={`w-3.5 h-3.5 ${showNudge ? 'animate-bell-nudge text-indigo-600' : ''}`} />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </button>

            {/* Nudge Tooltip / Speech Bubble (Auto-closes after 6s or on dismiss) */}
            {showNudge && (
              <div 
                onClick={handleOpenNotificationConfig}
                className="absolute right-0 top-full mt-2.5 w-64 sm:w-72 bg-zinc-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-zinc-700/80 z-50 cursor-pointer animate-in fade-in slide-in-from-top-2 duration-300"
              >
                {/* Arrow pointing up */}
                <div className="absolute -top-1.5 right-3 w-3 h-3 bg-zinc-900 rotate-45 border-t border-l border-zinc-700/80" />

                <div className="flex items-center justify-between gap-1.5 relative z-10">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Configure Radar Alerts</span>
                  </div>
                  <button
                    type="button"
                    onClick={dismissNudge}
                    className="text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-[11px] text-zinc-200 mt-1 leading-normal relative z-10">
                  Get instant email alerts when new gatherings drop in <strong>{currentCityObj.name}</strong>.
                </p>

                <div className="mt-2 text-[10px] font-semibold text-indigo-300 flex items-center gap-1 relative z-10">
                  <span>Click to configure your notifications</span>
                  <span>→</span>
                </div>
              </div>
            )}
          </div>

          {/* Super Admin Console Button */}
          {currentUser?.isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold shadow-2xs transition-all cursor-pointer flex-shrink-0"
              title="Open Super Admin User Directory"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="hidden xs:inline">Admin</span>
            </button>
          )}

          {/* Profile Avatar (Logged In) OR Sign In / Sign Up (Visitor) */}
          {currentUser ? (
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 cursor-pointer p-0.5 sm:p-1 pr-1.5 sm:pr-2.5 rounded-full hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200"
              title="View Profile & Personalization"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-indigo-500/30 overflow-hidden flex-shrink-0">
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] sm:text-xs font-bold text-zinc-900 leading-tight">
                  Hi, {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-zinc-500 font-medium leading-tight hidden sm:inline">
                  {currentUser.role}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all items-center gap-1 cursor-pointer"
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
