import React from 'react';
import { useApp } from '../../context/AppContext';
import { VibeType } from '../../types/event';
import { Terminal, Coffee, Cpu, MessageSquare, Sparkles } from 'lucide-react';
import { EVENTS_DATA } from '../../data/mockData';

export const VibeCompass: React.FC = () => {
  const { selectedVibe, setSelectedVibe } = useApp();

  const vibes: { id: VibeType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all',
      label: 'All Vibes',
      icon: <Sparkles className="w-3 h-3 text-indigo-500" />,
      count: EVENTS_DATA.length,
    },
    {
      id: 'hands-on',
      label: 'Hands-on',
      icon: <Terminal className="w-3 h-3 text-indigo-500" />,
      count: EVENTS_DATA.filter(e => e.vibe === 'hands-on').length,
    },
    {
      id: 'casual-coffee',
      label: 'Casual Coffee',
      icon: <Coffee className="w-3 h-3 text-amber-500" />,
      count: EVENTS_DATA.filter(e => e.vibe === 'casual-coffee').length,
    },
    {
      id: 'deep-tech',
      label: 'Deep Tech',
      icon: <Cpu className="w-3 h-3 text-emerald-500" />,
      count: EVENTS_DATA.filter(e => e.vibe === 'deep-tech').length,
    },
    {
      id: 'career-pitching',
      label: 'Career & Pitch',
      icon: <MessageSquare className="w-3 h-3 text-rose-500" />,
      count: EVENTS_DATA.filter(e => e.vibe === 'career-pitching').length,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mr-1 flex-shrink-0">
        Vibe:
      </span>
      {vibes.map((v) => {
        const isSelected = selectedVibe === v.id;
        return (
          <button
            key={v.id}
            onClick={() => setSelectedVibe(v.id)}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-600 border border-zinc-200/50'
            }`}
          >
            {v.icon}
            <span>{v.label}</span>
            <span className={`text-[10px] font-mono px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'text-zinc-400'}`}>
              {v.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
