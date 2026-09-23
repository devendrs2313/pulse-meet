import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { EventItem, EventMode, VibeType, Community, BookingTicket, TimeHorizon, FormatType } from '../types/event';
import { UserProfile } from '../types/auth';
import { EVENTS_DATA, COMMUNITIES_DATA, CITIES } from '../data/mockData';
import { isSupabaseConfigured, fetchLiveEvents, fetchSyncStatus, SyncStatus, normalizeCity } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

interface AppContextType {
  activeTab: 'explore' | 'compass' | 'radar' | 'saved';
  setActiveTab: (tab: 'explore' | 'compass' | 'radar' | 'saved') => void;
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
  notificationModalTarget: { event?: EventItem; category?: string; city?: string } | null;
  setNotificationModalTarget: (target: { event?: EventItem; category?: string; city?: string } | null) => void;
  openNotificationModal: (target?: { event?: EventItem; category?: string; city?: string }) => void;
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
  const [notificationModalTarget, setNotificationModalTarget] = useState<{ event?: EventItem; category?: string; city?: string } | null>(null);
  const [isAIConciergeOpen, setIsAIConciergeOpen] = useState<boolean>(false);

  const openNotificationModal = useCallback((target?: { event?: EventItem; category?: string; city?: string }) => {
    setNotificationModalTarget(target || {});
  }, []);

  // Events state: populated with mockData by default, dynamically refreshed from Supabase if configured
  const [events, setEvents] = useState<EventItem[]>(EVENTS_DATA);
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

          return [...updatedCatalog, ...newLiveEvents];
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

  // Saved events persistence (clean initial state: 0 saved)
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pulse_saved_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // If stored is the legacy mock default ['event-blr-01', 'event-blr-04'], ignore it and start clean
          const isLegacyMock = parsed.length === 2 && parsed.includes('event-blr-01') && parsed.includes('event-blr-04');
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
          const matchTitle = event.title.toLowerCase().includes(q);
          const matchTagline = event.tagline?.toLowerCase().includes(q);
          const matchDesc = event.description.toLowerCase().includes(q);
          const matchOrgName = event.organizer.name.toLowerCase().includes(q);
          const matchOrgId = event.organizer.id.toLowerCase().includes(q);
          const matchTags = event.categories.some(t => t.toLowerCase().includes(q));
          const matchArea = event.area?.toLowerCase().includes(q);
          const matchVenue = event.venue?.toLowerCase().includes(q);
          const matchSource = event.sourcePlatform?.toLowerCase().includes(q);
          const matchUrl = event.rsvpUrl?.toLowerCase().includes(q);
          const matchSpeakers = event.speakers?.some(s => s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q));

          // Alias matchers:
          const isTpfQuery = q.includes('product folk') || q.includes('tpf');
          const isTpfEvent = event.organizer.id.includes('the-product-folks') || event.organizer.id.includes('tpf') || event.organizer.name.toLowerCase().includes('product folk') || event.title.toLowerCase().includes('tpf');
          if (isTpfQuery && isTpfEvent) return true;

          const isGdgQuery = q.includes('gdg') || q.includes('google developer');
          const isGdgEvent = event.organizer.id.includes('gdg') || event.organizer.name.toLowerCase().includes('gdg') || event.organizer.name.toLowerCase().includes('google developer');
          if (isGdgQuery && isGdgEvent) return true;

          const isGrafanaQuery = q.includes('grafana');
          const isGrafanaEvent = event.organizer.id.includes('grafana') || event.organizer.name.toLowerCase().includes('grafana') || event.title.toLowerCase().includes('grafana');
          if (isGrafanaQuery && isGrafanaEvent) return true;

          const isAtlassianQuery = q.includes('atlassian') || q.includes('ace');
          const isAtlassianEvent = event.organizer.id.includes('atlassian') || event.organizer.name.toLowerCase().includes('atlassian');
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
      selectedCity === 'remote' ? true : normalizeCity(e.city) === normalizeCity(selectedCity)
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
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.tagline}\n\nOrganizer: ${event.organizer.name}\nRSVP: ${event.rsvpUrl}`);
    const location = encodeURIComponent(event.venue || event.virtualPlatform || event.city);
    
    const startIso = new Date(event.isoDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(new Date(event.isoDate).getTime() + 3 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${endIso}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadIcsFile = (event: EventItem) => {
    const startDate = new Date(event.isoDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(new Date(event.isoDate).getTime() + 3 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PulseMeet//Tech Events Radar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@pulsemeet.dev`,
      `DTSTAMP:${startDate}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.tagline} - RSVP at ${event.rsvpUrl}`,
      `LOCATION:${event.venue || event.virtualPlatform || event.city}`,
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
        notificationModalTarget,
        setNotificationModalTarget,
        openNotificationModal,
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
