import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { isValidHttpUrl, getEventHostDomain, openEventBookingUrl, checkEventUrlLiveness } from '../../lib/urlUtils';
import { isEventStartedOrCompleted } from '../../lib/dateUtils';
import { 
  X, 
  Calendar, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Bookmark, 
  CalendarPlus, 
  Share2, 
  Sparkles,
  AlertTriangle,
  Trash2,
  Loader2,
  Clock
} from 'lucide-react';

export const EventDetailModal: React.FC = () => {
  const { 
    activeEventDetail, 
    setActiveEventDetail, 
    isEventSaved, 
    toggleSaveEvent, 
    addToGoogleCalendar,
    setNotifyToast,
    removeEvent
  } = useApp();

  const [takedownReason, setTakedownReason] = useState<string | null>(null);
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  if (!activeEventDetail) return null;

  const event = activeEventDetail;
  const isExpired = isEventStartedOrCompleted(event);
  const isSaved = (typeof isEventSaved === 'function' && event?.id) ? isEventSaved(event.id) : false;
  const hasValidUrl = isValidHttpUrl(event.rsvpUrl);
  const hostDomain = getEventHostDomain(event.rsvpUrl);

  const organizerName = (() => {
    if (!event.organizer) return 'Community Host';
    if (typeof event.organizer === 'string') return event.organizer;
    if (typeof event.organizer === 'object' && event.organizer.name) return event.organizer.name;
    return 'Community Host';
  })();

  const categoryLabel = (Array.isArray(event.categories) && event.categories.length > 0 && typeof event.categories[0] === 'string')
    ? event.categories[0].toUpperCase()
    : 'COMMUNITY EVENT';

  const locationLabel = event.venue || event.area || event.city || 'Location TBA';

  useEffect(() => {
    setTakedownReason(null);
    if (event && hasValidUrl) {
      checkEventUrlLiveness(event.rsvpUrl).then((res) => {
        if (!res.available) {
          setTakedownReason(res.reason || 'Event delisted or cancelled on host website');
        }
      });
    }
  }, [event?.id, event?.rsvpUrl, hasValidUrl]);

  const handleShare = () => {
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

  const handleDirectVisit = async () => {
    if (isExpired) {
      setNotifyToast('⚠️ Registration is closed as this event has already started.');
      return;
    }

    if (!hasValidUrl) {
      setNotifyToast('⚠️ Direct registration link pending confirmation by organizer.');
      return;
    }

    if (takedownReason) {
      setNotifyToast(`⚠️ ${takedownReason}. Removing event from radar...`);
      removeEvent(event.id, takedownReason);
      setActiveEventDetail(null);
      return;
    }

    setIsCheckingLink(true);
    const probe = await checkEventUrlLiveness(event.rsvpUrl);
    setIsCheckingLink(false);

    if (!probe.available) {
      const reason = probe.reason || 'Event was removed or cancelled on host platform';
      setTakedownReason(reason);
      setNotifyToast(`⚠️ ${reason}. Pruning event from your radar...`);
      setTimeout(() => {
        removeEvent(event.id, reason);
        setActiveEventDetail(null);
      }, 1200);
      return;
    }

    openEventBookingUrl(event.rsvpUrl);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setActiveEventDetail(null);
        }
      }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col p-4 sm:p-6 my-0 sm:my-6 pointer-events-auto"
      >
        {/* Top Close Button (Image 2 style) */}
        <button
          onClick={() => setActiveEventDetail(null)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 rounded-full bg-black/50 sm:bg-zinc-100 text-white sm:text-zinc-600 flex items-center justify-center hover:bg-black/70 sm:hover:bg-zinc-200 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto flex-1 pr-0.5">
          {/* Takedown Warning Banner if event was deleted on host platform */}
          {takedownReason && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-rose-800">Delisted by Organizer on {hostDomain}</strong>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                    {takedownReason}. The event link is no longer active.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeEvent(event.id, takedownReason);
                  setActiveEventDetail(null);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-2xs"
                title="Remove this event from your radar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}

          {/* Cover Image at Top (Image 2 exact style) */}
          {event.bannerUrl && (
            <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-zinc-900 mb-4 shadow-2xs flex-shrink-0">
              <img 
                src={event.bannerUrl} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {event.isNew && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
                  <span>NEW EVENT</span>
                </span>
              )}
            </div>
          )}

          {/* Category Tag Pill */}
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full border border-zinc-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-600 bg-white">
              {categoryLabel}
            </span>
          </div>

          {/* Event Title */}
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 leading-tight mb-4">
            {event.title}
          </h2>

          {/* Metadata Rows with Circular Icons (Image 2 exact replica) */}
          <div className="space-y-3.5 mb-4">
            {/* Date Row */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">DATE</div>
                <div className="text-xs sm:text-sm font-semibold text-zinc-800">
                  {event.date} · {event.time}
                </div>
              </div>
            </div>

            {/* Location Row */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                {event.mode === 'online' ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">LOCATION</div>
                <div className="text-xs sm:text-sm font-semibold text-zinc-800">
                  {event.mode === 'online' ? (
                    <span>Virtual event</span>
                  ) : event.venueUrl ? (
                    <a 
                      href={event.venueUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{locationLabel}</span>
                      <ExternalLink className="w-3 h-3 text-indigo-500" />
                    </a>
                  ) : (
                    <span>{locationLabel}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Hosted by Row */}
            <div className="text-xs sm:text-sm text-zinc-600 pt-1">
              Hosted by <strong className="text-zinc-900 font-semibold">{organizerName}</strong>
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t border-zinc-200 my-4" />

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              About this Gathering
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {event.description || event.tagline}
            </p>
          </div>

          {/* Official Host Link Display */}
          {hasValidUrl ? (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 min-w-0 mr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                <div className="text-xs text-indigo-950 font-medium truncate">
                  <span className="font-bold">Official Site:</span> {hostDomain}
                </div>
              </div>
              <button
                type="button"
                onClick={handleDirectVisit}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0 bg-white px-3 py-1 rounded-full border border-indigo-200 shadow-2xs hover:bg-indigo-50 cursor-pointer transition-all"
              >
                <span>Visit Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ) : isExpired ? (
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs text-amber-900 font-medium">Event has started or completed. Registration is closed.</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">Closed</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between mb-4">
              <span className="text-xs text-amber-900 font-medium">Official registration link pending confirmation</span>
              <span className="text-[10px] font-mono bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-bold">Pending</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 flex-shrink-0">
          {isExpired ? (
            <button
              onClick={() => {
                removeEvent(event.id, 'Registration closed / Event started');
                setActiveEventDetail(null);
              }}
              className="flex-1 py-3 px-4 rounded-full bg-zinc-200 hover:bg-zinc-300 active:scale-[0.98] text-zinc-700 font-bold text-xs sm:text-sm shadow-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-zinc-500" />
              <span>Registration Closed · Prune from Radar</span>
            </button>
          ) : takedownReason ? (
            <button
              onClick={() => {
                removeEvent(event.id, takedownReason);
                setActiveEventDetail(null);
              }}
              className="flex-1 py-3 px-4 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Event Delisted by Host · Remove from Radar</span>
            </button>
          ) : hasValidUrl ? (
            <button
              disabled={isCheckingLink}
              onClick={handleDirectVisit}
              className="flex-1 py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isCheckingLink ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Link...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Book on {hostDomain} ↗</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-3 px-4 rounded-full bg-zinc-100 text-zinc-400 font-bold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <span>Registration Link Pending</span>
            </button>
          )}

          <button
            onClick={() => addToGoogleCalendar(event)}
            className="p-3 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors shadow-2xs"
            title="Add to Google Calendar"
          >
            <CalendarPlus className="w-4 h-4 text-indigo-600" />
          </button>

          <button
            onClick={() => toggleSaveEvent(event.id)}
            className={`p-3 rounded-full border transition-colors shadow-2xs ${
              isSaved ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
            title="Save event"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors shadow-2xs"
            title="Share event link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
