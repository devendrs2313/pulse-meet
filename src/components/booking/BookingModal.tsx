import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  CalendarPlus, 
  Sparkles, 
  ShieldCheck, 
  Ticket,
  Calendar,
  MapPin,
  QrCode
} from 'lucide-react';

export const BookingModal: React.FC = () => {
  const { 
    bookingModalEvent, 
    setBookingModalEvent, 
    addToGoogleCalendar, 
    downloadIcsFile,
    setNotifyToast,
    confirmBooking,
    isEventBooked
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  if (!bookingModalEvent) return null;

  const event = bookingModalEvent;
  const alreadyBooked = isEventBooked(event.id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(event.rsvpUrl);
    setCopied(true);
    setNotifyToast('Link copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setNotifyToast(null);
    }, 2500);
  };

  const handleBookTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newTicketId = `PM-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(newTicketId);
    confirmBooking(event.id, newTicketId, name, email);
    setIsSuccess(true);
    setNotifyToast('🎉 RSVP Confirmed! Your digital pass is ready.');
    setTimeout(() => setNotifyToast(null), 3500);
  };

  return (
    <div 
      onClick={() => setBookingModalEvent(null)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full border border-zinc-200 shadow-2xl p-6 sm:p-8 relative overflow-hidden my-6 transition-all"
      >
        {/* Close button */}
        <button
          onClick={() => setBookingModalEvent(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200/60">
            <Ticket className="w-3.5 h-3.5" />
            <span>Event Registration & Booking Pass</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
            {event.title}
          </h2>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2">
            <span className="flex items-center gap-1 font-medium text-zinc-700">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              {event.date}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {event.area ? `${event.area}, ${event.city}` : event.city}
            </span>
          </div>
        </div>

        {/* Direct Link Box with 1-click open & copy */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 mb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 mb-1.5">
            <span>Official RSVP Link ({event.sourcePlatform})</span>
            <span className="text-[10px] text-emerald-600 font-mono">Verified Active</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={event.rsvpUrl}
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-zinc-700 select-all focus:outline-none"
            />
            
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>Open</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Success Confirmed Ticket View */}
        {isSuccess || alreadyBooked ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-950">
                You're Registered!
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Your digital reservation has been confirmed for {event.title}.
              </p>

              {/* Ticket stub */}
              <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs flex items-center justify-between text-left">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
                    Digital Pass
                  </div>
                  <div className="text-sm font-mono font-bold text-zinc-800">
                    {ticketId || 'PM-782194'}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    1 Attendee · {event.price}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                  <QrCode className="w-8 h-8 text-zinc-800" />
                </div>
              </div>
            </div>

            {/* Calendar & External Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => addToGoogleCalendar(event)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Add to Google Cal</span>
              </button>

              <button
                onClick={() => downloadIcsFile(event)}
                className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors"
              >
                .ICS
              </button>

              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Visit Event Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleBookTicket} className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Reserve Your Attendee Spot
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">
                Email Address (For calendar invite & pass)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@company.com"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>We never share your email. Pass is saved locally in your browser radar.</span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 px-5 rounded-full text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm RSVP & Get Pass</span>
              </button>

              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors flex items-center gap-1"
                title="Or complete directly on platform"
              >
                <span>Direct on {event.sourcePlatform}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
