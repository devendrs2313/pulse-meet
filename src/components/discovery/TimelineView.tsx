import React, { useMemo } from 'react';
import { EventItem } from '../../types/event';
import { TimelineEventCard } from './TimelineEventCard';

interface TimelineViewProps {
  events: EventItem[];
}

interface TimelineDateGroup {
  key: string;
  dayMonth: string;
  weekday: string;
  events: EventItem[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  // Group events by day key
  const groupedDates = useMemo<TimelineDateGroup[]>(() => {
    const map = new Map<string, { dayMonth: string; weekday: string; events: EventItem[] }>();

    events.forEach((event) => {
      let key = 'undated';
      let dayMonth = 'Upcoming';
      let weekday = '';

      if (event.isoDate) {
        const d = new Date(event.isoDate);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const monthNum = String(d.getMonth() + 1).padStart(2, '0');
          const dayNum = String(d.getDate()).padStart(2, '0');
          key = `${year}-${monthNum}-${dayNum}`;

          const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
          // Format "Sep" as "Sept" to match standard calendar display
          const displayMonth = monthShort === 'Sep' ? 'Sept' : monthShort;
          dayMonth = `${d.getDate()} ${displayMonth}`;
          weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
        }
      } else if (event.date) {
        key = event.date;
        dayMonth = event.date;
      }

      if (!map.has(key)) {
        map.set(key, { dayMonth, weekday, events: [] });
      }
      map.get(key)!.events.push(event);
    });

    // Keys are YYYY-MM-DD so natural string sorting sorts them chronologically
    const sortedKeys = Array.from(map.keys()).sort();

    return sortedKeys.map((k) => {
      const item = map.get(k)!;
      // Sort events within the same day by start time
      item.events.sort((a, b) => {
        const timeA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
        const timeB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
        return timeA - timeB;
      });

      return {
        key: k,
        dayMonth: item.dayMonth,
        weekday: item.weekday,
        events: item.events,
      };
    });
  }, [events]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="relative pl-4 sm:pl-8 py-2">
      {/* Vertical Spine Line running all the way down */}
      <div 
        className="absolute top-3 bottom-6 left-[7px] sm:left-[15px] w-0.5 bg-zinc-200/90" 
        aria-hidden="true"
      />

      <div className="space-y-8">
        {groupedDates.map((group) => (
          <div key={group.key} className="relative">
            {/* Timeline Node marker on the spine */}
            <div 
              className="absolute -left-[15px] sm:-left-[23px] top-2.5 w-3 h-3 rounded-full bg-zinc-400 border-2 border-white ring-2 ring-zinc-200" 
              aria-hidden="true"
            />

            {/* Date Pill Header */}
            <div className="mb-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200/90 shadow-2xs text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                <span className="font-bold text-zinc-900">{group.dayMonth}</span>
                {group.weekday && (
                  <span className="text-zinc-500 font-medium">{group.weekday}</span>
                )}
              </div>
            </div>

            {/* Stack of Event Cards for this date */}
            <div className="space-y-3.5">
              {group.events.map((event) => (
                <TimelineEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
