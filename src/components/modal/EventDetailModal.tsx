import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Calendar, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  CalendarPlus, 
  Share2, 
  Sparkles,
  Clock,
  Ticket,
  Bell
} from 'lucide-react';

export const EventDetailModal: React.FC = () => {
  const { 
    activeEventDetail, 
    setActiveEventDetail, 
    setBookingModalEvent,
    isEventSaved, 
    toggleSaveEvent,
    addToGoogleCalendar,
    downloadIcsFile,
    setNotifyToast,
    openNotificationModal
  } = useApp();

  if (!activeEventDetail) return null;

  const event = activeEventDetail;
  const isSaved = isEventSaved(event.id);

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

  const handleBookNow = () => {
    setActiveEventDetail(null);
    setBookingModalEvent(event);
  };

  return (
    <div 
      onClick={() => setActiveEventDetail(null)}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full border border-zinc-200 shadow-2xl overflow-hidden relative my-8"
      >
        {/* Banner with Close Button */}
        <div className="relative h-60 sm:h-72 w-full bg-zinc-900 overflow-hidden">
          {event.bannerUrl && (
            <img 
              src={event.bannerUrl} 
              alt={event.title}
              className="w-full h-full object-cover opacity-85"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
              {event.sourcePlatform} RSVP
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSaveEvent(event.id)}
                className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                  isSaved ? 'bg-indigo-600 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title="Save event"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={() => setActiveEventDetail(null)}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Banner Info */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              {event.mode === 'offline' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/90 text-white">
                  <MapPin className="w-3 h-3" />
                  <span>In-Person · {event.area || event.city}</span>
                </span>
              )}
              {event.mode === 'online' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/90 text-white">
                  <Globe className="w-3 h-3" />
                  <span>Virtual Livestream</span>
                </span>
              )}
              {event.mode === 'both' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/90 text-white">
                  <Sparkles className="w-3 h-3" />
                  <span>Hybrid (Venue + Live)</span>
                </span>
              )}

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
                {event.price}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {/* Organizer Header */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center gap-3">
              <img 
                src={event.organizer.avatar} 
                alt={event.organizer.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-200"
              />
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-sm text-zinc-900">
                  <span>{event.organizer.name}</span>
                  {event.organizer.verified && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  {event.organizer.cadenceBadge}
                </div>
              </div>
            </div>

            {event.seats && (
              <div className="text-right">
                <div className="text-xs font-mono font-semibold text-rose-600">
                  {event.seats.total - event.seats.filled} seats left
                </div>
                <div className="text-[11px] text-zinc-400">
                  {event.seats.filled}/{event.seats.total} RSVPs
                </div>
              </div>
            )}
          </div>

          {/* Date, Time & Venue Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-zinc-200 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-zinc-900">{event.date}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{event.time}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-zinc-200 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                {event.venueUrl ? (
                  <a
                    href={event.venueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 group"
                    title="Open venue location in Maps"
                  >
                    <span>{event.venue || event.virtualPlatform || event.city}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ) : (
                  <div className="text-xs font-semibold text-zinc-900">
                    {event.venue || event.virtualPlatform || event.city}
                  </div>
                )}
                <div className="text-xs text-zinc-500 mt-0.5">
                  {event.area ? `${event.area}, ${event.city}` : event.city}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              About this Gathering
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Official Link Display */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
            <div className="text-xs font-mono text-zinc-600 truncate mr-2">
              Link: {event.rsvpUrl}
            </div>
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0"
            >
              <span>Visit Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Speakers (if any) */}
          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Featured Speakers & Mentors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.speakers.map((spk, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                    <img 
                      src={spk.avatar} 
                      alt={spk.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-900">{spk.name}</div>
                      <div className="text-[11px] text-zinc-500">{spk.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Session Flow & Agenda
              </h3>
              <div className="space-y-2">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-700 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer RSVP Bar */}
        <div className="p-4 sm:p-6 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Calendar Sync & Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => addToGoogleCalendar(event)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google Calendar</span>
            </button>

            <button
              onClick={() => downloadIcsFile(event)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors shadow-xs"
            >
              <span>.ICS File</span>
            </button>

            <button
              onClick={() => {
                const cur = event;
                setActiveEventDetail(null);
                openNotificationModal({ event: cur });
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
              title="Configure email notification for this event"
            >
              <Bell className="w-3.5 h-3.5 text-indigo-600" />
              <span>Notify Me</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 transition-colors shadow-xs"
              title="Share event link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Primary RSVP CTA */}
          <button
            onClick={handleBookNow}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Ticket className="w-4 h-4" />
            <span>Book Seat & View Pass</span>
          </button>

        </div>

      </div>
    </div>
  );
};
