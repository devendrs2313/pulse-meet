import React, { useState } from 'react';
import { EventItem } from '../../types/event';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  ChevronDown,
  CalendarPlus,
  Share2,
  Check,
  Sparkles
} from 'lucide-react';

import { isValidHttpUrl } from '../../lib/urlUtils';

interface EventCardProps {
  event: EventItem;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const { 
    isEventSaved, 
    toggleSaveEvent, 
    setActiveEventDetail, 
    isEventBooked,
    addToGoogleCalendar, 
    downloadIcsFile,
    setNotifyToast
  } = useApp();

  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const isSaved = isEventSaved(event.id);
  const isBooked = isEventBooked(event.id);
  const hasValidUrl = isValidHttpUrl(event.rsvpUrl);

  const orgName = (typeof event.organizer === 'object' && event.organizer?.name) ? event.organizer.name : (typeof event.organizer === 'string' ? event.organizer : 'Community Host');
  const orgAvatar = (typeof event.organizer === 'object' && event.organizer?.avatar) ? event.organizer.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
  const orgVerified = typeof event.organizer === 'object' ? Boolean(event.organizer?.verified) : false;
  const orgCadence = (typeof event.organizer === 'object' && event.organizer?.cadenceBadge) ? event.organizer.cadenceBadge : 'Curated';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.tagline,
        url: event.rsvpUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(event.rsvpUrl);
      setNotifyToast('RSVP link copied to clipboard!');
      setTimeout(() => setNotifyToast(null), 2500);
    }
  };

  // Seat percentage calculation
  const seatsPercent = event.seats ? Math.round((event.seats.filled / event.seats.total) * 100) : 0;
  const isScare = seatsPercent >= 80;

  return (
    <div 
      onClick={() => setActiveEventDetail(event)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
        featured
          ? 'border-indigo-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ring-1 ring-indigo-500/10'
          : 'border-zinc-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Top Banner Image */}
      {event.bannerUrl && (
        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-zinc-100">
          <img 
            src={event.bannerUrl} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Badges on top banner */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {/* Mode Badge & NEW Tag */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {event.isNew && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 backdrop-blur-md shadow-md shadow-amber-500/30 border border-amber-300 ring-2 ring-amber-400/20 animate-pulse">
                  <Sparkles className="w-3 h-3 fill-amber-950" />
                  <span>NEW</span>
                </span>
              )}
              {event.mode === 'offline' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-rose-700 backdrop-blur-md shadow-sm">
                  <MapPin className="w-3 h-3" />
                  <span>In-Person · {event.area || event.city}</span>
                </span>
              )}
              {event.mode === 'online' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-sky-700 backdrop-blur-md shadow-sm">
                  <Globe className="w-3 h-3" />
                  <span>Virtual / Online</span>
                </span>
              )}
              {event.mode === 'both' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-amber-800 backdrop-blur-md shadow-sm">
                  <MapPin className="w-3 h-3 text-rose-600" />
                  <span>Hybrid (Venue + Live)</span>
                </span>
              )}
            </div>

            {/* Platform & Bookmark buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20">
                {event.sourcePlatform}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveEvent(event.id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                  isSaved
                    ? 'bg-indigo-600 text-white'
                    : 'bg-black/40 hover:bg-black/60 text-white'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save event'}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Bottom Banner Row: Price & Scarcity */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold px-2 py-0.5 rounded bg-emerald-600/95 backdrop-blur-sm shadow-xs">
                {event.price}
              </span>
              {isBooked && (
                <span className="font-semibold px-2 py-0.5 rounded bg-indigo-600/95 backdrop-blur-sm text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Pass Reserved
                </span>
              )}
            </div>

            {event.seats && (
              <span className={`px-2 py-0.5 rounded font-mono font-medium ${
                isScare ? 'bg-rose-600/95' : 'bg-black/60'
              }`}>
                {event.seats.total - event.seats.filled} spots left
              </span>
            )}
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Organizer Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <img 
                src={orgAvatar} 
                alt={orgName}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-200"
              />
              <span className="text-xs font-medium text-zinc-700 truncate">{orgName}</span>
              {orgVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              )}
            </div>

            {/* Cadence indicator & NEW tag */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {event.isNew && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-xs border border-amber-300 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 fill-amber-950" />
                  <span>NEW</span>
                </span>
              )}
              <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200/60 truncate">
                {orgCadence}
              </span>
            </div>
          </div>

          {/* Title & Tagline */}
          <h3 className="font-semibold text-base text-zinc-900 leading-snug group-hover:text-indigo-600 transition-colors mb-1.5 line-clamp-2">
            {event.title}
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-3">
            {event.tagline}
          </p>

          {/* Date, Time & Venue */}
          <div className="space-y-1.5 mb-4 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="font-medium text-zinc-800">{event.date}</span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-500">{event.time}</span>
            </div>

            {event.venue && (
              <div className="flex items-center gap-2 text-zinc-500 truncate">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                {event.venueUrl ? (
                  <a
                    href={event.venueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="truncate text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 group/venue font-medium"
                    title="Open location in Maps"
                  >
                    <span className="truncate">{event.venue}</span>
                    <ExternalLink className="w-3 h-3 text-indigo-500 flex-shrink-0 group-hover/venue:translate-x-0.5 transition-transform" />
                  </a>
                ) : (
                  <span className="truncate">{event.venue}</span>
                )}
              </div>
            )}
          </div>

          {/* Categories / Tech Stack Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {event.categories.map(cat => (
              <span 
                key={cat}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200/50"
              >
                #{cat}
              </span>
            ))}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-2">
          
          {/* Left: Add to Calendar & Share buttons */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCalendarMenuOpen(!isCalendarMenuOpen);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/70 transition-colors"
              title="Add to your calendar"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Cal</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Calendar popup options */}
            {isCalendarMenuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 p-1.5 z-30 text-xs"
              >
                <button
                  onClick={() => {
                    addToGoogleCalendar(event);
                    setIsCalendarMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-900 transition-colors flex items-center gap-2 font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Google Calendar</span>
                </button>
                <button
                  onClick={() => {
                    downloadIcsFile(event);
                    setIsCalendarMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-900 transition-colors flex items-center gap-2 font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Apple / iCal (.ics)</span>
                </button>
              </div>
            )}

            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Share event link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Direct Visit / Book Button */}
          <div>
            {hasValidUrl ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveEventDetail(event);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xs hover:shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                title="View event details & booking"
              >
                <span>Book ↗</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-400">
                Link Pending
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
