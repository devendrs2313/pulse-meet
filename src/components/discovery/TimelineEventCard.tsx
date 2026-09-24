import React, { useState } from 'react';
import { EventItem } from '../../types/event';
import { useApp } from '../../context/AppContext';
import { 
  MapPin, 
  Globe, 
  Bookmark, 
  CheckCircle2, 
  CalendarPlus,
  Share2,
  Check,
  Sparkles,
  ExternalLink,
  Bell
} from 'lucide-react';

interface TimelineEventCardProps {
  event: EventItem;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event }) => {
  const { 
    isEventSaved, 
    toggleSaveEvent, 
    setActiveEventDetail, 
    setBookingModalEvent,
    isEventBooked,
    addToGoogleCalendar,
    downloadIcsFile,
    setNotifyToast,
    openNotificationModal
  } = useApp();

  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const isSaved = isEventSaved(event.id);
  const isBooked = isEventBooked(event.id);

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

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookingModalEvent(event);
  };

  // Extract clean 24h / starting time (e.g., 19:00, 09:00, 14:00)
  const formattedStartTime = (() => {
    if (event.isoDate) {
      const d = new Date(event.isoDate);
      if (!isNaN(d.getTime())) {
        const hours = d.getHours();
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${mins}`;
      }
    }
    return event.time.split('–')[0].trim();
  })();

  const attendeeCount = event.seats ? event.seats.filled : 24;
  const spotsLeft = event.seats ? event.seats.total - event.seats.filled : null;
  const isScare = spotsLeft !== null && spotsLeft <= 15;

  // Mock sample attendee avatars for the avatar stack
  const sampleAvatars = [
    event.organizer.avatar,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80',
  ];

  return (
    <div 
      onClick={() => setActiveEventDetail(event)}
      className="group relative bg-white rounded-2xl border border-zinc-200/80 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-between cursor-pointer w-full max-w-full overflow-hidden"
    >
      {/* Left / Main Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Top Row: Time & Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {event.isNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-xs border border-amber-300 ring-2 ring-amber-400/20 animate-pulse">
                <Sparkles className="w-3 h-3 fill-amber-950" />
                <span>NEW</span>
              </span>
            )}
            <span className="text-xs sm:text-sm font-semibold font-mono text-zinc-500 tracking-tight">
              {formattedStartTime}
            </span>
            <span className="text-zinc-300">·</span>
            
            {/* Format badge */}
            {event.mode === 'offline' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                <MapPin className="w-3 h-3" />
                <span>In-Person</span>
              </span>
            )}
            {event.mode === 'online' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                <Globe className="w-3 h-3" />
                <span>Virtual</span>
              </span>
            )}
            {event.mode === 'both' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Hybrid</span>
              </span>
            )}

            {/* Price Tag */}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              event.price.toLowerCase().includes('free') 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : event.price.toLowerCase().includes('invite')
                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                : 'bg-zinc-100 text-zinc-700 border border-zinc-200/60'
            }`}>
              {event.price}
            </span>

            {/* Platform badge */}
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60">
              {event.sourcePlatform}
            </span>

            {isBooked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Check className="w-3 h-3" /> Pass Reserved
              </span>
            )}
          </div>

          {/* Event Title */}
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1.5 line-clamp-2">
            {event.title}
          </h3>

          {/* Tagline / Subtitle */}
          <p className="text-xs text-zinc-500 leading-relaxed mb-2.5 line-clamp-2">
            {event.tagline}
          </p>

          {/* Organizer */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-2 truncate">
            <img 
              src={event.organizer.avatar} 
              alt={event.organizer.name}
              className="w-4 h-4 rounded-full object-cover ring-1 ring-zinc-200 flex-shrink-0"
            />
            <span className="text-zinc-500">By</span>
            <span className="font-semibold text-zinc-800 truncate">{event.organizer.name}</span>
            {event.organizer.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            )}
            {event.organizer.cadenceBadge && (
              <>
                <span className="text-zinc-300 hidden sm:inline">·</span>
                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline truncate">
                  {event.organizer.cadenceBadge}
                </span>
              </>
            )}
          </div>

          {/* Location / Venue */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 truncate mb-3">
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
                <span className="truncate">{event.venue || `${event.area || event.city}`}</span>
                <ExternalLink className="w-3 h-3 text-indigo-500 flex-shrink-0 group-hover/venue:translate-x-0.5 transition-transform" />
              </a>
            ) : (
              <span className="truncate">{event.venue || `${event.area || event.city} · Venue announced upon RSVP`}</span>
            )}
          </div>
        </div>

        {/* Bottom Details & Quick Actions */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-3 flex-wrap">
          {/* Attendee Stack */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              {sampleAvatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Attendee"
                  className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              +{attendeeCount} going
            </span>

            {spotsLeft !== null && (
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                isScare ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-500'
              }`}>
                {spotsLeft} spots left
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Calendar button */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCalendarMenuOpen(!isCalendarMenuOpen);
                }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
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
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
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
              className={`p-1.5 rounded-lg transition-colors ${
                isSaved
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save event'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* Email Notification Alert Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openNotificationModal({ event });
              }}
              className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
              title="Get email notifications for this gathering"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* RSVP / Pass reservation button */}
            <button
              type="button"
              onClick={handleBookClick}
              className="ml-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs hover:shadow-xs transition-all flex items-center gap-1"
            >
              <span>{isBooked ? 'View Pass' : 'RSVP'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right (Desktop) / Bottom (Mobile) Banner Thumbnail */}
      {event.bannerUrl && (
        <div className="w-full h-24 sm:h-auto sm:w-40 sm:min-h-[140px] rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 relative group-hover:opacity-95 transition-opacity mt-1 sm:mt-0">
          <img 
            src={event.bannerUrl} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:hidden" />
        </div>
      )}
    </div>
  );
};
