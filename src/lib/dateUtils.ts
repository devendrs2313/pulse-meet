import { EventItem } from '../types/event';

/**
 * Parses an event's start time into a Date object.
 * Checks isoDate first, then falls back to parsing date and time strings.
 */
export function getEventStartDateTime(event: EventItem): Date | null {
  if (event.isoDate) {
    const d = new Date(event.isoDate);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }

  if (event.date) {
    try {
      // Attempt to combine date and time if available
      // e.g. "Friday, Sep 25, 2026", "7:00 PM – 10:30 PM IST"
      let dateStr = event.date;
      if (event.time) {
        const startTimePart = event.time.split('–')[0].split('-')[0].replace('IST', '').trim();
        dateStr = `${event.date} ${startTimePart}`;
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d;
      }
    } catch {
      // fallback
    }
  }

  return null;
}

/**
 * Checks if an event has already started, completed, or its registration is closed.
 * Compares event start time against reference date (defaults to current system time).
 */
export function isEventStartedOrCompleted(event: EventItem, refTime: Date = new Date()): boolean {
  const eventStart = getEventStartDateTime(event);
  if (!eventStart) {
    // If no date at all, do not filter out
    return false;
  }

  // If current time is equal to or after the start time, registration is closed / event started
  return refTime.getTime() >= eventStart.getTime();
}

/**
 * Returns true if an event's registration is still open and the event is in the future.
 */
export function isEventRegistrationOpen(event: EventItem, refTime: Date = new Date()): boolean {
  return !isEventStartedOrCompleted(event, refTime);
}

/**
 * Filters an array of events to return ONLY active, future events where registration is open.
 */
export function filterActiveUpcomingEvents(events: EventItem[], refTime: Date = new Date()): EventItem[] {
  return events.filter(e => isEventRegistrationOpen(e, refTime));
}
