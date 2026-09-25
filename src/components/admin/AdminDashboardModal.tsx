import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getRegisteredUsers, SUPER_ADMIN_EMAIL } from '../../lib/auth';
import { UserProfile } from '../../types/auth';
import { 
  X, 
  ShieldCheck, 
  Search, 
  Download, 
  MapPin, 
  RefreshCw,
  Loader2,
  Users,
  ExternalLink,
  Bot,
  KeyRound,
  Radio,
  PlusCircle,
  ShieldAlert
} from 'lucide-react';
import { CITIES } from '../../data/mockData';
import { getGeminiApiKey, saveGeminiApiKey } from '../../lib/aiAgent';
import { getRemovedEvents, checkEventUrlLiveness, isValidHttpUrl } from '../../lib/urlUtils';

export const AdminDashboardModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    currentUser, 
    setNotifyToast, 
    events, 
    refreshLiveEvents, 
    syncStatus,
    removeEvent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'ingestion'>('users');
  
  // User directory state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');

  // AI Key state
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());

  const handleSaveGemini = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(geminiKey);
    setNotifyToast(geminiKey.trim() ? '✨ Gemini LLM API Key saved for PulseAI Agent!' : 'PulseAI Agent set to Grounded Cadence Engine.');
  };

  // Quick URL Importer & Ingestion state
  const [importUrl, setImportUrl] = useState('');
  const [importTitle, setImportTitle] = useState('');
  const [importOrganizer, setImportOrganizer] = useState('');
  const [importDate, setImportDate] = useState('');
  const [importTime, setImportTime] = useState('');
  const [importVenue, setImportVenue] = useState('');
  const [importCity, setImportCity] = useState('Delhi NCR');
  const [importCategory, setImportCategory] = useState('AI / ML');
  const [importMode, setImportMode] = useState<'offline' | 'online' | 'hybrid'>('offline');
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [isAuditingLinks, setIsAuditingLinks] = useState(false);

  useEffect(() => {
    if (isAdminModalOpen) {
      setUsers(getRegisteredUsers());
    }
  }, [isAdminModalOpen]);

  if (!isAdminModalOpen || !currentUser?.isAdmin) return null;

  const handleRefresh = () => {
    setUsers(getRegisteredUsers());
    setNotifyToast('User Directory refreshed.');
  };

  const handleRunTakedownAudit = async () => {
    setIsAuditingLinks(true);
    let deadCount = 0;
    const toCheck = events.slice(0, 25);
    for (const ev of toCheck) {
      if (isValidHttpUrl(ev.rsvpUrl)) {
        const probe = await checkEventUrlLiveness(ev.rsvpUrl);
        if (!probe.available) {
          deadCount++;
          removeEvent(ev.id, probe.reason);
        }
      }
    }
    setIsAuditingLinks(false);
    if (deadCount > 0) {
      setNotifyToast(`🧹 Audit Complete: Detected and pruned ${deadCount} delisted event(s) from catalog.`);
    } else {
      setNotifyToast(`✅ Link Audit Complete: All scanned event links are live and active!`);
    }
  };

  const handleUrlBlur = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    
    // Heuristic detection based on domain
    if (trimmed.includes('linkedin.com') && !importOrganizer) {
      setImportOrganizer('LinkedIn Professional Network');
    } else if (trimmed.includes('facebook.com') && !importOrganizer) {
      setImportOrganizer('Facebook Community Group');
    } else if (trimmed.includes('lu.ma') && !importOrganizer) {
      setImportOrganizer('Luma Tech Community');
    } else if (trimmed.includes('atlassian') && !importOrganizer) {
      setImportOrganizer('Atlassian Community Chapter');
    } else if ((trimmed.includes('producttank') || trimmed.includes('mindtheproduct')) && !importOrganizer) {
      setImportOrganizer('ProductTank Community');
    }

    if (!importTitle) {
      try {
        const pathSegments = new URL(trimmed).pathname.split('/').filter(Boolean);
        const last = pathSegments[pathSegments.length - 1];
        if (last && last.length > 3) {
          const formatted = decodeURIComponent(last).replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          setImportTitle(formatted);
        }
      } catch {}
    }
  };

  const handleManualSyncTrigger = async () => {
    setIsSyncingLive(true);
    await refreshLiveEvents();
    setIsSyncingLive(false);
    setNotifyToast('⚡ Live Event Catalog refreshed from Supabase!');
  };

  const handlePublishCustomEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTitle.trim() || !importDate.trim()) {
      setNotifyToast('⚠️ Please enter at least an Event Title and Date.');
      return;
    }

    setIsSubmittingImport(true);
    const normCity = importCity.toLowerCase().replace(/[\s-_]+/g, '');
    const citySlug = 
      normCity.includes('delhi') ? 'delhi-ncr' :
      normCity.includes('bengaluru') || normCity.includes('bangalore') ? 'bengaluru' :
      normCity.includes('francisco') || normCity.includes('sf') ? 'san-francisco' :
      normCity.includes('mumbai') ? 'mumbai' :
      normCity.includes('london') ? 'london' :
      'remote';

    const newEvt = {
      id: `custom-evt-${Date.now()}`,
      title: importTitle.trim(),
      tagline: `Curated community event by ${importOrganizer || 'Community'}`,
      description: `${importTitle.trim()} organized by ${importOrganizer || 'Community Network'}. RSVP directly via ${importUrl || 'registration link'}.`,
      date: importDate.trim(),
      time: importTime.trim() || '05:00 PM - 08:00 PM',
      isoDate: new Date().toISOString(),
      location: importVenue.trim() || importCity,
      city: citySlug,
      venue: importVenue.trim() || importCity,
      venueUrl: (importUrl.startsWith('http') && !importUrl.includes('linkedin') && !importUrl.includes('facebook')) ? importUrl : undefined,
      price: 'Free',
      mode: importMode,
      categories: [importCategory],
      organizer: {
        id: `org-${Date.now()}`,
        name: importOrganizer || 'Community Collective',
        role: 'Community Host',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        verified: true
      },
      rsvpUrl: importUrl.trim() || 'https://lu.ma',
      status: 'Open RSVP',
      featured: true,
      cadence: 'Curated'
    };

    try {
      const existingCustom = JSON.parse(localStorage.getItem('pulse_custom_events') || '[]');
      existingCustom.unshift(newEvt);
      localStorage.setItem('pulse_custom_events', JSON.stringify(existingCustom));
      await refreshLiveEvents();

      setImportUrl('');
      setImportTitle('');
      setImportOrganizer('');
      setImportDate('');
      setImportTime('');
      setImportVenue('');
      setNotifyToast(`🎉 Successfully published "${newEvt.title}" to the live catalog!`);
    } catch (err: any) {
      setNotifyToast(`⚠️ Failed to publish: ${err?.message || 'Storage error'}`);
    } finally {
      setIsSubmittingImport(false);
    }
  };

  // Filter users based on search query, role, and city
  const filteredUsers = users.filter(u => {
    if (selectedRoleFilter !== 'All' && u.role !== selectedRoleFilter) return false;
    if (selectedCityFilter !== 'All' && u.city !== selectedCityFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.categories.some(c => c.toLowerCase().includes(q))
    );
  });

  // Export Users to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'City', 'Preferred Formats', 'Categories', 'Is Admin', 'Joined Date'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      `"${u.role}"`,
      u.city,
      `"${u.formats.join(', ')}"`,
      `"${u.categories.join(', ')}"`,
      u.isAdmin ? 'Yes' : 'No',
      u.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulsemeet_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-5xl w-full border border-zinc-200 shadow-2xl p-5 sm:p-7 relative transition-all my-6 max-h-[90vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-100 flex-shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Super Admin Access · {SUPER_ADMIN_EMAIL}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <span>Super Admin Command Console</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage user directory, review live platform stats, and configure automated multi-source ingestion pipeline.
            </p>
          </div>

          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 pb-1 border-b border-zinc-100 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Directory ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ingestion')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ingestion'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Feed Ingestion & Scheduler</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="ml-auto p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors"
            title="Refresh All"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeTab === 'users' ? (
          /* =================== TAB 1: USERS DIRECTORY =================== */
          <>
            {/* Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3.5 flex-shrink-0">
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total Registered</div>
                <div className="text-xl font-bold text-zinc-900 mt-0.5">{users.length}</div>
                <div className="text-[10px] text-emerald-600 font-medium">Active builder community</div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
                <div className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">Product & Leaders</div>
                <div className="text-xl font-bold text-indigo-950 mt-0.5">
                  {users.filter(u => u.role === 'Product Manager' || u.role === 'Engineering Leader').length}
                </div>
                <div className="text-[10px] text-indigo-600 font-medium">PM & Architecture network</div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Delhi NCR Builders</div>
                <div className="text-xl font-bold text-zinc-900 mt-0.5">
                  {users.filter(u => u.city === 'delhi-ncr').length}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">Primary chapter hub</div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">Sync Scheduler</div>
                <div className="text-xs font-bold text-emerald-950 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Every 3 Hours</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Automated Event Pipeline</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-3 flex-shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or topic..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedRoleFilter}
                  onChange={e => setSelectedRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="All">All Roles</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="AI / ML Practitioner">AI / ML Practitioner</option>
                  <option value="Engineering Leader">Engineering Leader</option>
                </select>

                <select
                  value={selectedCityFilter}
                  onChange={e => setSelectedCityFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="All">All Hubs</option>
                  {CITIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* User Directory Table */}
            <div className="overflow-y-auto flex-1 border border-zinc-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold text-zinc-700">User Profile</th>
                    <th className="py-2.5 px-4 font-semibold text-zinc-700">Role & Track</th>
                    <th className="py-2.5 px-4 font-semibold text-zinc-700">Regional Hub</th>
                    <th className="py-2.5 px-4 font-semibold text-zinc-700">Format Pref</th>
                    <th className="py-2.5 px-4 font-semibold text-zinc-700">Automated Topics</th>
                    <th className="py-2.5 px-4 font-semibold text-zinc-700 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        No registered users matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const cityObj = CITIES.find(c => c.id === u.city) || { name: u.city };
                      return (
                        <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.isAdmin && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">Admin</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-4">
                            <span className="font-medium text-zinc-800">{u.role}</span>
                            {u.headline && <div className="text-[10px] text-zinc-400">{u.headline}</div>}
                          </td>

                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1 text-zinc-700 font-medium">
                              <MapPin className="w-3 h-3 text-indigo-500" />
                              <span>{cityObj.name}</span>
                            </span>
                          </td>

                          <td className="py-2.5 px-4">
                            <span className="text-[11px] font-medium text-zinc-700">
                              {u.formats.length === 2 
                                ? '⚡ Both' 
                                : (u.formats.includes('offline') ? '📍 In-Person' : '🌐 Virtual')}
                            </span>
                          </td>

                          <td className="py-2.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {u.categories.slice(0, 3).map(cat => (
                                <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                                  #{cat}
                                </span>
                              ))}
                              {u.categories.length > 3 && (
                                <span className="text-[10px] text-zinc-400 font-medium">+{u.categories.length - 3}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-zinc-400 text-[11px] whitespace-nowrap text-right">
                            {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* =================== TAB 2: MULTI-SOURCE FEED INGESTION =================== */
          <div className="flex-1 overflow-y-auto min-h-0 py-4 space-y-6">
            {/* Top Status Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50/50 border border-purple-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 text-[10px] font-bold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>3-Hour GitHub Actions Scheduler Active</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                    <span>Automated Multi-Platform Event Pipeline</span>
                  </h3>
                  <p className="text-xs text-zinc-600">
                    Runs every 3 hours (<code>0 */3 * * *</code>) on GitHub cloud runners, normalizes feeds, and upserts directly to Supabase.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/devendrs2313/pulse-meet/actions"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-white hover:bg-zinc-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>View Runs</span>
                    <ExternalLink className="w-3 h-3 text-purple-600" />
                  </a>
                  <button
                    type="button"
                    disabled={isAuditingLinks}
                    onClick={handleRunTakedownAudit}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    title="Probe active event links and automatically prune any events deleted by the host"
                  >
                    {isAuditingLinks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>Audit & Prune Delisted</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSyncingLive}
                    onClick={handleManualSyncTrigger}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSyncingLive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Refresh Live Catalog</span>
                  </button>
                </div>
              </div>

              {/* Status Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-purple-200/50">
                <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-500 font-medium uppercase">Ingested Events</div>
                  <div className="text-base font-bold text-zinc-900 mt-0.5">{events.length}</div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-500 font-medium uppercase">Active Platforms</div>
                  <div className="text-base font-bold text-purple-700 mt-0.5">5 Sources</div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-500 font-medium uppercase">Pruned / Delisted</div>
                  <div className="text-base font-bold text-rose-600 mt-0.5">{getRemovedEvents().length} Removed</div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-500 font-medium uppercase">Scheduler Cadence</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">Every 3 Hours</div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-500 font-medium uppercase">Database Sync</div>
                  <div className="text-base font-bold text-indigo-700 mt-0.5">
                    {syncStatus.status === 'active' || syncStatus.status === 'synced' ? 'Supabase Live' : 'Local Fallback'}
                  </div>
                </div>
              </div>
            </div>

            {/* Super Admin AI LLM Configuration Strip (Gemini 1.5 Flash) */}
            <div className="p-3.5 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-amber-400 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>PulseAI Agent Engine</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${geminiKey ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>
                      {geminiKey ? 'Gemini 1.5 Flash Active' : 'Grounded Cadence Engine Active (No Key Needed)'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Controls conversational intelligence and event cadence forecasting.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveGemini} className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    placeholder="Gemini API Key (Optional)..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs whitespace-nowrap transition-colors"
                >
                  Save Key
                </button>
              </form>
            </div>

            {/* Platform Harvesters Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-600" />
                <span>Connected Platform Harvesters</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                    LU
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-zinc-900">Luma Community Feeds</div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Automated</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">The Product Folks (TPF), Google Developer Groups (GDG), AI Builders Club, and regional founder calendars.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                    AT
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-zinc-900">Atlassian Community Events (ACE)</div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Automated</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Official Delhi NCR & Bengaluru user groups, agile practices, and developer tooling.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                    PT
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-zinc-900">ProductTank (Mind the Product)</div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Automated</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Global product management meetups in Delhi NCR, Mumbai, and Bengaluru chapters.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                    FD
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-zinc-900">Founders & FinTech India</div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Automated</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Curated high-signal founder breakfasts, VC roundtables, and UPI banking meetups.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick URL Ingester / Admin Publisher Form */}
            <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-2xs space-y-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>1-Click Universal URL Ingestion & Publish</span>
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Paste any event URL from LinkedIn, Luma, Facebook, Atlassian, or Devfolio. The engine parses metadata automatically.
                </p>
              </div>

              <form onSubmit={handlePublishCustomEvent} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Source RSVP URL (LinkedIn, Luma, Devfolio, Facebook Event)
                  </label>
                  <input
                    type="url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    onBlur={(e) => handleUrlBlur(e.target.value)}
                    placeholder="https://lu.ma/... or https://www.linkedin.com/events/..."
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={importTitle}
                      onChange={(e) => setImportTitle(e.target.value)}
                      placeholder="e.g. Generative AI Builders Summit Delhi"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Organizer / Community Name
                    </label>
                    <input
                      type="text"
                      value={importOrganizer}
                      onChange={(e) => setImportOrganizer(e.target.value)}
                      placeholder="e.g. The Product Folks / LinkedIn Tech"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Event Date *
                    </label>
                    <input
                      type="text"
                      required
                      value={importDate}
                      onChange={(e) => setImportDate(e.target.value)}
                      placeholder="e.g. Sat, Oct 28, 2026"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Event Timing
                    </label>
                    <input
                      type="text"
                      value={importTime}
                      onChange={(e) => setImportTime(e.target.value)}
                      placeholder="e.g. 10:00 AM - 01:00 PM"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Hub / City
                    </label>
                    <select
                      value={importCity}
                      onChange={(e) => setImportCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    >
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="San Francisco">San Francisco</option>
                      <option value="London">London</option>
                      <option value="Remote">Global Online / Remote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Venue Address / Location
                    </label>
                    <input
                      type="text"
                      value={importVenue}
                      onChange={(e) => setImportVenue(e.target.value)}
                      placeholder="e.g. WeWork Forum, Cyber City, Gurgaon"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={importCategory}
                      onChange={(e) => setImportCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    >
                      <option value="AI / ML">AI / ML</option>
                      <option value="Product">Product</option>
                      <option value="Finance / FinTech">Finance / FinTech</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Event Mode
                    </label>
                    <select
                      value={importMode}
                      onChange={(e) => setImportMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    >
                      <option value="offline">In-Person (Offline)</option>
                      <option value="online">Virtual (Online)</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingImport}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingImport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5 text-purple-400" />}
                    <span>Publish Event to Live Feed</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
