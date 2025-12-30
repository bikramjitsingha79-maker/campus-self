
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
          
          {/* Unique Book Theme Logo */}
          <div className="flex items-center gap-4 shrink-0 group cursor-pointer" onClick={() => onViewChange('EXPLORE')}>
            <div className="relative w-14 h-14 rounded-2xl bg-slate-950 text-yellow-500 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 border border-yellow-500/20">
              <i className="fas fa-book-sparkles text-3xl"></i>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-transparent"></div>
            </div>
            
            <div className="flex flex-col leading-none">
              <h1 className="font-black italic text-xl tracking-tighter uppercase gold-text">
                CAMPUS
              </h1>
              <span className="font-brand italic text-[12px] tracking-[0.4em] text-slate-500 dark:text-slate-400">
                SHELF 2026
              </span>
            </div>
          </div>

          {/* Search Bar - Find Books suggestion */}
          <div ref={searchRef} className={`flex-1 max-w-lg relative transition-all duration-500 group ${isFocused ? 'scale-105 z-50' : ''}`}>
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] overflow-hidden border border-transparent focus-within:border-yellow-500/40 transition-all shadow-inner">
              <i className={`fas fa-search absolute left-5 text-sm transition-all ${isFocused ? 'text-yellow-600' : 'text-slate-400'}`}></i>
              <input 
                type="text" 
                placeholder="Find books... (e.g. Physics, History, AI)"
                onFocus={() => setIsFocused(true)}
                className="w-full pl-14 pr-6 py-4 bg-transparent text-sm font-black text-slate-900 dark:text-white focus:outline-none uppercase placeholder:text-slate-400/60"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {isFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-[2rem] border border-yellow-500/10 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-4 overflow-hidden">
                <div className="p-3">
                  <div className="px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800 mb-1">AI Matches 2026</div>
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => { onSearchChange(suggestion); setIsFocused(false); }}
                      className="w-full text-left px-5 py-3.5 rounded-xl hover:bg-yellow-500/10 transition-colors flex items-center gap-4 group/item"
                    >
                      <i className="fas fa-bookmark text-yellow-500/40 group-hover/item:text-yellow-500"></i>
                      <span className="text-sm font-black uppercase tracking-tight text-slate-700 dark:text-slate-200 truncate">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={onToggleDarkMode} className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-yellow-600 shadow-sm active:scale-95 transition-all">
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button onClick={() => onViewChange('PROFILE')} className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-yellow-600 transition-all shadow-sm">
              <i className="fas fa-user-circle text-xl"></i>
            </button>
          </div>
        </div>

        {/* Improved Buy/Sell Navigation Tabs */}
        <div className="px-5 pb-4 max-w-7xl mx-auto w-full">
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-[2rem] p-1.5 gap-2 shadow-inner border border-yellow-500/5">
            <SegmentButton 
              active={activeSegment === 'BUYER'} 
              onClick={() => onSegmentChange('BUYER')} 
              icon="fa-shopping-cart" 
              label="Buy Books" 
            />
            <SegmentButton 
              active={activeSegment === 'SELLER'} 
              onClick={() => onSegmentChange('SELLER')} 
              icon="fa-gift" 
              label="Sell Books" 
            />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-32 p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-yellow-500/10 shadow-2xl z-[100] pb-6">
        <div className="flex justify-around items-center p-4 max-w-lg mx-auto">
          <NavButton icon="fas fa-compass" label="Explore" active={activeView === 'EXPLORE'} onClick={() => onViewChange('EXPLORE')} />
          <NavButton icon="fas fa-paper-plane" label="Requests" active={activeView === 'MY_REQUESTS'} onClick={() => onViewChange('MY_REQUESTS')} />
          <NavButton icon="fas fa-user-graduate" label="Profile" active={activeView === 'PROFILE'} onClick={() => onViewChange('PROFILE')} />
        </div>
      </nav>
    </div>
  );
};

const SegmentButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 ${active ? 'bg-yellow-600 text-white shadow-xl scale-[1.02] z-10' : 'text-slate-500 hover:text-yellow-600'}`}
  >
    <i className={`fas ${icon} text-base`}></i> 
    <span>{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 transition-all duration-300 group ${active ? 'text-yellow-600 scale-105' : 'text-slate-500 hover:text-yellow-600'}`}
  >
    <div className={`relative mb-1 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      <i className={`${icon} text-2xl`}></i>
      {active && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse"></div>}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">{label}</span>
  </button>
);

export default Layout;
