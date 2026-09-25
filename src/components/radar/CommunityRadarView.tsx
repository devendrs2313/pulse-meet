import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Check, 
  ExternalLink, 
  Calendar, 
  Sparkles, 
  Search, 
  History, 
  ChevronDown, 
  ChevronUp, 
  Award,
  CalendarClock,
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Users
} from 'lucide-react';

export const CommunityRadarView: React.FC = () => {
  const { 
    regionalCommunities, 
    allCommunities,
    isCommunityFollowed, 
    toggleFollowCommunity, 
    selectedCity,
    setSearchQuery,
    setActiveTab,
    setIsLocationPromptOpen,
    setNotifyToast
  } = useApp();

  const [communitySearch, setCommunitySearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedCadence, setSelectedCadence] = useState<string>('all');
  const [expandedArchiveId, setExpandedArchiveId] = useState<string | null>(null);

  // If regional communities exist for the active city, use them; otherwise fallback to all
  const targetList = regionalCommunities.length > 0 ? regionalCommunities : allCommunities;

  const filteredCommunities = targetList.filter(c => {
    // Cadence filter
    if (selectedCadence !== 'all' && c.cadenceType !== selectedCadence) return false;

    // Topic filter
    if (selectedTopic !== 'all' && !c.topics.some(t => t.toLowerCase().includes(selectedTopic.toLowerCase()))) return false;

    // Search query
    if (communitySearch.trim() === '') return true;
    const q = communitySearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.topics.some(t => t.toLowerCase().includes(q)) ||
      c.cadence.toLowerCase().includes(q)
    );
  });

  const toggleArchive = (id: string) => {
    setExpandedArchiveId(prev => prev === id ? null : id);
  };

  const handleFollowClick = (commName: string, id: string) => {
    const isCurrentlyFollowed = isCommunityFollowed(id);
    toggleFollowCommunity(id);
    if (!isCurrentlyFollowed) {
      setNotifyToast(`🔔 Early-access alert enabled for ${commName}! You'll be notified when tickets open.`);
      setTimeout(() => setNotifyToast(null), 3500);
    } else {
      setNotifyToast(`Alert removed for ${commName}.`);
      setTimeout(() => setNotifyToast(null), 2500);
    }
  };

  const handleViewEvents = (comm: typeof filteredCommunities[0]) => {
    const cleanName = comm.name
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/\s+(Delhi|Bengaluru|Bangalore|Mumbai|New Delhi|NCR|SF|London)$/i, '')
      .trim();

    const searchKeyword = 
      /the product folks/i.test(comm.name) || /tpf/i.test(comm.id) ? 'The Product Folks' :
      /google developer group|gdg/i.test(comm.name) ? 'GDG' :
      /grafana/i.test(comm.name) ? 'Grafana' :
      /atlassian/i.test(comm.name) ? 'Atlassian' :
      /pydelhi|pydata|python/i.test(comm.name) ? 'Python' :
      /producttank/i.test(comm.name) ? 'ProductTank' :
      /grabchai/i.test(comm.name) ? 'GrabChai' :
      cleanName;

    setSearchQuery(searchKeyword);
    setActiveTab('explore');
  };

  const getCadenceBadge = (cadenceType?: string) => {
    switch (cadenceType) {
      case 'quarterly':
        return {
          label: 'Quarterly Flagship',
          classes: 'bg-purple-50 text-purple-700 border-purple-200/80',
          dot: 'bg-purple-500'
        };
      case 'weekly':
        return {
          label: 'Weekly Ritual',
          classes: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500'
        };
      case 'bi-weekly':
        return {
          label: 'Bi-Weekly Rhythm',
          classes: 'bg-sky-50 text-sky-700 border-sky-200/80',
          dot: 'bg-sky-500'
        };
      case 'monthly':
      default:
        return {
          label: 'Monthly Chapter',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500'
        };
    }
  };

  const cityName = selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1).replace('-', ' ');

  return (
    <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      
      {/* Hero Header: Clear Purpose & User Value */}
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-200/60 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>RECURRING ORGANIZERS · EARLY-ACCESS RADAR</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 leading-tight">
              Community Radar in {cityName}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 max-w-3xl leading-relaxed">
              Top tech and product communities meet on predictable cycles (weekly, monthly, or quarterly). 
              Track active organizers in {cityName}, anticipate when their next edition drops, and subscribe to early alerts before RSVPs sell out.
            </p>
          </div>

          <button
            onClick={() => setIsLocationPromptOpen(true)}
            className="self-start md:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-zinc-800 hover:bg-zinc-50 border border-zinc-200 shadow-2xs transition-all flex-shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Change City: {cityName}</span>
          </button>
        </div>

        {/* 3-Step "How This Helps You" Explainer Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6">
          <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Track Recurring Cadences</div>
              <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                Know who hosts weekly coffee walks, monthly deep dives, or quarterly flagships.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Predict Next Editions</div>
              <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                See expected dates for upcoming editions even before ticket registrations open.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Get Early-Access Alerts</div>
              <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                Click "Get Early Alert" to receive notifications before registrations reach capacity.
              </div>
            </div>
          </div>
        </div>

        {/* Search & Structured Filter Toolbar */}
        <div className="mt-6 space-y-3 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs">
          {/* Top Row: Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={communitySearch}
              onChange={(e) => setCommunitySearch(e.target.value)}
              placeholder="Search by community name, topic, or keyword (e.g. The Product Folks, Atlassian, AI, Kubernetes)..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/80 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter Rows */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
            {/* Domain / Focus filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
                Domain:
              </span>
              {[
                { id: 'all', label: 'All Tracks' },
                { id: 'Product Management', label: '💼 Product' },
                { id: 'AI / ML', label: '🧠 AI & ML' },
                { id: 'Cloud & DevOps', label: '☁️ Cloud' },
                { id: 'Systems', label: '⚡ Systems & Rust' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedTopic(f.id)}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedTopic === f.id
                      ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Rhythm / Cadence filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
                Rhythm:
              </span>
              {[
                { id: 'all', label: 'All Rhythms' },
                { id: 'quarterly', label: '🟣 Quarterly' },
                { id: 'monthly', label: '🟢 Monthly' },
                { id: 'weekly', label: '☕ Weekly' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCadence(c.id)}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCadence === c.id
                      ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Active Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold text-zinc-500">
          Showing {filteredCommunities.length} Active Communities in {cityName}
        </div>
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommunities.map((comm) => {
            const isFollowed = isCommunityFollowed(comm.id);
            const isArchiveOpen = expandedArchiveId === comm.id;
            const hasPastEditions = comm.pastEditions && comm.pastEditions.length > 0;
            const badge = getCadenceBadge(comm.cadenceType);

            return (
              <div
                key={comm.id}
                className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Community Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={comm.avatar}
                        alt={comm.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm sm:text-base text-zinc-900 leading-snug truncate">
                            {comm.name}
                          </h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        </div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                          {comm.memberCount.toLocaleString()} members
                        </div>
                      </div>
                    </div>

                    {/* Cadence Pill */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${badge.classes} flex-shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Intelligence Spotlight Box */}
                  <div className="mb-3.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2">
                    {/* Meeting Schedule */}
                    <div className="flex items-center gap-2 text-xs text-zinc-700">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="font-medium text-zinc-800">Rhythm:</span>
                      <span className="text-zinc-600">{comm.cadence}</span>
                    </div>

                    {/* Next Edition Prediction */}
                    {comm.nextForecast && (
                      <div className="flex items-center gap-2 text-xs text-indigo-950 bg-indigo-50/70 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                        <CalendarClock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        <span className="font-semibold">{comm.nextForecast}</span>
                      </div>
                    )}

                    {/* Consistency Score */}
                    {comm.consistencyScore && (
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <Award className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{comm.consistencyScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 leading-relaxed mb-3.5 line-clamp-2">
                    {comm.description}
                  </p>

                  {/* Topic tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {comm.topics.map(t => (
                      <span 
                        key={t}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200/50"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Live Status indicator */}
                  <div className="mb-4">
                    {comm.upcomingCount > 0 ? (
                      <button
                        onClick={() => handleViewEvents(comm)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/70 text-emerald-800 text-xs font-semibold transition-all group"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                          </span>
                          <span>{comm.upcomingCount} Event{comm.upcomingCount > 1 ? 's' : ''} Scheduled on Timeline</span>
                        </span>
                        <span className="text-[11px] text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-500 text-xs font-medium flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>Next edition in planning · Alerts open</span>
                      </div>
                    )}
                  </div>

                  {/* Past Editions & Takeaways Accordion */}
                  {hasPastEditions && (
                    <div className="mb-4">
                      <button
                        onClick={() => toggleArchive(comm.id)}
                        type="button"
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-xs font-semibold text-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Past Meetup Takeaways ({comm.pastEditions?.length})</span>
                        </div>
                        {isArchiveOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </button>

                      {isArchiveOpen && (
                        <div className="mt-2 p-3 bg-zinc-50/90 rounded-xl border border-zinc-200 space-y-2.5 text-xs">
                          <div className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                            Discussion History & Quality Check
                          </div>
                          {comm.pastEditions?.map((ed) => (
                            <div key={ed.id} className="p-2.5 bg-white rounded-lg border border-zinc-200 shadow-2xs">
                              <div className="flex items-center justify-between font-semibold text-zinc-900 text-xs">
                                <span className="truncate mr-2">{ed.title}</span>
                                <span className="text-[10px] font-mono text-indigo-600 flex-shrink-0">{ed.date}</span>
                              </div>
                              <div className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed bg-zinc-50 p-2 rounded border border-zinc-100">
                                💡 <strong>Key Discussion:</strong> {ed.keyTakeaways}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-2">
                                <span>👥 {ed.attendees} attendees</span>
                                <span>·</span>
                                <span className="truncate">{ed.venueOrPlatform}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <a
                    href={comm.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                    title="Visit official portal"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Primary Subscribe / Early Alert Button */}
                  <button
                    onClick={() => handleFollowClick(comm.name, comm.id)}
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs ${
                      isFollowed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Alert Active</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Get Early Alert</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200/80 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">
            No communities matching this filter
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Try resetting your topic or rhythm filters to view all active organizers.
          </p>
          <button
            onClick={() => {
              setSelectedTopic('all');
              setSelectedCadence('all');
              setCommunitySearch('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
