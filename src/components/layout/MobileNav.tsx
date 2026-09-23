import React from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, Sparkles, Users, Bookmark, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsMatchModalOpen, 
    savedEventIds,
    currentUser,
    setIsAuthModalOpen,
    setIsProfileModalOpen
  } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-zinc-200 px-2 py-1.5 pb-safe shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'explore'
              ? 'text-indigo-600 font-semibold'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </button>

        <button
          onClick={() => setIsMatchModalOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-zinc-500 hover:text-zinc-800 transition-all"
        >
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span className="text-[10px]">Compass</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'radar'
              ? 'text-indigo-600 font-semibold'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all relative ${
            activeTab === 'saved'
              ? 'text-indigo-600 font-semibold'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5" />
            {savedEventIds.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedEventIds.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Saved</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setIsProfileModalOpen(true);
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-zinc-500 hover:text-zinc-800 transition-all"
        >
          {currentUser ? (
            <div className="w-5 h-5 rounded-full ring-1.5 ring-indigo-500 overflow-hidden">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] truncate max-w-[50px]">
            {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
          </span>
        </button>
      </div>
    </div>
  );
};
