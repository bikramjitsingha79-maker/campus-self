
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Segment } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  activeSegment: Segment;
  onViewChange: (view: ViewState) => void;
  onSegmentChange: (segment: Segment) => void;
  userDonationScore: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchSuggestions?: string[];
}

const playPing = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch(e) {}
};

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  activeSegment,
  onViewChange, 
  onSegmentChange,
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  searchSuggestions = []
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleNav = (v: ViewState) => {
    playPing();
    onViewChange(v);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-[100] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-yellow-500/10 shadow-xl transition-all duration-500">
        <div className="p-5 flex items-center justify-between gap-6 max-w-7xl mx-auto w-full">
          
          {/* Satisfying Animated Logo: Cascading Animated Books */}
          <div className="flex items-center gap-4 shrink-0 group cursor-pointer" onClick={() => handleNav('EXPLORE')}>
            <div className="relative w-16 h-16 rounded-[2.2rem] bg-slate-950 text-yellow-500 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 border border-yellow-500/20 overflow-visible">
              <div className="relative flex flex-col items-center justify-center translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                {/* Book Stack Animation */}
                <i className="fas fa-book text-[10px] opacity-40 -mb-2 translate-y-2 group-hover:translate-y-0 transition-all duration-500"></i>
                <i className="fas fa-book text-[14px] opacity-60 -mb-2 translate-y-1 group-hover:translate-y-0 transition-all duration-700"></i>
                <i className="fas fa-book-open text-3xl animate-page-flutter shadow-yellow-500/20 drop-shadow-lg"></i>
              </div>
              
              {/* Magic Orbs around logo */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-glitter shadow-lg shadow-yellow-500/50"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-glitter [animation-delay:0.5s]"></div>
              
              {/* Satisfying background glow */}
              <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
            </div>
            
            <div className="flex flex-col leading-none">
              <h1 className="font-black italic text-2xl tracking-tighter uppercase gold-text leading-tight select-none group-hover:tracking-normal transition-all duration-500">
                CAMPUS
              </h1>
              <span className="font-brand italic text-[11px] tracking-[0.45em] text-slate-500 dark:text-slate-400 animate-glitter uppercase select-none group-hover:tracking-[0.3em] transition-all duration-500">
                Shelf 2026
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className={`flex-1 max-w-lg relative transition-all duration-500 group ${isFocused ? 'scale-105 z-50' : ''}`}>
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-transparent focus-within:border-yellow-500/40 transition-all shadow-inner">
              <i className={`fas fa-search absolute left-8 text-sm transition-all ${isFocused ? 'text-yellow-600' : 'text-slate-400'}`}></i>
              <input 
                type="text" 
                placeholder="Find textbooks, authors, or subjects..."
                onFocus={() => { setIsFocused(true); playPing(); }}
                className="w-full pl-16 pr-8 py-5 bg-transparent text-sm font-black text-slate-900 dark:text-white focus:outline-none uppercase placeholder:text-slate-400/60"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {isFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-[3rem] border border-yellow-500/10 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-4 overflow-hidden backdrop-blur-3xl">
                <div className="p-4">
                  <div className="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800 mb-2">Excellence Sync Engine</div>
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => { playPing(); onSearchChange(suggestion); setIsFocused(false); }}
                      className="w-full text-left px-6 py-4 rounded-2xl hover:bg-yellow-500/10 transition-colors flex items-center gap-5 group/item click-satisfying"
                    >
                      <i className="fas fa-sparkles text-yellow-500/40 group-hover/item:text-yellow-500"></i>
                      <span className="text-sm font-black uppercase tracking-tight text-slate-700 dark:text-slate-200 truncate">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => { onToggleDarkMode(); playPing(); }} className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-yellow-600 shadow-sm active:scale-90 transition-all click-satisfying">
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
            </button>
            <button onClick={() => handleNav('PROFILE')} className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-yellow-600 transition-all shadow-sm active:scale-90 click-satisfying">
              <i className="fas fa-user-circle text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Improved Buy/Sell Navigation Tabs */}
        <div className="px-6 pb-6 max-w-7xl mx-auto w-full">
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-[3rem] p-2 gap-3 shadow-inner border border-yellow-500/5">
            <SegmentButton 
              active={activeSegment === 'BUYER'} 
              onClick={() => { onSegmentChange('BUYER'); }} 
              icon="fa-cart-shopping" 
              label="Explore Grid" 
            />
            <SegmentButton 
              active={activeSegment === 'SELLER'} 
              onClick={() => { onSegmentChange('SELLER'); }} 
              icon="fa-circle-plus" 
              label="Sell Book" 
            />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-40 p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-yellow-500/10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-[100] pb-10 pt-4 px-10">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          <NavButton icon="fas fa-house-chimney-window" label="Explore" active={activeView === 'EXPLORE'} onClick={() => handleNav('EXPLORE')} />
          <NavButton icon="fas fa-bolt-lightning" label="My Claims" active={activeView === 'MY_REQUESTS'} onClick={() => handleNav('MY_REQUESTS')} />
          <NavButton icon="fas fa-crown" label="Identity" active={activeView === 'PROFILE'} onClick={() => handleNav('PROFILE')} />
        </div>
      </nav>
    </div>
  );
};

const SegmentButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={() => { playPing(); onClick(); }}
    className={`flex-1 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 active:scale-95 flex items-center justify-center gap-4 click-satisfying ${active ? 'bg-yellow-600 text-white shadow-[0_15px_30px_rgba(217,119,6,0.2)] scale-[1.05] z-10' : 'text-slate-500 hover:text-yellow-600'}`}
  >
    <i className={`fas ${icon} text-lg`}></i> 
    <span>{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-3 px-8 rounded-[2.5rem] transition-all duration-300 group click-satisfying ${active ? 'text-yellow-600 bg-yellow-500/10 scale-110 shadow-inner' : 'text-slate-500 hover:text-yellow-600 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
  >
    <div className={`relative mb-1 transition-transform ${active ? 'scale-110 animate-bounce-subtle' : 'group-hover:scale-110'}`}>
      <i className={`${icon} text-2xl`}></i>
      {active && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-600 animate-pulse shadow-lg"></div>}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter opacity-90">{label}</span>
  </button>
);

export default Layout;
