import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getRegisteredUsers } from '../../lib/auth';
import { 
  getNotificationSchedules, 
  approveAndDispatchSchedule, 
  rejectSchedule, 
  NotificationSchedule,
  getCategorySubscriptions,
  CategorySubscription,
  getDirectEventDispatches,
  DirectEventDispatchLog,
  generateNewEventsMatchReport
} from '../../lib/notificationQueue';
import { 
  sendAdminScheduleApprovalEmail, 
  sendVerificationTestEmail, 
  SUPER_ADMIN_EMAIL,
  getResendApiKey,
  saveResendApiKey,
  getResendFromEmail,
  saveResendFromEmail,
  getGmailAppPassword,
  saveGmailAppPassword,
  getEmailEngine,
  saveEmailEngine
} from '../../lib/resend';
import { UserProfile } from '../../types/auth';
import { 
  X, 
  ShieldCheck, 
  Search, 
  Download, 
  MapPin, 
  RefreshCw,
  Mail,
  Send,
  CheckCircle2,
  Loader2,
  Users,
  Sparkles,
  ExternalLink,
  Bot,
  KeyRound,
  Settings,
  Globe,
  Check,
  Radio,
  PlusCircle,
  Link as LinkIcon
} from 'lucide-react';
import { CITIES, EVENTS_DATA } from '../../data/mockData';
import { getGeminiApiKey, saveGeminiApiKey } from '../../lib/aiAgent';

