import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EventCard } from '../discovery/EventCard';
import { Bookmark, Compass } from 'lucide-react';

export const SavedEventsView: React.FC = () => {
  const { events, savedEventIds, setActiveTab } = useApp();

  const savedEvents = useMemo(() => {
    return events.filter(e => savedEventIds.includes(e.id));
  }, [events, savedEventIds]);

  return (
    <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      
      {/* Header */}
      <div className="max-w-3xl mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 sm:mb-3 border border-indigo-200/60 shadow-2xs">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Your Curated Itinerary</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 leading-tight">
          Saved Events & RSVPs {savedEvents.length > 0 ? `(${savedEvents.length})` : ''}
        </h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Keep track of upcoming bootcamps, community meetups, and hackathons you plan to attend. 1-click sync them with your calendar.
        </p>
      </div>

      {/* Events Grid or Empty State */}
      {savedEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {savedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200/80 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">
            No saved events yet
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
            Browse the discovery feed and tap the bookmark icon on any meetup or bootcamp to save it to your radar.
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Start Exploring Gatherings</span>
          </button>
        </div>
      )}

    </div>
  );
};
