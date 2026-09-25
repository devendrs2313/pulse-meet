import React, { useMemo } from 'react';
import { EventItem } from '../../types/event';
import { TimelineEventCard } from './TimelineEventCard';
import { filterActiveUpcomingEvents } from '../../lib/dateUtils';

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
  // Group active events by day key
  const groupedDates = useMemo<TimelineDateGroup[]>(() => {
    const activeEvents = filterActiveUpcomingEvents(events);
    const map = new Map<string, { dayMonth: string; weekday: string; events: EventItem[] }>();

    activeEvents.forEach((event) => {
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
    <div className="relative pl-5 sm:pl-7 border-l-2 border-dotted border-zinc-200/90 ml-2 sm:ml-3 py-1 space-y-7 sm:space-y-9">
      {groupedDates.map((group) => {
        let datePrefix = group.weekday;
        let shortWeekday = group.weekday.slice(0, 3).toUpperCase();
        if (group.key !== 'undated') {
          const parts = group.key.split('-').map(Number);
          if (parts.length === 3) {
            const now = new Date();
            const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const tom = new Date(now);
            tom.setDate(tom.getDate() + 1);
            const tomKey = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(tom.getDate()).padStart(2, '0')}`;

            if (group.key === todayKey) {
              datePrefix = 'Today';
            } else if (group.key === tomKey) {
              datePrefix = 'Tomorrow';
            }
          }
        }

        return (
          <div key={group.key} className="relative">
            {/* Hollow circular node on the dotted spine matching Lovable */}
            <div 
              className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-400 bg-[#FAFAFA]" 
              aria-hidden="true" 
            />

            {/* Date Section Header: e.g. "Today FRI" */}
            <div className="flex items-baseline gap-2 mb-3.5">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                {datePrefix}
              </h2>
              {shortWeekday && (
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
                  {shortWeekday}
                </span>
              )}
              <span className="ml-auto text-[11px] font-mono text-zinc-400">
                {group.dayMonth}
              </span>
            </div>

            {/* Stack of Precision Event Cards */}
            <div className="space-y-3.5 sm:space-y-4">
              {group.events.map((event) => (
                <TimelineEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