export const AdminDashboardModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    currentUser, 
    setNotifyToast, 
    events, 
    refreshLiveEvents, 
    syncStatus 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'email_queue' | 'ingestion'>('users');
  const [emailSubTab, setEmailSubTab] = useState<'queue' | 'subscribers' | 'direct' | 'settings'>('queue');
  
  // User directory state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');

  // Email Queue state
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [subscribers, setSubscribers] = useState<CategorySubscription[]>([]);
  const [directDispatches, setDirectDispatches] = useState<DirectEventDispatchLog[]>([]);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [resendFromEmail, setResendFromEmail] = useState(getResendFromEmail());
  const [resendApiKey, setResendApiKey] = useState(getResendApiKey());
  const [gmailAppPassword, setGmailAppPassword] = useState(getGmailAppPassword());
  const [emailEngine, setEmailEngine] = useState<'resend' | 'gmail'>(getEmailEngine());
  const [testRecipientEmail, setTestRecipientEmail] = useState(SUPER_ADMIN_EMAIL);

  const handleSaveEmailSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveResendFromEmail(resendFromEmail);
    saveResendApiKey(resendApiKey);
    saveGmailAppPassword(gmailAppPassword);
    saveEmailEngine(emailEngine);
    setNotifyToast('✅ Email Delivery Settings & Credentials saved!');
  };

  const handleSendVerificationTest = async (target?: string) => {
    const emailToTest = (target || testRecipientEmail || SUPER_ADMIN_EMAIL).trim();
    setIsSendingTestEmail(true);
    const res = await sendVerificationTestEmail(emailToTest);
    setIsSendingTestEmail(false);
    if (res.success) {
      setNotifyToast(`✅ Live test email delivered directly to ${emailToTest}! Check inbox.`);
    } else if (res.isDomainRestricted) {
      setNotifyToast(`⚠️ Resend Sandbox blocked ${emailToTest}: To send to external inboxes, verify a domain at resend.com/domains or configure Gmail SMTP.`);
    } else {
      setNotifyToast(`⚠️ Test email failed: ${res.error || 'Network error'}`);
    }
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
      rsvpUrl: importUrl.trim() || 'https://pulsemeethack2skill.netlify.app',
      sourcePlatform: importUrl.includes('linkedin') ? 'LinkedIn' : importUrl.includes('facebook') ? 'Facebook' : importUrl.includes('lu.ma') ? 'Luma' : 'Community',
      organizer: {
        id: `org-${Date.now()}`,
        name: importOrganizer.trim() || 'Community Organizer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
        verified: true,
        cadenceBadge: 'Active Member',
        memberCount: 250
      },
      featured: true,
      speakers: []
    };

    try {
      const stored = localStorage.getItem('pulse_custom_events');
      const parsed = stored ? JSON.parse(stored) : [];
      parsed.unshift(newEvt);
      localStorage.setItem('pulse_custom_events', JSON.stringify(parsed));
    } catch {}

    await refreshLiveEvents();
    setIsSubmittingImport(false);
    setNotifyToast(`🎉 "${newEvt.title}" added to live feed!`);

    setImportUrl('');
    setImportTitle('');
    setImportOrganizer('');
    setImportDate('');
    setImportTime('');
    setImportVenue('');
  };

  useEffect(() => {
    if (isAdminModalOpen) {
      setUsers(getRegisteredUsers());
      setSchedules(getNotificationSchedules());
      setSubscribers(getCategorySubscriptions());
      setDirectDispatches(getDirectEventDispatches());
      setGeminiKey(getGeminiApiKey());
      setResendFromEmail(getResendFromEmail());
      setResendApiKey(getResendApiKey());
      setGmailAppPassword(getGmailAppPassword());
      setEmailEngine(getEmailEngine());
    }
  }, [isAdminModalOpen]);

  const handleSaveGemini = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(geminiKey);
    setNotifyToast(geminiKey.trim() ? '✨ Gemini LLM API Key saved for PulseAI Agent!' : 'PulseAI Agent set to Grounded Cadence Engine.');
  };

  if (!isAdminModalOpen || !currentUser?.isAdmin) return null;

  const handleRefresh = () => {
    setUsers(getRegisteredUsers());
    setSchedules(getNotificationSchedules());
    setSubscribers(getCategorySubscriptions());
    setDirectDispatches(getDirectEventDispatches());
    setNotifyToast('Telemetry, Subscribers & Notification Queue refreshed.');
  };

  const pendingCount = schedules.filter(s => s.status === 'pending_approval').length;

  // Approve and dispatch via Resend
  const handleApprove = async (schedule: NotificationSchedule) => {
    setIsProcessingId(schedule.id);
    const res = await approveAndDispatchSchedule(schedule.id);
    setIsProcessingId(null);

    if (res.success) {
      setSchedules(getNotificationSchedules());
      setNotifyToast(`🚀 Approved! Dispatched ${res.dispatchedCount} email(s) via Resend. Subscribers notified.`);
    } else {
      setNotifyToast(`⚠️ Dispatch error: ${res.error || 'Failed'}`);
    }
  };

  // Send preview directly to admin
  const handleSendAdminPreview = async (schedule: NotificationSchedule) => {
    setIsProcessingId(schedule.id);
    const res = await sendAdminScheduleApprovalEmail({
      scheduleId: schedule.id,
      eventTitle: schedule.eventTitle,
      eventDate: schedule.eventDate,
      eventVenue: schedule.eventVenue,
      category: schedule.category,
      city: schedule.city,
      recipientsCount: schedule.recipients.length,
      recipientSample: schedule.recipients,
      createdByUser: schedule.requestedBy
    });
    setIsProcessingId(null);

    if (res.success) {
      setNotifyToast(`📧 Preview email dispatched to ${SUPER_ADMIN_EMAIL}! Check your inbox.`);
    } else {
      setNotifyToast(`⚠️ Preview dispatch failed: ${res.error || 'Error'}`);
    }
  };

  const handleReject = (id: string) => {
    rejectSchedule(id);
    setSchedules(getNotificationSchedules());
    setNotifyToast('Schedule cancelled & archived.');
  };

  // Generate Admin Report for new events
  const handleTriggerNewEventsReport = async () => {
    setIsGeneratingReport(true);
    // Take recent FinTech and AI events to simulate new ingestion
    const newEventsSample = events.filter(e => 
      e.categories.includes('Finance / FinTech') || e.categories.includes('AI / ML')
    ).slice(0, 3);

    const { adminEmailSuccess } = await generateNewEventsMatchReport(
      newEventsSample.length > 0 ? newEventsSample : EVENTS_DATA.slice(0, 2)
    );

    setIsGeneratingReport(false);
    setSchedules(getNotificationSchedules());

    if (adminEmailSuccess) {
      setNotifyToast(`📬 New Events Report generated! Email report sent to ${SUPER_ADMIN_EMAIL}.`);
    } else {
      setNotifyToast(`📬 New Events Report generated in queue. Awaiting your broadcast approval.`);
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
              Manage user directory, review new event ingestion reports, and approve Resend broadcast campaigns.
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
            onClick={() => setActiveTab('email_queue')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'email_queue'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Queue & Approvals</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
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
                  <option value="All">All Cities</option>
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
                    <th className="py-2.5 px-4 font-semibold text-zinc-700">Registered</th>
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
                              <img
                                src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                                alt={u.name}
                                className="w-7 h-7 rounded-full ring-1 ring-zinc-200 object-cover flex-shrink-0"
                              />
                              <div>
                                <div className="font-semibold text-zinc-900 flex items-center gap-1">
                                  <span>{u.name}</span>
                                  {u.isAdmin && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                      Super Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-500">{u.email}</div>
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

                          <td className="py-2.5 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
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
        ) : activeTab === 'email_queue' ? (
          /* =================== TAB 2: EMAIL QUEUE & APPROVALS =================== */
          <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
            {/* Resend Engine Status Strip */}
            <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-indigo-950 flex flex-wrap items-center gap-2">
                    <span>Resend Email API Engine</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-mono text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Active & Delivering
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-mono text-[10px]">
                      onboarding@resend.dev
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-900 mt-1 leading-relaxed">
                    Live delivery authorized for <strong>{SUPER_ADMIN_EMAIL}</strong>. Approval reports and preview copies are delivered straight to your inbox.
                  </div>
                  <div className="text-[10px] text-indigo-700/80 mt-0.5 flex items-center gap-1">
                    <span>💡 To deliver directly to external non-admin user inboxes, verify your custom domain at</span>
                    <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-indigo-950 inline-flex items-center gap-0.5">
                      resend.com/domains <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-shrink-0">
                <button
                  type="button"
                  disabled={isSendingTestEmail}
                  onClick={() => handleSendVerificationTest()}
                  className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                  title="Send a quick test email to verify Resend inbox delivery"
                >
                  {isSendingTestEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <Send className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>Test Inbox Delivery</span>
                </button>

                <button
                  type="button"
                  disabled={isGeneratingReport}
                  onClick={handleTriggerNewEventsReport}
                  className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                >
                  {isGeneratingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Scan Events & Report</span>
                </button>
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
                    Controls the conversational LLM. Visible only to Super Admin ({SUPER_ADMIN_EMAIL}).
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

            {/* Email Sub-Tabs */}
            <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2">
              <button
                type="button"
                onClick={() => setEmailSubTab('queue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  emailSubTab === 'queue'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <span>📬 Ingestion Reports & Queued Campaigns</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-full text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setEmailSubTab('subscribers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  emailSubTab === 'subscribers'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Active Alert Subscribers ({subscribers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setEmailSubTab('direct')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  emailSubTab === 'direct'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Direct Dispatches Audit ({directDispatches.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setEmailSubTab('settings')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  emailSubTab === 'settings'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>⚙️ Sender Domain & API Config</span>
              </button>
            </div>

            {/* Sub-Tab 1: Queued Campaigns & Reports */}
            {emailSubTab === 'queue' && (
              <div className="space-y-3">
                {schedules.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    No email notification reports or schedules in queue.
                  </div>
                ) : (
                  schedules.map((item) => {
                    const isProcessing = isProcessingId === item.id;
                    const isPending = item.status === 'pending_approval';
                    const isDispatched = item.status === 'dispatched';
                    const isBatch = item.targetType === 'new_events_batch' && item.batchEvents;

                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPending 
                            ? 'bg-white border-amber-300 shadow-xs ring-1 ring-amber-100' 
                            : isDispatched 
                            ? 'bg-zinc-50 border-zinc-200' 
                            : 'bg-zinc-50/50 border-zinc-200 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-zinc-900">{item.eventTitle}</span>
                              {isPending ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                  <span>Approval Required to Broadcast</span>
                                </span>
                              ) : isDispatched ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Broadcast Dispatched via Resend</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-bold">
                                  Rejected
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              Report ID: <span className="font-mono">{item.id}</span> · Triggered by: <strong>{item.requestedBy}</strong>
                            </div>
                          </div>

                          <div className="text-[11px] text-zinc-400 sm:text-right">
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Batch Events Breakdown (if new events batch) */}
                        {isBatch && item.batchEvents && (
                          <div className="my-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                            <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                              Newly Listed Gatherings ({item.batchEvents.length}):
                            </div>
                            <div className="space-y-1.5">
                              {item.batchEvents.map(e => (
                                <div key={e.id} className="text-xs text-zinc-800 flex items-center justify-between bg-white p-2 rounded-lg border border-zinc-200/80">
                                  <div>
                                    <strong>{e.title}</strong>
                                    <div className="text-[11px] text-zinc-500">
                                      📍 {e.city.toUpperCase()} · 📅 {e.date} · 🏷️ {e.categories.join(', ')}
                                    </div>
                                  </div>
                                  <a href={e.rsvpUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 p-1">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matched Subscribers */}
                        <div className="my-2.5 text-xs text-zinc-600">
                          <div className="font-semibold text-zinc-700 text-[11px] mb-1">
                            Matched Subscribers Queued ({item.recipients.length}):
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {item.recipients.map(r => (
                              <span key={r} className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-mono border border-zinc-200">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Resend ID or Notes */}
                        {item.resendMessageId && (
                          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md mb-2">
                            Resend Msg ID: {item.resendMessageId} · Dispatched at {item.dispatchedAt ? new Date(item.dispatchedAt).toLocaleTimeString() : 'N/A'}
                          </div>
                        )}

                        {/* Action Controls for Admin */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 flex-wrap">
                          {isPending && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApprove(item)}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              <span>Approve & Broadcast to Queued Users</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleSendAdminPreview(item)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Send Preview to {SUPER_ADMIN_EMAIL}</span>
                          </button>

                          {isPending && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleReject(item.id)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-zinc-200 text-xs font-semibold transition-colors ml-auto"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Sub-Tab 2: Category & Area Subscribers */}
            {emailSubTab === 'subscribers' && (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Subscriber Email</th>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Subscribed Categories</th>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Target Hub</th>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Frequency</th>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {subscribers.map(sub => (
                      <tr key={sub.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-zinc-900">
                          {sub.email}
                          {sub.name && <div className="text-[10px] text-zinc-400 font-sans">{sub.name}</div>}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {sub.categories.map(c => (
                              <span key={c} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 uppercase font-semibold text-zinc-700">
                          {sub.city}
                        </td>
                        <td className="py-2.5 px-4 text-zinc-600 capitalize">
                          {sub.timing}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Tab 3: Direct Event Dispatches Audit */}
            {emailSubTab === 'direct' && (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Dispatched Event</th>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Recipient</th>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Sent At</th>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Resend ID</th>
                      <th className="py-2.5 px-4 font-semibold text-zinc-700">Approval Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {directDispatches.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-400">
                          No direct event dispatches recorded yet. Try clicking &quot;Email Me Event Details&quot; on any event!
                        </td>
                      </tr>
                    ) : (
                      directDispatches.map(d => (
                        <tr key={d.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-zinc-900">
                            {d.eventTitle}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-zinc-700">
                            {d.recipientEmail}
                          </td>
                          <td className="py-2.5 px-4 text-zinc-500 text-[11px]">
                            {new Date(d.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[10px] text-zinc-500">
                            {d.resendMessageId || 'msg_resend_ok'}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                              Direct (No Approval Needed)
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Tab 4: Sender Domain & API Configuration */}
            {emailSubTab === 'settings' && (
              <div className="space-y-4">
                {/* Engine Selector */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Active Dispatch Engine:</span>
                    <span className="text-[11px] text-zinc-500">Choose how PulseMeet delivers emails to recipients</span>
                  </div>
                  <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setEmailEngine('gmail')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        emailEngine === 'gmail' 
                          ? 'bg-white text-indigo-700 shadow-xs' 
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span>Gmail SMTP ({SUPER_ADMIN_EMAIL})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailEngine('resend')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        emailEngine === 'resend' 
                          ? 'bg-white text-indigo-700 shadow-xs' 
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span>Resend API</span>
                    </button>
                  </div>
                </div>

                {/* Engine Option 1: Gmail SMTP (Direct devendrs2313@gmail.com) */}
                {emailEngine === 'gmail' && (
                  <form onSubmit={handleSaveEmailSettings} className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span>Direct Gmail SMTP Engine (devendrs2313@gmail.com)</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Sends to ANY email · No custom domain needed
                      </span>
                    </div>

                    <p className="text-xs text-indigo-900 leading-relaxed">
                      Sends emails directly from <strong>{SUPER_ADMIN_EMAIL}</strong> through Google&apos;s mail servers to <strong>any personal or external email address</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Sender Gmail Address:
                        </label>
                        <input
                          type="text"
                          disabled
                          value={SUPER_ADMIN_EMAIL}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-100 font-mono text-zinc-600 cursor-not-allowed"
                        />
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Fixed to your super admin Gmail.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                          <span>Google 16-Char App Password:</span>
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 text-[11px]"
                          >
                            Generate App Password <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </label>
                        <input
                          type="password"
                          value={gmailAppPassword}
                          onChange={(e) => setGmailAppPassword(e.target.value)}
                          placeholder="e.g. abcd efgh ijkl mnop"
                          className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-zinc-800 bg-white"
                        />
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Created in Google Account Security &rarr; 2-Step Verification &rarr; App Passwords.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Gmail SMTP Credentials</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Engine Option 2: Resend API */}
                {emailEngine === 'resend' && (
                  <form onSubmit={handleSaveEmailSettings} className="p-5 rounded-2xl border border-zinc-200 bg-white space-y-4">
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      <strong>Resend Sandbox Policy:</strong> The free sender <code>onboarding@resend.dev</code> only delivers to <strong>{SUPER_ADMIN_EMAIL}</strong>. To send to any other address (like <code>devendra2313@gmail.com</code>), verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-600">resend.com/domains</a>, OR switch to the <strong>Gmail SMTP</strong> engine above!
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      <span>Resend Cloud Configuration</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Sender From Email (Formatted):
                        </label>
                        <input
                          type="text"
                          value={resendFromEmail}
                          onChange={(e) => setResendFromEmail(e.target.value)}
                          placeholder="PulseMeet <events@yourdomain.com>"
                          className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-zinc-800"
                        />
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Default: <code>PulseMeet &lt;onboarding@resend.dev&gt;</code>. Change to your verified domain (e.g. <code>PulseMeet &lt;alerts@yourdomain.com&gt;</code>) to send to any user.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Resend API Key:
                        </label>
                        <input
                          type="password"
                          value={resendApiKey}
                          onChange={(e) => setResendApiKey(e.target.value)}
                          placeholder="re_..."
                          className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-zinc-800"
                        />
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Stored locally in browser. If you created a Resend account under your personal email, paste its key here.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Resend Settings</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Direct Live Email Tester */}
                <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>Test Delivery to Any Email Address</span>
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Enter any personal email address (e.g. <code>devendra2313@gmail.com</code>) to test live dispatch with the active engine ({emailEngine === 'gmail' ? 'Gmail SMTP' : 'Resend API'}):
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="email"
                      value={testRecipientEmail}
                      onChange={(e) => setTestRecipientEmail(e.target.value)}
                      placeholder="Enter personal email (e.g. devendra2313@gmail.com)"
                      className="flex-1 w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 text-zinc-800"
                    />
                    <button
                      type="button"
                      disabled={isSendingTestEmail || !testRecipientEmail.trim()}
                      onClick={() => handleSendVerificationTest(testRecipientEmail)}
                      className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isSendingTestEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send Live Test to This Address</span>
                    </button>
                  </div>
                </div>

                {/* 3-Step Guide */}
                <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>How to Send Emails from devendrs2313@gmail.com to ANY Recipient</span>
                  </h4>
                  <div className="space-y-2 text-xs text-indigo-950">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">A</span>
                      <div>
                        <strong>Method 1: Gmail SMTP (Instant, Zero Domain Needed):</strong> Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-600 inline-flex items-center gap-0.5">Google App Passwords <ExternalLink className="w-2.5 h-2.5" /></a>, create an App Password for &quot;PulseMeet&quot;, and paste it in the Gmail SMTP section above. All emails will immediately send from <strong>{SUPER_ADMIN_EMAIL}</strong> to any email!
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">B</span>
                      <div>
                        <strong>Method 2: Custom Domain on Resend:</strong> Go to <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-600 inline-flex items-center gap-0.5">resend.com/domains <ExternalLink className="w-2.5 h-2.5" /></a>, verify your domain DNS records, and enter your verified sender email above (e.g. <code>PulseMeet &lt;alerts@yourdomain.com&gt;</code>).
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =================== TAB 3: MULTI-SOURCE FEED INGESTION =================== */
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-purple-200/50">
                <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-500 font-medium uppercase">Ingested Events</div>
                  <div className="text-base font-bold text-zinc-900 mt-0.5">{events.length}</div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-500 font-medium uppercase">Active Platforms</div>
                  <div className="text-base font-bold text-purple-700 mt-0.5">5 Sources</div>
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
                      <div className="text-xs font-bold text-zinc-900">Atlassian Community (Bevy)</div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Automated</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Atlassian Community Chapters across Delhi NCR and Bengaluru (Jira Platform, DevOps, AI in Software).</p>
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
                    <p className="text-[11px] text-zinc-500">Mind the Product local chapter meetups, product management talks, and FinTech monetization sessions.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                    DP
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-zinc-900">Devpost & Hack2skill</div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Automated</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">National and global AI & FinTech hackathons with prize pools, bounties, and incubation grants.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick URL / Text Importer (for LinkedIn, Facebook, and Any Site) */}
            <div className="p-5 rounded-2xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-purple-600" />
                    <span>Quick Ingest from LinkedIn, Facebook, or Any URL</span>
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Because LinkedIn and Facebook require user logins, paste the event link or details here to immediately publish it to the live feed.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePublishCustomEvent} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Event Registration / RSVP URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      onBlur={(e) => handleUrlBlur(e.target.value)}
                      placeholder="e.g. https://www.linkedin.com/events/... or https://facebook.com/events/..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                    <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  </div>
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
                      placeholder="e.g. NextGen AI & FinTech Builders Meetup"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Organizer Name
                    </label>
                    <input
                      type="text"
                      value={importOrganizer}
                      onChange={(e) => setImportOrganizer(e.target.value)}
                      placeholder="e.g. Delhi Founders Club"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Date *
                    </label>
                    <input
                      type="text"
                      required
                      value={importDate}
                      onChange={(e) => setImportDate(e.target.value)}
                      placeholder="e.g. Sat, Nov 28"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={importTime}
                      onChange={(e) => setImportTime(e.target.value)}
                      placeholder="e.g. 05:00 PM - 08:00 PM IST"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-purple-500 text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                      City
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
