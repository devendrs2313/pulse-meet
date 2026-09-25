import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { CITIES } from './data/mockData';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { FilterBar } from './components/discovery/FilterBar';
import { EventCard } from './components/discovery/EventCard';
import { TimelineView } from './components/discovery/TimelineView';
import { CommunityRadarView } from './components/radar/CommunityRadarView';
import { SavedEventsView } from './components/saved/SavedEventsView';
import { MatchModal } from './components/compass/MatchModal';
import { EventDetailModal } from './components/modal/EventDetailModal';
import { LocationPromptModal } from './components/location/LocationPromptModal';
import { BookingModal } from './components/booking/BookingModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { AIChatConciergeModal } from './components/ai/AIChatConciergeModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Compass, RotateCcw, CheckCircle2, MapPin, Radar, ListTree, LayoutGrid, Bot, X, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    activeTab, 
    filteredEvents, 
    selectedCity, 
    notifyToast,
    setNotifyToast,
    setIsLocationPromptOpen,
    setIsMatchModalOpen,
    setSelectedVibe,
    setModeFilter,
    setSelectedCategory,
    setSearchQuery,
    setFreeOnly,
    currentUser,
    isAIConciergeOpen,
    setIsAIConciergeOpen,
    activeEventDetail,
    setActiveEventDetail
  } = useApp();

  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  const handleResetFilters = () => {
    setSelectedVibe('all');
    setModeFilter('all');
    setSelectedCategory('All Fields');
    setSearchQuery('');
    setFreeOnly(false);
  };

  const currentCityObj = CITIES.find(c => c.id === selectedCity) || CITIES[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#27272A] flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-20 md:pb-10">
      
      {/* Top Fixed Header */}
      <Navbar />

      {/* Floating Notification Toast (Auto-closing with dismiss button) */}
      {notifyToast && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium shadow-2xl flex items-center gap-2.5 border border-zinc-800 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="whitespace-nowrap">{notifyToast}</span>
          <button 
            type="button"
            onClick={() => setNotifyToast(null)}
            className="ml-1 p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full pt-20 sm:pt-24 flex-1">
        
        {/* VIEW 1: DISCOVER FEED */}
        {activeTab === 'explore' && (
          <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-10">
            
            {/* Ambient Background Radial Glow */}
            <div className="relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-44 bg-gradient-to-b from-indigo-100/30 via-emerald-50/15 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

              {/* Lovable Top Header: "Events" + 4-Icon View/Location Control Pill (Image 1 Style) */}
              <div className="pt-2 pb-3 sm:pb-4 flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-none">
                    {currentUser ? `Events for ${currentUser.name.split(' ')[0]}` : 'Events'}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/80 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{currentCityObj.name}</span>
                  </span>
                </div>

                {/* 4-Icon Control Pill (Image 1 Style: Card / List / Map / Match) */}
                <div className="inline-flex items-center bg-white p-1 rounded-full border border-zinc-200/90 shadow-2xs gap-0.5">
                  {/* Grid View */}
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                      viewMode === 'grid'
                        ? 'bg-zinc-900 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>

                  {/* Timeline View */}
                  <button
                    type="button"
                    onClick={() => setViewMode('timeline')}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                      viewMode === 'timeline'
                        ? 'bg-zinc-900 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="Timeline Calendar View"
                  >
                    <ListTree className="w-3.5 h-3.5" />
                  </button>

                  {/* Region Picker */}
                  <button
                    type="button"
                    onClick={() => setIsLocationPromptOpen(true)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                    title={`Current City: ${currentCityObj.name}. Click to change.`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  {/* Match Compass */}
                  <button
                    type="button"
                    onClick={() => setIsMatchModalOpen(true)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                    title="Match Compass AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                </div>
              </div>

              {/* Lovable Category & Filter Strip */}
              <div className="mb-5 sm:mb-6">
                <FilterBar />
              </div>

              {/* Event Feed: Timeline View or Grid View */}
              {filteredEvents.length > 0 ? (
                viewMode === 'timeline' ? (
                  <TimelineView events={filteredEvents} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event, index) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        featured={index === 0}
                      />
                    ))}
                  </div>
                )
              ) : (
                /* Empty state when no events match filters */
                <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200/80 max-w-lg mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1">
                    No gatherings found in {currentCityObj.name} matching these filters
                  </h3>
                  <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
                    Try switching format to "Both (In-person + Online)" or click below to scan another region.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 shadow-xs transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                    <button
                      onClick={() => setIsLocationPromptOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
                    >
                      <Radar className="w-3.5 h-3.5" />
                      <span>Scan Another City</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* VIEW 2: COMMUNITY RADAR */}
        {activeTab === 'radar' && <CommunityRadarView />}

        {/* VIEW 3: SAVED EVENTS */}
        {activeTab === 'saved' && <SavedEventsView />}

      </main>

      {/* Mandatory / On-Demand Location Prompt Scanner Modal */}
      <LocationPromptModal />

      {/* 1-Click Booking & Verified Link Pass Modal */}
      <BookingModal />

      {/* Match Compass Onboarding Wizard Modal */}
      <MatchModal />

      {/* Deep Dive Event Details Modal */}
      <ErrorBoundary 
        key={activeEventDetail?.id || 'none'} 
        resetKey={activeEventDetail?.id} 
        isModal 
        fallbackTitle="Event Details Unavailable" 
        onReset={() => setActiveEventDetail(null)}
      >
        <EventDetailModal />
      </ErrorBoundary>

      {/* User Authentication & Profile Registration Modal */}
      <AuthModal />

      {/* Profile Management & Automation Modal */}
      <ProfileModal />

      {/* Super Admin Console Directory Modal */}
      <AdminDashboardModal />

      {/* Floating AI Event Concierge Trigger Button */}
      {!isAIConciergeOpen && (
        <button
          type="button"
          onClick={() => setIsAIConciergeOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          title="Chat with PulseAI Event Concierge"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-600 animate-pulse" />
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            PulseAI Concierge
          </span>
        </button>
      )}

      {/* AI Event Concierge Chat Modal */}
      <AIChatConciergeModal />

      {/* Mobile Bottom Dock Navigation */}
      <MobileNav />

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white/60 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">PulseMeet</span>
            <span>·</span>
            <span>High-signal tech event radar for modern builders</span>
          </div>
          <div className="font-mono text-[11px] text-zinc-400">
            Powered by Stitch Design System · Hack2skill
          </div>
        </div>
      </footer>

    </div>
  );
};
