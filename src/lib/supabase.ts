import { EventItem } from '../types/event';

// Supabase Environment Configurations
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Normalizes city names for consistent comparison across slug and display formats
 * e.g., 'Delhi NCR', 'delhi-ncr', 'Delhi' -> 'delhincr'
 */
export function normalizeCity(c: string): string {
  return (c || '').toLowerCase().replace(/[\s-_]+/g, '');
}

/**
 * Returns true if Supabase project URL and anon public key are configured in environment
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Standard headers for Supabase PostgREST queries
 */
function getHeaders(): HeadersInit {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
}

export interface SyncStatus {
  lastSyncedAt: string | null;
  status: 'active' | 'synced' | 'local_fallback';
  eventsCount: number;
}

/**
 * Fetch live events from Supabase PostgREST table public.events
 */
export async function fetchLiveEvents(): Promise<EventItem[] | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/events?select=*&order=iso_date.asc`, {
      headers: getHeaders(),
      // 5 second timeout to prevent UI blocking
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      console.warn(`[Supabase] Live events fetch returned ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Map database snake_case or JSON fields to EventItem
    return data.map((item: any): EventItem => ({
      id: item.id,
      title: item.title,
      tagline: item.tagline || '',
      description: item.description,
      mode: item.mode || 'offline',
      eventType: item.event_type || item.eventType || 'meetup',
      vibe: item.vibe || 'deep-tech',
      categories: item.categories || [],
      date: item.date,
      time: item.time,
      isoDate: item.iso_date || item.isoDate,
      city: item.city,
      area: item.area || undefined,
      venue: item.venue || undefined,
      venueUrl: item.venue_url || item.venueUrl || undefined, // Strict venue link check
      rsvpUrl: item.rsvp_url || item.rsvpUrl,
      sourcePlatform: item.source_platform || item.sourcePlatform || 'Luma',
      price: item.price || 'Free',
      organizer: (item.organizer && typeof item.organizer === 'object') ? {
        id: item.organizer.id || 'community-organizer',
        name: item.organizer.name || 'Community Organizer',
        avatar: item.organizer.avatar || '',
        verified: Boolean(item.organizer.verified ?? true),
        cadenceBadge: item.organizer.cadenceBadge || 'Active Member',
        memberCount: Number(item.organizer.memberCount) || 500
      } : {
        id: 'community-organizer',
        name: typeof item.organizer === 'string' && item.organizer.trim() ? item.organizer.trim() : 'Community Organizer',
        avatar: '',
        verified: true,
        cadenceBadge: 'Active Member',
        memberCount: 500
      },
      seats: item.seats || undefined,
      speakers: item.speakers || [],
      bannerUrl: item.banner_image || item.bannerUrl || undefined,
      isNew: item.is_new !== undefined ? Boolean(item.is_new) : (item.isNew !== undefined ? Boolean(item.isNew) : undefined),
      createdAt: item.created_at || item.createdAt
    }));
  } catch (error) {
    console.warn('[Supabase] Failed to fetch live events, using local fallback:', error);
    return null;
  }
}

/**
 * Fetch latest execution info from public.sync_logs
 */
export async function fetchSyncStatus(): Promise<SyncStatus> {
  if (!isSupabaseConfigured()) {
    return {
      lastSyncedAt: null,
      status: 'local_fallback',
      eventsCount: 0
    };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/sync_logs?select=*&order=ran_at.desc&limit=1`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(3000)
    });

    if (res.ok) {
      const logs = await res.json();
      if (logs && logs.length > 0) {
        return {
          lastSyncedAt: logs[0].ran_at,
          status: 'synced',
          eventsCount: logs[0].events_upserted || 0
        };
      }
    }
  } catch (e) {
    // Ignore logging errors
  }

  return {
    lastSyncedAt: null,
    status: 'synced',
    eventsCount: 0
  };
}
