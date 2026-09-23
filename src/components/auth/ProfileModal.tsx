import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { signOut, updateUserProfile } from '../../lib/auth';
import { UserRole } from '../../types/auth';
import { FormatType } from '../../types/event';
import { 
  X, 
  LogOut, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  Save, 
  ArrowLeft, 
  Check, 
  Bell, 
  Globe,
  Loader2
} from 'lucide-react';
import { CITIES } from '../../data/mockData';

const AVAILABLE_ROLES: UserRole[] = [
  'Product Manager',
  'Software Engineer',
  'AI / ML Practitioner',
  'Engineering Leader',
  'Designer / UI-UX',
  'Founder / Entrepreneur',
  'Student / Learner',
  'Other'
];

const AVAILABLE_TOPICS = [
  'Product Management',
  'AI / ML',
  'Cloud & DevOps',
  'Rust & Systems',
  'Full-Stack & React',
  'UI/UX Design',
  'Leadership',
  'Cybersecurity',
  'Open Source'
];

export const ProfileModal: React.FC = () => {
  const { 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    currentUser, 
    setCurrentUser, 
    setIsAdminModalOpen,
    setNotifyToast,
    scanRegion,
    setSelectedFormats,
    setSelectedCategories
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Product Manager');
  const [editHeadline, setEditHeadline] = useState('');
  const [editCity, setEditCity] = useState('delhi-ncr');
  const [editFormats, setEditFormats] = useState<FormatType[]>(['offline']);
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editEmailAlerts, setEditEmailAlerts] = useState(true);

  // Synchronize edit form whenever currentUser or modal open state changes
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditRole(currentUser.role || 'Product Manager');
      setEditHeadline(currentUser.headline || '');
      setEditCity(currentUser.city || 'delhi-ncr');
      setEditFormats(currentUser.formats && currentUser.formats.length > 0 ? currentUser.formats : ['offline']);
      setEditCategories(currentUser.categories || []);
      setEditEmailAlerts(currentUser.emailAlerts ?? true);
      setErrorMessage(null);
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const currentCityObj = CITIES.find(c => c.id === currentUser.city) || { name: currentUser.city };

  const handleSignOut = () => {
    signOut();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    setIsEditing(false);
    setNotifyToast('Logged out of PulseMeet.');
  };

  const toggleCategory = (cat: string) => {
    setEditCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleFormat = (fmt: FormatType) => {
    setEditFormats(prev => {
      if (prev.includes(fmt)) {
        if (prev.length === 1) return prev; // keep at least one format
        return prev.filter(f => f !== fmt);
      }
      return [...prev, fmt];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const res = await updateUserProfile(currentUser.id, {
      name: editName,
      role: editRole,
      headline: editHeadline,
      city: editCity,
      formats: editFormats,
      categories: editCategories,
      emailAlerts: editEmailAlerts
    });

    setIsSaving(false);

    if (!res.success || !res.user) {
      setErrorMessage(res.error || 'Failed to update profile.');
      return;
    }

    // Update global state
    setCurrentUser(res.user);

    // Synchronize event feed filters with updated preferences
    scanRegion(res.user.city);
    if (res.user.formats.length > 0) {
      setSelectedFormats(res.user.formats);
    }
    if (res.user.categories.length > 0) {
      setSelectedCategories(res.user.categories);
    }

    setNotifyToast('✨ Profile & preferences updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden border border-zinc-200 shadow-2xl relative my-auto transition-all"
      >
        {/* Fixed Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 -ml-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                title="Back to profile"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
              {isEditing ? 'Edit Profile & Preferences' : 'Your Profile'}
            </h3>
          </div>

          <button
            onClick={() => {
              setIsProfileModalOpen(false);
              setIsEditing(false);
            }}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-5">
              {/* User Avatar & Identity Card */}
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  <img 
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=4f46e5`} 
                    alt={currentUser.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-2 ring-indigo-100 object-cover shadow-xs"
                  />
                  {currentUser.isAdmin && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white p-1 rounded-full shadow-xs" title="Super Admin">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight truncate">{currentUser.name}</h3>
                    {currentUser.isAdmin && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Super Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 font-medium truncate">{currentUser.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {currentUser.role}
                    </span>
                    {currentUser.headline && (
                      <span className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                        · {currentUser.headline}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Super Admin Console Shortcut */}
              {currentUser.isAdmin && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-xl bg-amber-500 text-white flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-950">Super Admin Console</div>
                      <div className="text-[11px] text-amber-700 truncate">Platform user directory & live telemetry</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setIsAdminModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    Open Console
                  </button>
                </div>
              )}

              {/* Automation & Personalization Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Personalization Automation</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Primary Regional Hub</span>
                    </span>
                    <span className="font-semibold text-zinc-800">{currentCityObj.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Preferred Format</span>
                    </span>
                    <span className="font-semibold text-zinc-800">
                      {currentUser.formats.length === 2 
                        ? 'In-Person & Virtual' 
                        : (currentUser.formats[0] === 'offline' ? 'In-Person Only' : 'Virtual Streams')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Cadence Email Alerts</span>
                    </span>
                    <span className={`font-semibold ${currentUser.emailAlerts ? 'text-emerald-700' : 'text-zinc-500'}`}>
                      {currentUser.emailAlerts ? 'Active (24h before)' : 'Muted'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60">
                    <span className="text-zinc-500 text-[11px] block mb-1.5 font-medium">Tracked Topics for Radar Alerts:</span>
                    {currentUser.categories && currentUser.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {currentUser.categories.map(cat => (
                          <span key={cat} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-700 shadow-2xs">
                            #{cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">No topics selected yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE FORM */
            <form id="profile-edit-form" onSubmit={handleSave} className="space-y-4">
              {/* Full Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Professional Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {AVAILABLE_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Headline / Bio</label>
                <input
                  type="text"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Lead Product Manager @ Fintech"
                />
              </div>

              {/* Regional Hub */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Primary Regional Hub</label>
                <select
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {CITIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.country}) · {c.activeEvents} events
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Format Pills */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Preferred Gathering Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFormat('offline')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      editFormats.includes('offline')
                        ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>In-Person</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFormat('online')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      editFormats.includes('online')
                        ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-2xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    <span>Virtual Streams</span>
                  </button>
                </div>
              </div>

              {/* Tracked Topics */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Tracked Topics for Radar Alerts
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {editCategories.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                  {AVAILABLE_TOPICS.map(cat => {
                    const isSelected = editCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                            : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email Alerts Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editEmailAlerts}
                  onChange={(e) => setEditEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                />
                <span className="text-xs text-zinc-700 font-medium">
                  Receive personalized 24-hour radar alerts for matching events
                </span>
              </label>
            </form>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-3 sm:p-4 border-t border-zinc-100 bg-zinc-50/90 flex items-center gap-2 flex-shrink-0">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile & Preferences</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 text-zinc-600 border border-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="profile-edit-form"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
