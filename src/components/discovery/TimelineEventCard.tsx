import React, { useState } from 'react';
import { EventItem } from '../../types/event';
import { useApp } from '../../context/AppContext';
import { isValidHttpUrl } from '../../lib/urlUtils';
import { 
  MapPin, 
  Globe, 
  Bookmark, 
  CheckCircle2, 
  CalendarPlus, 
  Share2, 
  Check, 
  Sparkles
} from 'lucide-react';

interface TimelineEventCardProps {
  event: EventItem;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event }) => {
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

  // Extract clean starting time
  const formattedStartTime = (() => {
    if (event.isoDate) {
      const d = new Date(event.isoDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    }
    if (event.time) {
      return event.time.split('–')[0].split('-')[0].trim();
    }
    return '10:00 AM';
  })();

  return (
    <div 
      onClick={() => setActiveEventDetail(event)}
      className="group relative bg-white rounded-2xl border border-zinc-200/90 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all p-4 sm:p-5 cursor-pointer w-full max-w-full overflow-hidden"
    >
      {/* Top Row: Time, Title, Organizer on the left, Square Thumbnail on the right */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Time & NEW / Reserved Badges */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs sm:text-sm font-mono font-medium text-zinc-500">
              {formattedStartTime}
            </span>
            {event.isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-2xs border border-amber-300">
                <Sparkles className="w-2.5 h-2.5 fill-amber-950" />
                <span>NEW</span>
              </span>
            )}
            {isBooked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                <Check className="w-2.5 h-2.5" /> Reserved
              </span>
            )}
          </div>

          {/* Event Title */}
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
            {event.title}
          </h3>

          {/* Organizer */}
          <div className="text-xs text-zinc-500 mt-1 truncate flex items-center gap-1">
            <span>
              By {typeof event.organizer === 'object' && event.organizer?.name ? event.organizer.name : (typeof event.organizer === 'string' ? event.organizer : 'Community Host')}
            </span>
            {(typeof event.organizer === 'object' && event.organizer?.verified) && (
              <CheckCircle2 className="w-3 h-3 text-indigo-600 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Square Rounded Thumbnail (Matches Lovable Mobile Layout) */}
        {event.bannerUrl && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 ml-2 shadow-2xs border border-zinc-100">
            <img 
              src={event.bannerUrl} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </div>

      {/* Excerpt / Subtitle */}
      <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
        {event.tagline}
      </p>

      {/* Location / Venue */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2 truncate">
        {event.mode === 'online' ? (
          <Globe className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
        ) : (
          <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
        )}
        <span className="truncate">
          {event.mode === 'online' ? 'Virtual event' : (event.venue || `${event.area || event.city}`)}
        </span>
      </div>

      {/* Bottom Metadata & Actions Strip */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-100 flex-wrap">
        {/* Pills: Mode, Category, Price */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {event.mode === 'offline' && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200/60">
              IN PERSON
            </span>
          )}
          {event.mode === 'online' && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200/60">
              VIRTUAL
            </span>
          )}
          {event.mode === 'both' && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200/60">
              HYBRID
            </span>
          )}

          {event.categories && event.categories.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200/60">
              {event.categories[0].toUpperCase()}
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200/60">
            {event.price}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Calendar */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCalendarMenuOpen(!isCalendarMenuOpen);
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Add to calendar"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
            </button>
            {isCalendarMenuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full right-0 mb-2 w-44 bg-white rounded-xl shadow-xl border border-zinc-200 p-1.5 z-30 text-xs"
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
                  <span>Apple / Outlook (.ics)</span>
                </button>
              </div>
            )}
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            title="Share event"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveEvent(event.id);
            }}
            className={`p-1 rounded-md transition-colors ${
              isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save event'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Direct Visit / Details Button */}
          {hasValidUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveEventDetail(event);
              }}
              className="ml-1 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              title="View event details & booking"
            >
              <span>Book ↗</span>
            </button>
          ) : (
            <span className="ml-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 text-zinc-400">
              Link Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
