import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { EventItem, EventMode, VibeType, Community, BookingTicket, TimeHorizon, FormatType } from '../types/event';
import { UserProfile } from '../types/auth';
import { EVENTS_DATA, COMMUNITIES_DATA, CITIES } from '../data/mockData';
import { isSupabaseConfigured, fetchLiveEvents, fetchSyncStatus, SyncStatus, normalizeCity } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { isEventRemoved, markEventAsRemoved } from '../lib/urlUtils';
import { isEventStartedOrCompleted, filterActiveUpcomingEvents } from '../lib/dateUtils';

interface AppContextType {
  activeTab: 'explore' | 'compass' | 'radar' | 'saved';
  setActiveTab: (tab: 'explore' | 'compass' | 'radar' | 'saved') => void;
  removeEvent: (eventId: string, reason?: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedFormats: FormatType[];
  toggleFormat: (format: FormatType) => void;
  setSelectedFormats: (formats: FormatType[]) => void;
  modeFilter: EventMode;
  setModeFilter: (mode: EventMode) => void;
  selectedVibe: VibeType;
  setSelectedVibe: (vibe: VibeType) => void;
  timeHorizon: TimeHorizon;
  setTimeHorizon: (horizon: TimeHorizon) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
  toggleCategory: (cat: string) => void;
  availableCategories: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  freeOnly: boolean;
  setFreeOnly: (val: boolean) => void;
  savedEventIds: string[];
  toggleSaveEvent: (id: string) => void;
  isEventSaved: (id: string) => boolean;
  followedCommunityIds: string[];
  toggleFollowCommunity: (id: string) => void;
  isCommunityFollowed: (id: string) => boolean;
  activeEventDetail: EventItem | null;
  setActiveEventDetail: (event: EventItem | null) => void;
  bookingModalEvent: EventItem | null;
  setBookingModalEvent: (event: EventItem | null) => void;
  isMatchModalOpen: boolean;
  setIsMatchModalOpen: (open: boolean) => void;
  isLocationPromptOpen: boolean;
  setIsLocationPromptOpen: (open: boolean) => void;
  isScanningRegion: boolean;
  scanRegion: (cityId: string, mode?: EventMode) => void;
  filteredEvents: EventItem[];
  events: EventItem[];
  allCommunities: Community[];
  regionalCommunities: Community[];
  addToGoogleCalendar: (event: EventItem) => void;
  downloadIcsFile: (event: EventItem) => void;
  notifyToast: string | null;
  setNotifyToast: (msg: string | null) => void;
  bookings: BookingTicket[];
  confirmBooking: (eventId: string, ticketId: string, name: string, email: string) => void;
  isEventBooked: (eventId: string) => boolean;
  syncStatus: SyncStatus;
  refreshLiveEvents: () => Promise<void>;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isAIConciergeOpen: boolean;
  setIsAIConciergeOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'compass' | 'radar' | 'saved'>('explore');
  
  // Location prompt state - automatically prompts user on first load or if requested
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('pulse_selected_city') || 'bengaluru';
  });

  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState<boolean>(() => {
    return !localStorage.getItem('pulse_city_configured');
  });

  const [isScanningRegion, setIsScanningRegion] = useState<boolean>(false);

  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>([]);
  const toggleFormat = (format: FormatType) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };
  const modeFilter: EventMode = 
    selectedFormats.length === 1 ? selectedFormats[0] : 'all';
  const setModeFilter = (mode: EventMode) => {
    if (mode === 'all') setSelectedFormats([]);
    else if (mode === 'offline') setSelectedFormats(['offline']);
    else if (mode === 'online') setSelectedFormats(['online']);
    else if (mode === 'both') setSelectedFormats(['offline', 'online']);
  };

  const [selectedVibe, setSelectedVibe] = useState<VibeType>('all');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('all');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All Fields']);

  const selectedCategory = useMemo(() => {
    const active = selectedCategories.filter(c => c !== 'All Fields');
    if (active.length === 0) return 'All Fields';
    return active[0];
  }, [selectedCategories]);

  const setSelectedCategory = useCallback((cat: string) => {
    if (cat === 'All Fields') {
      setSelectedCategories(['All Fields']);
    } else {
      setSelectedCategories([cat]);
    }
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    if (cat === 'All Fields') {
      setSelectedCategories(['All Fields']);
      return;
    }
    setSelectedCategories(prev => {
      const withoutAll = prev.filter(c => c !== 'All Fields');
      if (withoutAll.includes(cat)) {
        const remaining = withoutAll.filter(c => c !== cat);
        return remaining.length === 0 ? ['All Fields'] : remaining;
      } else {
        return [...withoutAll, cat];
      }
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notifyToast, setNotifyToast] = useState<string | null>(null);

  // Auto-dismiss notification toasts after 3.2 seconds
  useEffect(() => {
    if (!notifyToast) return;
    const timer = setTimeout(() => {
      setNotifyToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [notifyToast]);

  const [activeEventDetail, setActiveEventDetail] = useState<EventItem | null>(null);
  const [bookingModalEvent, setBookingModalEvent] = useState<EventItem | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);

  // Authentication & Profile states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAIConciergeOpen, setIsAIConciergeOpen] = useState<boolean>(false);

/**
 * Automatically tags events with isNew: true if they belong to the latest batch of added events,
 * and maintains that tag until a newer batch or newer event is added to the website.
 */
function tagNewEvents(list: EventItem[]): EventItem[] {
  if (!list || list.length === 0) return list;

  const timestamps = list
    .map(e => (e.createdAt ? new Date(e.createdAt).getTime() : 0))
    .filter(t => !isNaN(t) && t > 0);

  if (timestamps.length === 0) {
    return list.map(e => ({
      ...e,
      isNew: Boolean(e.isNew)
    }));
  }

  const maxTimestamp = Math.max(...timestamps);
  // Mark all events added in the latest addition wave (within 12 hours of the highest createdAt)
  const threshold = maxTimestamp - 12 * 60 * 60 * 1000;

  return list.map(e => {
    const t = e.createdAt ? new Date(e.createdAt).getTime() : 0;
    const isLatestAddition = Boolean(e.isNew || (t > 0 && t >= threshold));
    return {
      ...e,
      isNew: isLatestAddition
    };
  });
}

  // Events state: populated with mockData + custom events, filtering out any removed/takedown events and already started/completed events
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const rawCustom = localStorage.getItem('pulse_custom_events');
      if (rawCustom) {
        const customEvents: EventItem[] = JSON.parse(rawCustom);
        return filterActiveUpcomingEvents(tagNewEvents([...customEvents, ...EVENTS_DATA])).filter(e => !isEventRemoved(e.id, e.rsvpUrl));
      }
    } catch {}
    return filterActiveUpcomingEvents(tagNewEvents(EVENTS_DATA)).filter(e => !isEventRemoved(e.id, e.rsvpUrl));
  });

  // Automated sweep timer: runs every 30 seconds to immediately prune events that just started or completed
  useEffect(() => {
    const sweepTimer = setInterval(() => {
      setEvents(prev => {
        const activeOnly = filterActiveUpcomingEvents(prev);
        if (activeOnly.length !== prev.length) {
          return activeOnly;
        }
        return prev;
      });
    }, 30000);

    return () => clearInterval(sweepTimer);
  }, []);

  const removeEvent = useCallback((eventId: string, reason?: string) => {
    setEvents(prev => {
      const target = prev.find(e => e.id === eventId);
      markEventAsRemoved(eventId, target?.rsvpUrl, reason);
      return prev.filter(e => e.id !== eventId);
    });
    setActiveEventDetail(curr => (curr && curr.id === eventId ? null : curr));
    setNotifyToast(`🗑️ Event removed: ${reason || 'Delisted from host platform'}`);
  }, []);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncedAt: null,
    status: isSupabaseConfigured() ? 'active' : 'local_fallback',
    eventsCount: EVENTS_DATA.length
  });

  const refreshLiveEvents = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const live = await fetchLiveEvents();
      if (live && live.length > 0) {
        setEvents(() => {
          const liveMap = new Map<string, EventItem>();
          live.forEach(e => {
            const normCity = normalizeCity(e.city);
            const citySlug = 
              normCity.includes('delhi') ? 'delhi-ncr' :
              normCity.includes('bengaluru') || normCity.includes('bangalore') ? 'bengaluru' :
              normCity.includes('francisco') || normCity.includes('sf') ? 'san-francisco' :
              normCity.includes('mumbai') ? 'mumbai' :
              normCity.includes('london') ? 'london' :
              'remote';

            const normalized: EventItem = { ...e, city: citySlug };
            liveMap.set(normalized.id, normalized);
            if (normalized.rsvpUrl) liveMap.set(normalized.rsvpUrl, normalized);
          });

          // Merge: update catalog events with live data if matched, preserve others, and append new ones
          const updatedCatalog = EVENTS_DATA.map(e => liveMap.get(e.id) || (e.rsvpUrl && liveMap.get(e.rsvpUrl)) || e);
          const catalogIds = new Set(updatedCatalog.map(e => e.id));
          const newLiveEvents = live.map(e => {
            const normCity = normalizeCity(e.city);
            const citySlug = 
              normCity.includes('delhi') ? 'delhi-ncr' :
              normCity.includes('bengaluru') || normCity.includes('bangalore') ? 'bengaluru' :
              normCity.includes('francisco') || normCity.includes('sf') ? 'san-francisco' :
              normCity.includes('mumbai') ? 'mumbai' :
              normCity.includes('london') ? 'london' :
              'remote';
            return { ...e, city: citySlug };
          }).filter(e => !catalogIds.has(e.id));

          let customEvents: EventItem[] = [];
          try {
            const rawCustom = localStorage.getItem('pulse_custom_events');
            if (rawCustom) customEvents = JSON.parse(rawCustom);
          } catch {}

          const allMerged = [...updatedCatalog, ...newLiveEvents];
          const existingIds = new Set(allMerged.map(e => e.id));
          customEvents.forEach(ce => {
            if (!existingIds.has(ce.id)) {
              allMerged.unshift(ce);
            }
          });

          const activeOnly = filterActiveUpcomingEvents(allMerged.filter(e => !isEventRemoved(e.id, e.rsvpUrl)));
          return tagNewEvents(activeOnly);
        });
      }
      const status = await fetchSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      console.warn('Error refreshing live events:', err);
    }
  }, []);

  useEffect(() => {
    refreshLiveEvents();
  }, [refreshLiveEvents]);

  // Saved events persistence (clean initial state: strictly 0 saved by default)
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    try {
      const legacySeedIds = ['event-blr-01', 'event-blr-04', 'event-blr-02', 'event-blr-03', 'event-delhi-01', 'event-blr-fintech-01'];
      const isCleaned = localStorage.getItem('pulse_saved_cleaned_v2');
      const stored = localStorage.getItem('pulse_saved_events');

      if (!isCleaned) {
        localStorage.setItem('pulse_saved_cleaned_v2', 'true');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const nonLegacy = parsed.filter((id: string) => !legacySeedIds.includes(id));
            localStorage.setItem('pulse_saved_events', JSON.stringify(nonLegacy));
            return nonLegacy;
          }
        }
        localStorage.setItem('pulse_saved_events', JSON.stringify([]));
        return [];
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => !legacySeedIds.includes(id));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Followed communities persistence (clean initial state: 0 followed)
  const [followedCommunityIds, setFollowedCommunityIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pulse_followed_communities');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const isLegacyMock = parsed.length === 2 && parsed.includes('gdg-bengaluru') && parsed.includes('hack2skill-community');
          if (!isLegacyMock) {
            return parsed;
          }
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Confirmed bookings persistence
  const [bookings, setBookings] = useState<BookingTicket[]>(() => {
    try {
      const stored = localStorage.getItem('pulse_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Prune any saved event IDs that no longer exist in the active catalog or have been delisted
  useEffect(() => {
    if (events.length > 0 && savedEventIds.length > 0) {
      const activeIds = new Set(events.map(e => e.id));
      const validSaved = savedEventIds.filter(id => activeIds.has(id));
      if (validSaved.length !== savedEventIds.length) {
        setSavedEventIds(validSaved);
      }
    }
  }, [events, savedEventIds]);

  useEffect(() => {
    localStorage.setItem('pulse_saved_events', JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem('pulse_followed_communities', JSON.stringify(followedCommunityIds));
  }, [followedCommunityIds]);

  useEffect(() => {
    localStorage.setItem('pulse_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('pulse_selected_city', selectedCity);
  }, [selectedCity]);

  // Scan Region with animated radar feedback
  const scanRegion = (cityId: string, mode?: EventMode) => {
    setIsScanningRegion(true);
    if (mode) setModeFilter(mode);
    setSelectedCity(cityId);

    setTimeout(() => {
      setIsScanningRegion(false);
      setIsLocationPromptOpen(false);
      localStorage.setItem('pulse_city_configured', 'true');
      const cityObj = CITIES.find(c => c.id === cityId);
      const cityName = cityObj ? cityObj.name : cityId;
      setNotifyToast(`🎯 Regional radar locked on ${cityName}!`);
      setTimeout(() => setNotifyToast(null), 3000);
    }, 1200);
  };

  const toggleSaveEvent = (id: string) => {
    setSavedEventIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(item => item !== id) : [...prev, id];
      setNotifyToast(exists ? 'Removed from saved' : 'Event saved to your radar!');
      setTimeout(() => setNotifyToast(null), 2500);
      return updated;
    });
  };

  const isEventSaved = (id: string) => savedEventIds.includes(id);

  const toggleFollowCommunity = (id: string) => {
    setFollowedCommunityIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(item => item !== id) : [...prev, id];
      const comm = COMMUNITIES_DATA.find(c => c.id === id);
      setNotifyToast(exists ? `Unfollowed ${comm?.name || 'community'}` : `Now following ${comm?.name || 'community'} for cadence alerts!`);
      setTimeout(() => setNotifyToast(null), 3000);
      return updated;
    });
  };

  const isCommunityFollowed = (id: string) => followedCommunityIds.includes(id);

  const confirmBooking = (eventId: string, ticketId: string, name: string, email: string) => {
    const ev = events.find(e => e.id === eventId);
    const newBooking: BookingTicket = {
      ticketId,
      eventId,
      eventTitle: ev?.title || 'Tech Gathering',
      attendeeName: name,
      attendeeEmail: email,
      bookingDate: new Date().toLocaleDateString(),
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + ticketId
    };
    setBookings(prev => [...prev.filter(b => b.eventId !== eventId), newBooking]);
  };

  const isEventBooked = (eventId: string) => bookings.some(b => b.eventId === eventId);

  // Dynamic filter logic: STRICTLY checks REGION/CITY + FORMAT (In-Person / Virtual with Hybrid in both) + CATEGORY + SEARCH
  const filteredEvents = events
    .filter(event => {
      // 0. Temporal check: filter out events that have already started, ended, or closed registration
      if (isEventStartedOrCompleted(event)) {
        return false;
      }

      // 1. Strict City / Region matching:
      // When a specific regional hub is selected (e.g. Delhi NCR, Bengaluru), ONLY show events from that city.
      if (selectedCity !== 'remote') {
        const isSameCity = normalizeCity(event.city) === normalizeCity(selectedCity);
        if (!isSameCity) {
          return false;
        }
      }

      // 2. Format filter: Only "In-Person" and "Virtual" (Hybrid shown in both)
      // If nothing is selected OR both are selected, show all events!
      // If only In-Person is selected: event.mode === 'offline' || event.mode === 'both'
      // If only Virtual is selected: event.mode === 'online' || event.mode === 'both'
      if (selectedFormats.length === 1) {
        const activeFormat = selectedFormats[0];
        if (activeFormat === 'offline') {
          if (event.mode !== 'offline' && event.mode !== 'both') return false;
        } else if (activeFormat === 'online') {
          if (event.mode !== 'online' && event.mode !== 'both') return false;
        }
      }

      // 3. Category filter (supports multi-category selection)
      const activeCategories = selectedCategories.filter(c => c !== 'All Fields');
      if (activeCategories.length > 0) {
        const matchesCategory = event.categories.some(c =>
          activeCategories.some(ac => 
            c.toLowerCase().includes(ac.toLowerCase()) || ac.toLowerCase().includes(c.toLowerCase())
          )
        );
        if (!matchesCategory) return false;
      }

      // 4. Free filter
      if (freeOnly && event.price !== 'Free') {
        return false;
      }

      // 5. Comprehensive Search query across all event attributes & organizer aliases
      if (searchQuery.trim() !== '') {
        const rawQ = searchQuery.toLowerCase().trim();
        // Clean query: strip parenthetical qualifiers e.g. "(delhi ncr)", "(tpf)", "(ace)"
        const cleanQ = rawQ.replace(/\s*\(.*?\)\s*/g, ' ').trim();
        const queries = Array.from(new Set([rawQ, cleanQ])).filter(q => q.length > 0);

        const matchFound = queries.some(q => {
          const matchTitle = event.title?.toLowerCase().includes(q) || false;
          const matchTagline = event.tagline?.toLowerCase().includes(q) || false;
          const matchDesc = event.description?.toLowerCase().includes(q) || false;
          const orgName = typeof event.organizer === 'object' && event.organizer?.name ? event.organizer.name : (typeof event.organizer === 'string' ? event.organizer : '');
          const orgId = typeof event.organizer === 'object' && event.organizer?.id ? event.organizer.id : '';
          const matchOrgName = orgName.toLowerCase().includes(q);
          const matchOrgId = orgId.toLowerCase().includes(q);
          const matchTags = Array.isArray(event.categories) && event.categories.some(t => typeof t === 'string' && t.toLowerCase().includes(q));
          const matchArea = event.area?.toLowerCase().includes(q) || false;
          const matchVenue = event.venue?.toLowerCase().includes(q) || false;
          const matchSource = event.sourcePlatform?.toLowerCase().includes(q) || false;
          const matchUrl = event.rsvpUrl?.toLowerCase().includes(q) || false;
          const matchSpeakers = event.speakers?.some(s => s.name?.toLowerCase().includes(q) || s.role?.toLowerCase().includes(q)) || false;

          // Alias matchers:
          const isTpfQuery = q.includes('product folk') || q.includes('tpf');
          const isTpfEvent = orgId.includes('the-product-folks') || orgId.includes('tpf') || orgName.toLowerCase().includes('product folk') || event.title?.toLowerCase().includes('tpf');
          if (isTpfQuery && isTpfEvent) return true;

          const isGdgQuery = q.includes('gdg') || q.includes('google developer');
          const isGdgEvent = orgId.includes('gdg') || orgName.toLowerCase().includes('gdg') || orgName.toLowerCase().includes('google developer');
          if (isGdgQuery && isGdgEvent) return true;

          const isGrafanaQuery = q.includes('grafana');
          const isGrafanaEvent = orgId.includes('grafana') || orgName.toLowerCase().includes('grafana') || event.title?.toLowerCase().includes('grafana');
          if (isGrafanaQuery && isGrafanaEvent) return true;

          const isAtlassianQuery = q.includes('atlassian') || q.includes('ace');
          const isAtlassianEvent = orgId.includes('atlassian') || orgName.toLowerCase().includes('atlassian');
          if (isAtlassianQuery && isAtlassianEvent) return true;

          return matchTitle || matchTagline || matchDesc || matchOrgName || matchOrgId || matchTags || matchArea || matchVenue || matchSource || matchUrl || matchSpeakers;
        });

        if (!matchFound) {
          return false;
        }
      }

      return true;
    })
    // Directly show upcoming events sorted chronologically by date
    .sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());

  // Dynamically derive available categories ONLY from events present in the active regional hub
  const availableCategories = useMemo(() => {
    const regionalEvents = events.filter(e => 
      !isEventStartedOrCompleted(e) && (selectedCity === 'remote' ? true : normalizeCity(e.city) === normalizeCity(selectedCity))
    );

    const categorySet = new Set<string>();
    regionalEvents.forEach(event => {
      event.categories?.forEach(cat => {
        const trimmed = cat.trim();
        if (trimmed) {
          categorySet.add(trimmed);
        }
      });
    });

    const sortedList = Array.from(categorySet).sort((a, b) => a.localeCompare(b));
    return ['All Fields', ...sortedList];
  }, [selectedCity, events]);

  // If active categories are no longer present in available categories for the region, prune them
  useEffect(() => {
    const activeCats = selectedCategories.filter(c => c !== 'All Fields');
    const valid = activeCats.filter(c => availableCategories.includes(c));
    if (activeCats.length > 0 && valid.length !== activeCats.length) {
      setSelectedCategories(valid.length === 0 ? ['All Fields'] : valid);
    }
  }, [availableCategories, selectedCategories]);

  // Filter communities by regional hub
  const regionalCommunities = COMMUNITIES_DATA.filter(c => 
    selectedCity === 'remote' ? true : normalizeCity(c.city) === normalizeCity(selectedCity)
  );

  const addToGoogleCalendar = (event: EventItem) => {
    const orgName = typeof event.organizer === 'object' && event.organizer?.name ? event.organizer.name : (typeof event.organizer === 'string' ? event.organizer : 'Community Host');
    const title = encodeURIComponent(event.title || 'Tech Event');
    const details = encodeURIComponent(`${event.tagline || ''}\n\nOrganizer: ${orgName}\nRSVP: ${event.rsvpUrl || ''}`);
    const location = encodeURIComponent(event.venue || event.virtualPlatform || event.city || 'TBA');
    
    const parsedDate = event.isoDate ? new Date(event.isoDate) : new Date();
    const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const startIso = validDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(validDate.getTime() + 3 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${endIso}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadIcsFile = (event: EventItem) => {
    const parsedDate = event.isoDate ? new Date(event.isoDate) : new Date();
    const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const startDate = validDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(validDate.getTime() + 3 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PulseMeet//Tech Events Radar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id || Date.now()}@pulsemeet.dev`,
      `DTSTAMP:${startDate}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title || 'Tech Event'}`,
      `DESCRIPTION:${event.tagline || ''} - RSVP at ${event.rsvpUrl || ''}`,
      `LOCATION:${event.venue || event.virtualPlatform || event.city || 'TBA'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        removeEvent,
        selectedCity,
        setSelectedCity,
        selectedFormats,
        toggleFormat,
        setSelectedFormats,
        modeFilter,
        setModeFilter,
        selectedVibe,
        setSelectedVibe,
        timeHorizon,
        setTimeHorizon,
        selectedCategory,
        setSelectedCategory,
        selectedCategories,
        setSelectedCategories,
        toggleCategory,
        availableCategories,
        searchQuery,
        setSearchQuery,
        freeOnly,
        setFreeOnly,
        savedEventIds,
        toggleSaveEvent,
        isEventSaved,
        followedCommunityIds,
        toggleFollowCommunity,
        isCommunityFollowed,
        activeEventDetail,
        setActiveEventDetail,
        bookingModalEvent,
        setBookingModalEvent,
        isMatchModalOpen,
        setIsMatchModalOpen,
        isLocationPromptOpen,
        setIsLocationPromptOpen,
        isScanningRegion,
        scanRegion,
        filteredEvents,
        events,
        allCommunities: COMMUNITIES_DATA,
        regionalCommunities,
        addToGoogleCalendar,
        downloadIcsFile,
        notifyToast,
        setNotifyToast,
        bookings,
        confirmBooking,
        isEventBooked,
        syncStatus,
        refreshLiveEvents,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isAIConciergeOpen,
        setIsAIConciergeOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
