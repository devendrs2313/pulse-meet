/**
 * Utility functions for validating and extracting event host URLs
 */

export function isValidHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

export function getEventHostDomain(url?: string | null): string {
  if (!url || !isValidHttpUrl(url)) return 'Official Event';
  try {
    const parsed = new URL(url.trim());
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Official Event';
  }
}

/**
 * Directly opens verified event RSVP / booking URL in a new window/tab safely
 */
export function openEventBookingUrl(url?: string | null): boolean {
  if (!isValidHttpUrl(url)) {
    return false;
  }
  const cleanUrl = url!.trim();
  window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  return true;
}

const STORAGE_REMOVED_EVENTS_KEY = 'pulse_removed_events';

export interface RemovedEventEntry {
  id: string;
  rsvpUrl?: string;
  reason?: string;
  removedAt: string;
}

/**
 * Retrieve list of events flagged or confirmed as deleted/removed by host platform
 */
export function getRemovedEvents(): RemovedEventEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_REMOVED_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Checks if an event has been marked as removed / delisted
 */
export function isEventRemoved(eventId: string, rsvpUrl?: string | null): boolean {
  if (!eventId) return false;
  const removed = getRemovedEvents();
  const idMatch = removed.some(r => r.id === eventId);
  if (idMatch) return true;

  if (rsvpUrl) {
    const cleanRsvp = rsvpUrl.trim().toLowerCase();
    return removed.some(r => r.rsvpUrl && r.rsvpUrl.trim().toLowerCase() === cleanRsvp);
  }
  return false;
}

/**
 * Marks an event as removed/takedown so it disappears immediately from catalog and feeds
 */
export function markEventAsRemoved(eventId: string, rsvpUrl?: string | null, reason?: string): void {
  try {
    const list = getRemovedEvents();
    if (!list.some(r => r.id === eventId)) {
      list.push({
        id: eventId,
        rsvpUrl: rsvpUrl || undefined,
        reason: reason || 'Event link no longer active on host site',
        removedAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_REMOVED_EVENTS_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.error('Failed to mark event as removed:', err);
  }
}

/**
 * Unmarks an event if organizer restores it
 */
export function unmarkEventAsRemoved(eventId: string): void {
  try {
    const list = getRemovedEvents().filter(r => r.id !== eventId);
    localStorage.setItem(STORAGE_REMOVED_EVENTS_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Checks the liveness of an event registration URL via the server proxy endpoint
 */
export async function checkEventUrlLiveness(url?: string | null): Promise<{ available: boolean; status?: number; reason?: string }> {
  if (!url || !isValidHttpUrl(url)) {
    return { available: false, reason: 'Invalid or missing URL format' };
  }

  try {
    const res = await fetch(`/api/check-url?url=${encodeURIComponent(url.trim())}`, {
      signal: AbortSignal.timeout(7000)
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e: any) {
    // Fallback if proxy not active: do not block unless we get explicit 404 confirmation
  }

  return { available: true };
}
