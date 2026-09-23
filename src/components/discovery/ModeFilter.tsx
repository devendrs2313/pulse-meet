import React from 'react';
import { useApp } from '../../context/AppContext';
import { normalizeCity } from '../../lib/supabase';
import { FormatType } from '../../types/event';
import { MapPin, Globe } from 'lucide-react';

export const ModeFilter: React.FC = () => {
  const { selectedFormats, toggleFormat, selectedCity, events } = useApp();

  // Compute live counts for current city/context:
  // In-Person includes offline and hybrid
  // Virtual includes online and hybrid
  const regionalEvents = events.filter(e => 
    selectedCity === 'remote' ? true : normalizeCity(e.city) === normalizeCity(selectedCity)
  );

  const inPersonCount = regionalEvents.filter(e => e.mode === 'offline' || e.mode === 'both').length;
  const virtualCount = regionalEvents.filter(e => e.mode === 'online' || e.mode === 'both').length;

  const formats: { id: FormatType; label: string; icon: React.ReactNode; desc: string; count: number }[] = [
    {
      id: 'offline',
      label: 'In-Person',
      icon: <MapPin className="w-3.5 h-3.5 text-rose-500" />,
      desc: 'Venues & physical spaces (includes Hybrid)',
      count: inPersonCount,
    },
    {
      id: 'online',
      label: 'Virtual',
      icon: <Globe className="w-3.5 h-3.5 text-sky-500" />,
      desc: 'Streams & webinars (includes Hybrid)',
      count: virtualCount,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/80">
        {formats.map((fmt) => {
          const isSelected = selectedFormats.includes(fmt.id);
          return (
            <button
              key={fmt.id}
              onClick={() => toggleFormat(fmt.id)}
              type="button"
              className={`flex items-center justify-between px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-xl text-left transition-all duration-150 ${
                isSelected
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold ring-1 ring-zinc-900/5'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`p-1 rounded-lg ${isSelected ? 'bg-indigo-50' : 'bg-zinc-200/60'}`}>
                  {fmt.icon}
                </span>
                <div className="truncate">
                  <div className="text-xs sm:text-sm font-medium leading-tight truncate">{fmt.label}</div>
                  <div className="text-[10px] text-zinc-400 font-normal hidden sm:block truncate">{fmt.desc}</div>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ml-1.5 flex-shrink-0 ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'bg-zinc-200/70 text-zinc-500'
                }`}
              >
                {fmt.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
