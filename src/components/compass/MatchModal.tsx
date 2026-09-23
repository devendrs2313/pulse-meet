import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FormatType } from '../../types/event';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Terminal, 
  Coffee, 
  Cpu, 
  Rocket,
  MapPin,
  Globe
} from 'lucide-react';

export const MatchModal: React.FC = () => {
  const { 
    isMatchModalOpen, 
    setIsMatchModalOpen, 
    setSelectedFormats,
    setSelectedCategories,
    availableCategories,
    setNotifyToast,
    setActiveTab
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Multi-select states: click to select, click again to unselect!
  const [tempFormats, setTempFormats] = useState<FormatType[]>(['offline', 'online']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['AI / ML', 'Product Management']);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['hands-on', 'deep-tech']);

  if (!isMatchModalOpen) return null;

  const toggleFormat = (fmt: FormatType) => {
    setTempFormats(prev => 
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const toggleInterest = (cat: string) => {
    setSelectedInterests(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) ? prev.filter(s => s !== styleId) : [...prev, styleId]
    );
  };

  const handleComplete = () => {
    // If both or neither selected, show all; otherwise set single selected format
    if (tempFormats.length === 1) {
      setSelectedFormats(tempFormats);
    } else {
      setSelectedFormats([]); // shows all
    }

    if (selectedInterests.length > 0) {
      setSelectedCategories(selectedInterests);
    } else {
      setSelectedCategories(['All Fields']);
    }

    setIsMatchModalOpen(false);
    setActiveTab('explore');
    setNotifyToast('✨ Tailored agenda matched to your multi-select preferences!');
    setTimeout(() => setNotifyToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl p-6 sm:p-8 relative transition-all"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMatchModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Match Compass Wizard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Tailor your event radar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Click any option to select, or click again to unselect. Multi-select is supported on all steps.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
          {[
            { num: 1, label: 'Attendance Mode' },
            { num: 2, label: 'Fields of Work' },
            { num: 3, label: 'Event Style' },
          ].map((s) => (
            <div 
              key={s.num} 
              onClick={() => setStep(s.num as 1 | 2 | 3)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                step === s.num
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                  : step > s.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 text-zinc-400'
              }`}>
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${
                step === s.num ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Format Multi-Select (In-Person / Virtual) */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                1. Select Preferred Formats (Multi-Select)
              </div>
              <span className="text-[11px] text-zinc-400">Click to select/unselect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { 
                  id: 'offline' as FormatType, 
                  title: 'In-Person Gatherings', 
                  desc: 'Offline venues, developer hubs, and hybrid meetups', 
                  icon: <MapPin className="w-5 h-5 text-rose-600" /> 
                },
                { 
                  id: 'online' as FormatType, 
                  title: 'Virtual / Online Events', 
                  desc: 'Zoom masterclasses, livestreams, and hybrid sessions', 
                  icon: <Globe className="w-5 h-5 text-sky-600" /> 
                },
              ].map(f => {
                const isSelected = tempFormats.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleFormat(f.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 shadow-sm'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white opacity-80'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-zinc-900 flex items-center justify-between">
                        <span>{f.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{f.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-zinc-400 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
              💡 <em>Selecting both or leaving both unselected shows all events. Hybrid events are automatically included in both.</em>
            </div>
          </div>
        )}

        {/* Step 2: Fields of Interest (Multi-Select) */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                2. Select Tech Categories & Domains (Multi-Select)
              </div>
              <span className="text-[11px] text-zinc-400">Click to select/unselect</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableCategories.filter(c => c !== 'All Fields').map(cat => {
                const isSelected = selectedInterests.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleInterest(cat)}
                    type="button"
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600/30'
                        : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-700 border border-zinc-200/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Event Gathering Style (Multi-Select) */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                3. Gathering Style Preference (Multi-Select)
              </div>
              <span className="text-[11px] text-zinc-400">Click to select/unselect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'hands-on', title: 'Hands-on Building', desc: 'Hackathons, coding sprints, live teardowns', icon: <Terminal className="w-4 h-4 text-indigo-600" /> },
                { id: 'casual-coffee', title: 'Casual Coffee Mixers', desc: 'Sunday founder chats, GrabChai & casual meetups', icon: <Coffee className="w-4 h-4 text-amber-600" /> },
                { id: 'deep-tech', title: 'Deep Engineering Talks', desc: 'Architecture, systems, distributed databases', icon: <Cpu className="w-4 h-4 text-emerald-600" /> },
                { id: 'flagships', title: 'Flagships & Conferences', desc: 'Unconferences, summits, product leader AMAs', icon: <Rocket className="w-4 h-4 text-rose-600" /> },
              ].map(s => {
                const isSelected = selectedStyles.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStyle(s.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 shadow-sm'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-zinc-900 flex items-center justify-between">
                        <span>{s.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View My Tailored Radar</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
