
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Language, Segment, ThemePalette } from '../types';
import { translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  activeSegment: Segment;
  themePalette: ThemePalette;
  onViewChange: (view: ViewState) => void;
  onSegmentChange: (segment: Segment) => void;
  userDonationScore: number;
  language: Language;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  activeSegment,
  themePalette,
  onViewChange, 
  onSegmentChange,
  userDonationScore, 
  language,
  darkMode,
  onToggleDarkMode,
  onLogout,
  searchQuery,
  onSearchChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isCampusHero = userDonationScore >= 5;
  const t = translations[language];

  const getThemeColors = (palette: ThemePalette, segment: Segment) => {
    const config: Record<ThemePalette, Record<Segment, string>> = {
      CLASSIC: { BUYER: 'pink', SELLER: 'rose', LIBRARY: 'indigo' },
      CYBERPUNK: { BUYER: 'purple', SELLER: 'fuchsia', LIBRARY: 'yellow' },
      OCEAN: { BUYER: 'cyan', SELLER: 'blue', LIBRARY: 'teal' },
      MIDNIGHT: { BUYER: 'slate', SELLER: 'neutral', LIBRARY: 'rose' }
    };
    return config[palette][segment];
  };

  const currentColor = getThemeColors(themePalette, activeSegment);
  const themeClass = `bg-indigo-950/90 dark:bg-slate-950/90 backdrop-blur-2xl transition-colors duration-700 border-b-2 border-yellow-500/20 shadow-[0_5px_30px_rgba(0,0,0,0.4)]`;
  const accentBg = `bg-yellow-600`;
  const textClass = `text-yellow-600 dark:text-yellow-400`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (view: ViewState) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className={`sticky top-0 z-[100] ${themeClass} text-white shadow-xl transition-all duration-700 ease-in-out`}>
        <div className="p-4 pb-2 flex items-center justify-between gap-3 max-w-6xl mx-auto w-full">
          
          {/* Festive Branding */}
          <div className="flex items-center gap-3 shrink-0 group cursor-pointer py-1 relative">
            <div className="relative w-12 h-12 rounded-2xl bg-slate-900 text-yellow-500 flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 border border-yellow-500/30">
              <i className="fas fa-glass-cheers text-xl animate-float"></i>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-yellow-500/10 to-white/0 animate-shimmer"></div>
            </div>
            
            <div className="flex flex-col leading-none">
              <h1 className="flex flex-col relative">
                <span className="font-black italic text-sm tracking-tighter uppercase animate-text-reveal gold-text shimmer-text stagger-1">
                  CAMPUS
                </span>
                <span className="font-brand italic text-[11px] tracking-[0.3em] opacity-80 animate-text-reveal stagger-2 ml-0.5 text-slate-400">
                  SHELF 2026
                </span>
              </h1>
            </div>
          </div>

          {/* Search Bar - Festive Styled */}
          <div className={`flex-1 max-w-sm relative transition-all duration-500 ease-out group ${isFocused ? 'scale-105 z-50' : ''}`}>
            <div className={`absolute -inset-[1px] rounded-2xl crystal-border blur-[3px] opacity-0 group-hover:opacity-60 group-focus-within:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-2xl overflow-hidden border border-yellow-500/20 shadow-xl">
              <i className={`fas fa-search absolute left-4 text-xs transition-all duration-500 z-30 ${isFocused ? 'text-yellow-600 scale-125' : 'text-slate-400'}`}></i>
              
              <input 
                type="text" 
                placeholder="Find 2026 Gifts..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full pl-11 pr-12 py-3 bg-transparent text-[12px] font-black text-slate-900 dark:text-white focus:outline-none transition-all uppercase placeholder:text-slate-400/70 z-20 relative"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 relative" ref={menuRef}>
            <button 
              onClick={() => onViewChange('PROFILE')}
              className={`w-10 h-10 rounded-xl border-2 transition-all duration-500 flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-90 backdrop-blur-md ${activeView === 'PROFILE' ? 'border-yellow-500 shadow-lg' : 'border-transparent'}`}
            >
              <i className="fas fa-user-circle text-lg"></i>
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 bg-white/5 hover:bg-white/10 active:scale-90 backdrop-blur-md ${isMenuOpen ? 'rotate-90 bg-white/20' : ''}`}
            >
              <i className="fas fa-bars-staggered text-lg"></i>
            </button>

            {isMenuOpen && (
              <div className="absolute top-12 right-0 w-64 bg-slate-900/95 backdrop-blur-2xl border-2 border-yellow-500/20 rounded-[2.5rem] shadow-2xl z-[120] animate-in fade-in zoom-in-95 duration-300 fill-mode-both overflow-hidden text-white p-2">
                <div className="space-y-1">
                  <button 
                    onClick={onToggleDarkMode}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl bg-yellow-600 text-white flex items-center justify-center shadow-sm`}>
                        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{darkMode ? 'Day Mode' : 'Night Mode'}</span>
                    </div>
                  </button>
                  <MenuOption icon="fas fa-star text-yellow-500" label="Festive Settings" onClick={() => handleMenuAction('SETTINGS')} />
                  <MenuOption icon="fas fa-gift text-pink-500" label="Resolutions" onClick={() => handleMenuAction('FEEDBACK')} />
                  <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/20 text-red-500 transition-colors">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center"><i className="fas fa-sign-out-alt"></i></div>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Exit 2026</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Festive Navigation Tabs */}
        <div className="px-4 pb-4 animate-in slide-in-from-top-4 duration-700 delay-100 fill-mode-both max-w-6xl mx-auto w-full">
          <div className="flex bg-slate-900/60 rounded-[2rem] p-1.5 gap-2 backdrop-blur-md relative shadow-inner border border-white/5">
            <SegmentButton 
              active={activeSegment === 'BUYER'} 
              onClick={() => onSegmentChange('BUYER')} 
              icon="fa-shopping-bag" 
              label="Explore 2026" 
              activeColor="text-yellow-600"
            />
            <SegmentButton 
              active={activeSegment === 'SELLER'} 
              onClick={() => onSegmentChange('SELLER')} 
              icon="fa-gift" 
              label="Offer Gifts" 
              activeColor="text-yellow-600"
            />
            <SegmentButton 
              active={activeSegment === 'LIBRARY'} 
              onClick={() => onSegmentChange('LIBRARY')} 
              icon="fa-university" 
              label="2026 Archive" 
              activeColor="text-yellow-600"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 p-5 max-w-4xl mx-auto w-full transition-all duration-500 ease-out">
        {children}
      </main>

      {/* Festive Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t-2 border-yellow-500/20 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] z-[100] pb-safe">
        <div className="flex justify-around items-center p-3 max-w-lg mx-auto">
          <NavButton icon="fas fa-search" label="Gifts" active={activeView === 'EXPLORE'} onClick={() => onViewChange('EXPLORE')} colorClass="text-yellow-500" />
          <NavButton icon="fas fa-paper-plane" label="Sent" active={activeView === 'MY_REQUESTS'} onClick={() => onViewChange('MY_REQUESTS')} colorClass="text-yellow-500" />
          <NavButton icon="fas fa-user-circle" label="2026 Hero" active={activeView === 'PROFILE'} onClick={() => onViewChange('PROFILE')} colorClass="text-yellow-500" />
        </div>
      </nav>
    </div>
  );
};

const SegmentButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string; activeColor: string }> = ({ active, onClick, icon, label, activeColor }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-3 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 active:scale-95 flex items-center justify-center gap-2 ${active ? `bg-yellow-500/10 border border-yellow-500/30 ${activeColor} shadow-lg scale-[1.02] z-10` : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    <i className={`fas ${icon} text-xs ${active ? 'animate-in zoom-in-50' : ''}`}></i> 
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const MenuOption: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all active:translate-x-1 text-slate-400 hover:text-white group"
  >
    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
      <i className={icon}></i>
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void; colorClass: string }> = ({ icon, label, active, onClick, colorClass }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 transition-all duration-500 min-w-[80px] group ${active ? `${colorClass} scale-110` : 'text-slate-500 hover:text-yellow-500'}`}
  >
    <div className={`relative mb-1 transition-transform duration-500 ${active ? 'scale-125' : 'group-hover:scale-110'}`}>
      <i className={`${icon} text-xl`}></i>
      {active && <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current animate-pulse`}></div>}
    </div>
    <span className={`text-[9px] font-black text-center leading-tight uppercase tracking-tighter transition-all ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default Layout;
