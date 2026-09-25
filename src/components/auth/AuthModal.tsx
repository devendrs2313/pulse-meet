import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { signIn, signUp } from '../../lib/auth';
import { UserRole } from '../../types/auth';
import { FormatType } from '../../types/event';
import { CITIES } from '../../data/mockData';
import { X, Lock, Mail, User, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const ROLES: UserRole[] = [
  'Product Manager',
  'Software Engineer',
  'AI / ML Practitioner',
  'Engineering Leader',
  'Designer / UI-UX',
  'Founder / Entrepreneur',
  'Student / Learner'
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

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    setCurrentUser, 
    setNotifyToast, 
    scanRegion, 
    setSelectedFormats,
    setSelectedCategory
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Product Manager');
  const [city, setCity] = useState('delhi-ncr');
  const [formats, setFormats] = useState<FormatType[]>(['offline']);
  const [categories, setCategories] = useState<string[]>(['Product Management', 'AI / ML']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMessage(null);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleFormat = (fmt: FormatType) => {
    setFormats(prev => {
      if (prev.includes(fmt)) {
        if (prev.length === 1) return prev; // keep at least one
      }
      return [...prev, fmt];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const res = await signIn({ email, password });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          // Apply user personalization
          if (res.user.city) scanRegion(res.user.city);
          if (res.user.formats && res.user.formats.length > 0) setSelectedFormats(res.user.formats);
          if (res.user.categories && res.user.categories.length > 0) setSelectedCategory(res.user.categories[0]);

          setIsAuthModalOpen(false);
          if (res.user.isAdmin) {
            setNotifyToast('👑 Welcome back, Super Admin! Admin Directory unlocked.');
          } else {
            setNotifyToast(`👋 Welcome back, ${res.user.name}!`);
          }
        } else {
          setErrorMessage(res.error || 'Failed to sign in.');
        }
      } else {
        const res = await signUp({
          name,
          email,
          password,
          role,
          city,
          formats,
          categories
        });

        if (res.success && res.user) {
          setCurrentUser(res.user);
          // Apply personalized settings immediately
          scanRegion(city);
          setSelectedFormats(formats);
          if (categories.length > 0) setSelectedCategory(categories[0]);

          setIsAuthModalOpen(false);
          setNotifyToast(`🎉 Welcome to PulseMeet, ${res.user.name}! Your personalized radar is active.`);
        } else {
          setErrorMessage(res.error || 'Failed to create profile.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[88vh] flex flex-col border border-zinc-200 shadow-2xl relative transition-all overflow-hidden"
      >
        {/* Fixed Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex-shrink-0 relative">
          {/* Close Button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-semibold mb-2 w-fit">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Personalized Event Radar</span>
          </div>
          
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            {mode === 'signup' ? 'Create Your Builder Profile' : 'Sign In to PulseMeet'}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {mode === 'signup' 
              ? 'Automate the events you attend with high-signal community cadences.' 
              : 'Log in to access your personalized radar and saved gatherings.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-xl mt-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'login' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'signup' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Create Profile
            </button>
          </div>
        </div>

        {/* Form with Scrollable Body & Fixed Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="overflow-y-auto p-4 sm:p-5 pt-3 space-y-3.5 flex-1 text-xs">
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Devendra Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                {/* Role & Regional Hub */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Primary Role</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs truncate"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Regional Hub</label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs truncate"
                    >
                      {CITIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Attendance Formats */}
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Preferred Formats</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFormat('offline')}
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                        formats.includes('offline')
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      <span>📍 In-Person</span>
                      {formats.includes('offline') && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFormat('online')}
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                        formats.includes('online')
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      <span>🌐 Virtual</span>
                      {formats.includes('online') && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  </div>
                </div>

                {/* Target Categories */}
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Automated Topics</label>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_TOPICS.map(cat => {
                      const isSelected = categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200/60'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Fixed Footer with Submit Button */}
          <div className="p-3 sm:p-4 bg-zinc-50/95 border-t border-zinc-100 flex-shrink-0">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Processing...' : (mode === 'signup' ? 'Create Personalized Profile' : 'Sign In')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="mt-2 text-center text-[11px] text-zinc-500">
              {mode === 'signup' ? (
                <span>Already have an account? <button type="button" onClick={() => { setMode('login'); setErrorMessage(null); }} className="text-indigo-600 font-semibold hover:underline cursor-pointer">Sign in</button></span>
              ) : (
                <span>New to PulseMeet? <button type="button" onClick={() => { setMode('signup'); setErrorMessage(null); }} className="text-indigo-600 font-semibold hover:underline cursor-pointer">Create profile</button></span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
