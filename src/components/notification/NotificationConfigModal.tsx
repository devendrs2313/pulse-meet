import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sendDirectEventDetails, subscribeToCategoryAlerts } from '../../lib/notificationQueue';
import { SUPER_ADMIN_EMAIL } from '../../lib/resend';
import { TECH_CATEGORIES } from '../../data/mockData';
import { X, Bell, Mail, CheckCircle2, Calendar, MapPin, Sparkles, Loader2, Send } from 'lucide-react';

const REGIONAL_HUBS = [
  { id: 'all', label: 'All Regional Hubs' },
  { id: 'delhi-ncr', label: 'Delhi NCR' },
  { id: 'bengaluru', label: 'Bengaluru' },
  { id: 'mumbai', label: 'Mumbai' },
  { id: 'pune', label: 'Pune' },
  { id: 'hyderabad', label: 'Hyderabad' },
  { id: 'remote', label: 'Virtual & Remote' }
];

export const NotificationConfigModal: React.FC = () => {
  const { 
    notificationModalTarget, 
    setNotificationModalTarget, 
    currentUser,
    setNotifyToast
  } = useApp();

  const event = notificationModalTarget?.event;
  const isDirectEventMode = !!event;

  const [email, setEmail] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All Fields']);
  const [timing, setTiming] = useState<'immediate' | 'weekly'>('immediate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackMailtoUrl, setFallbackMailtoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    } else {
      setEmail('');
    }

    if (notificationModalTarget?.city) {
      setSelectedCity(notificationModalTarget.city);
    } else if (event?.city) {
      setSelectedCity(event.city);
    }

    if (notificationModalTarget?.category && notificationModalTarget.category !== 'All Fields') {
      setSelectedCategories([notificationModalTarget.category]);
    } else if (event?.categories?.[0]) {
      setSelectedCategories([event.categories[0]]);
    } else {
      setSelectedCategories(['All Fields']);
    }

    setIsSuccess(false);
    setErrorMessage(null);
  }, [notificationModalTarget, currentUser, event]);

  if (!notificationModalTarget) return null;

  const toggleCategory = (cat: string) => {
    if (cat === 'All Fields') {
      setSelectedCategories(['All Fields']);
      return;
    }
    const filtered = selectedCategories.filter(c => c !== 'All Fields');
    if (filtered.includes(cat)) {
      const next = filtered.filter(c => c !== cat);
      setSelectedCategories(next.length === 0 ? ['All Fields'] : next);
    } else {
      setSelectedCategories([...filtered, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isDirectEventMode && event) {
        // MODE A: Direct Event Details Email (NO APPROVAL REQUIRED)
        const result = await sendDirectEventDetails({
          event,
          recipientEmail: cleanEmail,
          recipientName: currentUser?.name
        });

        setIsSubmitting(false);
        if (result.success) {
          setIsSuccess(true);
          setFallbackMailtoUrl(null);
          setNotifyToast(`✉️ Event details sent directly to ${cleanEmail}!`);
        } else if (result.isDomainRestricted || result.mailtoUrl) {
          // Graceful success: the event details are prepared, offer 1-click Gmail dispatch
          setIsSuccess(true);
          setFallbackMailtoUrl(result.mailtoUrl || null);
          setNotifyToast(`✉️ Event details ready for ${cleanEmail}!`);
        } else {
          setErrorMessage(result.error || 'Failed to dispatch email.');
        }
      } else {
        // MODE B: General Category / Area Event Alerts Configuration
        const { confirmationSent, emailResult } = await subscribeToCategoryAlerts({
          email: cleanEmail,
          name: currentUser?.name,
          categories: selectedCategories,
          city: selectedCity,
          timing
        });

        setIsSubmitting(false);
        setIsSuccess(true);
        if (confirmationSent) {
          setNotifyToast(`🎉 Radar alerts configured! Confirmation sent to ${cleanEmail}.`);
        } else if (emailResult?.isDomainRestricted) {
          setNotifyToast(`🔔 Alerts saved for ${cleanEmail}! (Live delivery requires custom domain at resend.com/domains)`);
        } else {
          setNotifyToast(`🎉 Radar alerts configured for ${cleanEmail}!`);
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to process request. Please try again.');
    }
  };

  const handleClose = () => {
    setNotificationModalTarget(null);
    setIsSuccess(false);
    setFallbackMailtoUrl(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden border border-zinc-200 shadow-2xl relative my-auto transition-all"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isDirectEventMode ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isDirectEventMode ? <Send className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                {isDirectEventMode ? 'Email Me Event Details' : 'Configure Event Radar Alerts'}
              </h3>
              <p className="text-xs text-zinc-500">
                {isDirectEventMode 
                  ? 'Receive full schedule & direct RSVP link' 
                  : 'Automated alerts when new gatherings are listed'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-50">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900">
                {isDirectEventMode ? 'Event Details Dispatched!' : 'Radar Alerts Configured!'}
              </h4>
              <p className="text-xs text-zinc-600 max-w-xs mx-auto leading-relaxed">
                {isDirectEventMode ? (
                  <>
                    We have emailed the full gathering schedule, venue map, and direct RSVP link for <strong>{event?.title}</strong> to <strong>{email}</strong>.
                  </>
                ) : (
                  <>
                    You will receive email notifications whenever new gatherings in <strong>{selectedCategories.join(', ')}</strong> are listed in <strong>{selectedCity.toUpperCase()}</strong>.
                  </>
                )}
              </p>

              {fallbackMailtoUrl ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left text-xs text-amber-900 leading-relaxed">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Ready to Send from {SUPER_ADMIN_EMAIL}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-normal">
                      Resend&apos;s free sandbox restricts automated API calls to the account owner. You can send this exact pre-filled event schedule from <strong>{SUPER_ADMIN_EMAIL}</strong> to <strong>{email}</strong> in 1 click:
                    </p>
                  </div>

                  <a
                    href={fallbackMailtoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-center"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open & Send via Gmail (from {SUPER_ADMIN_EMAIL}) ↗</span>
                  </a>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-left text-xs text-zinc-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>Check Your Inbox</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Sent by Devendra ({SUPER_ADMIN_EMAIL}) via PulseMeet. Please check your spam folder if not visible immediately.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full mt-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form id="notify-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Event Details Preview (if specific event mode) */}
              {isDirectEventMode && event ? (
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    Selected Event
                  </span>
                  <div className="font-bold text-sm text-zinc-900 leading-snug">
                    {event.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{event.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{event.venue || event.area || event.city}</span>
                    </span>
                  </div>
                </div>
              ) : null}

              {/* General Topic & Hub Selection (if general alerts mode) */}
              {!isDirectEventMode && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      1. Select Regional Hub
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {REGIONAL_HUBS.map(h => (
                        <option key={h.id} value={h.id}>{h.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      2. Select Preferred Categories
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <button
                        type="button"
                        onClick={() => toggleCategory('All Fields')}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
                          selectedCategories.includes('All Fields')
                            ? 'bg-zinc-900 text-white font-semibold'
                            : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        All Fields
                      </button>
                      {TECH_CATEGORIES.map(cat => {
                        const active = selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
                              active
                                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Email Address Input (Required, editable for all, pre-filled if logged in) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    {isDirectEventMode ? 'Send Details To Email' : 'Your Email Address'}
                  </label>
                  {!currentUser && (
                    <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                      No account needed
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. name@example.com)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <p className="text-[10px] text-zinc-400">
                  {isDirectEventMode 
                    ? 'You will directly receive the full schedule, organizer contact, and RSVP access.' 
                    : 'We will send you an instant confirmation, followed by updates whenever new events drop.'}
                </p>
              </div>

              {/* Cadence selection (only for general alerts) */}
              {!isDirectEventMode && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Alert Frequency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTiming('immediate')}
                      className={`p-2 rounded-xl text-left border text-xs transition-all ${
                        timing === 'immediate'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                          : 'border-zinc-200 bg-white text-zinc-600'
                      }`}
                    >
                      <div>⚡ Instant Alert</div>
                      <div className="text-[10px] text-zinc-400 font-normal">When new event drops</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTiming('weekly')}
                      className={`p-2 rounded-xl text-left border text-xs transition-all ${
                        timing === 'weekly'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                          : 'border-zinc-200 bg-white text-zinc-600'
                      }`}
                    >
                      <div>📅 Weekly Digest</div>
                      <div className="text-[10px] text-zinc-400 font-normal">Summary every Monday</div>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Fixed Footer */}
        {!isSuccess && (
          <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/80 flex items-center justify-between gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="notify-form"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all shadow-sm ${
                isDirectEventMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isDirectEventMode ? 'Sending Details...' : 'Configuring...'}</span>
                </>
              ) : (
                <>
                  {isDirectEventMode ? (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Event Details Directly</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Set Up Email Alerts</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
