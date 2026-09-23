import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CITIES } from '../../data/mockData';
import { EventMode } from '../../types/event';
import { 
  Navigation, 
  Search, 
  Check, 
  Sparkles, 
  Radar, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

export const LocationPromptModal: React.FC = () => {
  const { 
    isLocationPromptOpen, 
    setIsLocationPromptOpen,
    selectedCity, 
    modeFilter, 
    scanRegion, 
    isScanningRegion
  } = useApp();

  const [tempCity, setTempCity] = useState(selectedCity);
  const [tempMode, setTempMode] = useState<EventMode>(modeFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectSuccess, setDetectSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isLocationPromptOpen) {
      setTempCity(selectedCity);
      setTempMode(modeFilter);
    }
  }, [isLocationPromptOpen, selectedCity, modeFilter]);

  if (!isLocationPromptOpen) return null;

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Check closest known tech city or default to Bengaluru
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          let closest = CITIES[0];
          let minDistance = Infinity;

          CITIES.forEach(c => {
            if (c.lat && c.lng) {
              const d = Math.hypot(c.lat - userLat, c.lng - userLng);
              if (d < minDistance) {
                minDistance = d;
                closest = c;
              }
            }
          });

          setTempCity(closest.id);
          setIsDetecting(false);
          setDetectSuccess(`Detected: ${closest.name}, ${closest.country}`);
        },
        () => {
          // Geolocation blocked or unavailable -> default to Bengaluru with friendly notification
          setTimeout(() => {
            setTempCity('bengaluru');
            setIsDetecting(false);
            setDetectSuccess('Set to tech capital: Bengaluru, India');
          }, 600);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setTempCity('bengaluru');
        setIsDetecting(false);
        setDetectSuccess('Set to Bengaluru, India');
      }, 500);
    }
  };

  const handleConfirm = () => {
    scanRegion(tempCity, tempMode);
  };

  const filteredCities = CITIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCityObj = CITIES.find(c => c.id === tempCity) || CITIES[0];

  const handleClose = () => {
    localStorage.setItem('pulse_city_configured', 'true');
    setIsLocationPromptOpen(false);
  };

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full border border-zinc-200 shadow-2xl p-6 sm:p-8 relative overflow-hidden my-6 transition-all"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close location scanner"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Background Radar Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/60 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="mb-6 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-200/60">
            <Radar className="w-3.5 h-3.5 animate-spin" />
            <span>Regional Radar Initialization</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
            Where should we scan for tech events?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
            PulseMeet discovers top organizing communities, recurrent meeting cadences, and verified bootcamps tailored specifically to your city.
          </p>
        </div>

        {/* Scanning Animation State */}
        {isScanningRegion ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Radar className="w-8 h-8 animate-spin" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Scanning {selectedCityObj.name} Community Graph...
              </h3>
              <p className="text-xs text-zinc-500 mt-1 font-mono">
                Ingesting active GDG, Meetup, Luma, and Hackathon cadences
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Auto-detect button */}
            <div>
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 text-indigo-900 font-semibold text-xs sm:text-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                    <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="text-left">
                    <div>{isDetecting ? 'Detecting your location...' : 'Auto-Detect My Current Location'}</div>
                    <div className="text-[11px] text-indigo-700/80 font-normal">
                      {detectSuccess || 'Uses browser GPS to lock on nearest tech hub'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* City Selection Grid / Search */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Or Pick a Regional Tech Hub
                </label>
                <span className="text-[11px] text-zinc-400">Hubs with verified cadences</span>
              </div>

              {/* City search input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city (e.g. Bengaluru, San Francisco, Delhi)..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* City Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {filteredCities.map((city) => {
                  const isSelected = tempCity === city.id;
                  return (
                    <button
                      key={city.id}
                      onClick={() => setTempCity(city.id)}
                      type="button"
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 font-semibold shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-zinc-900 font-medium truncate">{city.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">
                        {city.activeEvents} events · {city.country}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attendance Mode (Offline vs Online vs Both) */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
                Preferred Attendance Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'offline', label: '📍 Offline Only', desc: 'In-person venues' },
                  { id: 'online', label: '🌐 Online Only', desc: 'Webinars & streams' },
                  { id: 'both', label: '⚡ Both', desc: 'In-person + online' },
                ].map((m) => {
                  const isSelected = tempMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setTempMode(m.id as EventMode)}
                      type="button"
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 font-semibold shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-semibold text-zinc-900">{m.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <button
                onClick={handleConfirm}
                type="button"
                className="w-full py-3 px-6 rounded-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Scan & Discover {selectedCityObj.name} Gatherings</span>
              </button>
              <div className="text-center mt-2 text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero spam · Verified organizers & chapters only</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
