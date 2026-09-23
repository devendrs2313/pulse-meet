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
import { NotificationConfigModal } from './components/notification/NotificationConfigModal';
import { Compass, RotateCcw, CheckCircle2, MapPin, Radar, ListTree, LayoutGrid, Bot, X } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    activeTab, 
    filteredEvents, 
    selectedCity, 
    notifyToast,
    setNotifyToast,
    setIsLocationPromptOpen,
    setSelectedVibe,
    setModeFilter,
    setSelectedCategory,
    setSearchQuery,
    setFreeOnly,
    currentUser,
    isAIConciergeOpen,
    setIsAIConciergeOpen
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
      <main className="w-full pt-14 sm:pt-16 flex-1">
        
        {/* VIEW 1: DISCOVER FEED */}
        {activeTab === 'explore' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 pt-2 pb-6 sm:py-6">
            
            {/* Ambient Background Radial Glow */}
            <div className="relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-gradient-to-b from-indigo-100/40 via-emerald-50/15 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

              {/* Clean Streamlined Header */}
              <div className="pt-1 pb-3 sm:pb-4 flex flex-col justify-between gap-2 border-b border-zinc-200/80 mb-4 sm:mb-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200/80 text-zinc-600 shadow-2xs">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wide">
                        Live Radar · {currentCityObj.name}
                      </span>
                    </div>

                    {/* Active Region Scanner Button (desktop view) */}
                    <button
                      onClick={() => setIsLocationPromptOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 text-xs font-semibold transition-all shadow-2xs"
                    >
                      <MapPin className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                      <span>{currentCityObj.name}</span>
                      <span className="text-[10px] text-indigo-600 underline ml-0.5">Change</span>
                    </button>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 leading-snug">
                    {currentUser ? (
                      <span className="flex items-center gap-2 flex-wrap">
                        <span>Hi {currentUser.name.split(' ')[0]} 👋</span>
                        <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                          {currentUser.role}
                        </span>
                      </span>
                    ) : (
                      `Curated Event Gatherings in ${currentCityObj.name}`
                    )}
                  </h1>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {currentUser 
                      ? `Your personalized radar is locked on ${currentCityObj.name} · Filtering for ${currentUser.formats.length === 2 ? 'In-Person & Virtual' : currentUser.formats[0]} events`
                      : `Indexed across Luma, Meetup, LinkedIn & Community Calendars`
                    }
                  </p>
                </div>
              </div>

              {/* Unified Filter Suite */}
              <div className="mb-4 sm:mb-5">
                <FilterBar />
              </div>

              {/* Sleek 1-Line Timeline / Grid Toggle Strip */}
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Scheduled Timeline ({filteredEvents.length})</span>
                </div>

                {/* View mode toggle: Timeline vs Grid */}
                <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/70">
                  <button
                    type="button"
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === 'timeline'
                        ? 'bg-white text-zinc-900 shadow-2xs border border-zinc-200/70'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="Timeline view with date segregation"
                  >
                    <ListTree className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden xs:inline">Timeline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-zinc-900 shadow-2xs border border-zinc-200/70'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="Card grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="hidden xs:inline">Grid</span>
                  </button>
                </div>
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
      <EventDetailModal />

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
            AI Concierge & Alerts
          </span>
        </button>
      )}

      {/* AI Event Concierge Chat Modal */}
      <AIChatConciergeModal />

      {/* Email Notification Configuration & Approval Request Modal */}
      <NotificationConfigModal />

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
