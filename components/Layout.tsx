
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
  const themeClass = `bg-${currentColor}-700/80 dark:bg-${currentColor}-950/80 backdrop-blur-xl transition-colors duration-700`;
  const accentBg = `bg-${currentColor}-600`;
  const textClass = `text-${currentColor}-700 dark:text-${currentColor}-400`;

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
      <header className={`sticky top-0 z-[100] ${themeClass} text-white shadow-xl transition-all duration-700 ease-in-out border-b border-white/10`}>
        <div className="p-4 pb-2 flex items-center justify-between gap-3">
          
          {/* Animated Application Branding */}
          <div className="flex items-center gap-2 shrink-0 group cursor-pointer overflow-hidden py-1">
            <div className="relative w-10 h-10 rounded-2xl bg-white text-pink-600 flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 crystal-glow">
              <i className="fas fa-book text-lg animate-float"></i>
              {/* Inner Light Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 animate-shimmer"></div>
            </div>
            
            <div className="flex flex-col leading-none overflow-hidden">
              <h1 className="flex flex-col relative">
                <span className="font-black italic text-sm tracking-tighter uppercase animate-text-reveal shimmer-text stagger-1">
                  CAMPUS
                </span>
                <span className="font-brand italic text-[11px] tracking-[0.3em] opacity-80 animate-text-reveal stagger-2 ml-0.5">
                  SHELF
                </span>
              </h1>
            </div>
          </div>

          {/* Unique Frozen White Search Bar */}
          <div className={`flex-1 max-w-sm relative transition-all duration-500 ease-out group ${isFocused ? 'scale-105 z-50' : ''}`}>
            {/* Icy Glow Border */}
            <div className={`absolute -inset-[1px] rounded-2xl crystal-border blur-[3px] opacity-0 group-hover:opacity-60 group-focus-within:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative flex items-center bg-white/80 dark:bg-white/90 backdrop-blur-3xl rounded-2xl overflow-hidden border border-white/40 shadow-xl frozen-shimmer-overlay">
              <i className={`fas fa-search absolute left-4 text-xs transition-all duration-500 z-30 ${isFocused ? 'text-slate-900 scale-125' : 'text-slate-400'}`}></i>
              
              <input 
                type="text" 
                placeholder="Search resources..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full pl-11 pr-12 py-2.5 bg-transparent text-[11px] font-black text-slate-900 focus:outline-none transition-all uppercase placeholder:text-slate-400/70 z-20 relative"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />

              {/* Clear / Keyboard Shortcut Hint */}
              <div className="absolute right-3 flex items-center gap-2 z-30">
                {searchQuery && (
                  <button 
                    onClick={() => onSearchChange('')}
                    className="w-6 h-6 rounded-lg bg-slate-200/50 hover:bg-slate-300/80 flex items-center justify-center animate-in zoom-in spin-in-90 duration-300 transition-all text-slate-700"
                  >
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                )}
                {!isFocused && !searchQuery && (
                  <div className="hidden sm:flex px-1.5 py-0.5 rounded-md border border-slate-200 bg-slate-100/80 text-[8px] font-black tracking-widest text-slate-400 uppercase">
                    ⌘K
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 relative" ref={menuRef}>
            <button 
              onClick={() => onViewChange('PROFILE')}
              className={`w-9 h-9 rounded-xl border-2 transition-all duration-500 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 backdrop-blur-md ${activeView === 'PROFILE' ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
            >
              <i className="fas fa-user-circle text-base"></i>
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 bg-white/10 hover:bg-white/20 active:scale-90 backdrop-blur-md ${isMenuOpen ? 'rotate-90 bg-white/30' : ''}`}
            >
              <i className="fas fa-ellipsis-v text-base"></i>
            </button>

            {isMenuOpen && (
              <div className="absolute top-12 right-0 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-2 border-white/20 dark:border-slate-800 rounded-[2.5rem] shadow-2xl z-[120] animate-in fade-in zoom-in-95 duration-300 fill-mode-both overflow-hidden text-slate-900 dark:text-white p-2">
                <div className="space-y-1">
                  <button 
                    onClick={onToggleDarkMode}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/20 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl ${accentBg} text-white flex items-center justify-center shadow-sm`}>
                        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{darkMode ? 'Day Mode' : 'Night Mode'}</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${darkMode ? accentBg : 'bg-slate-200/50 dark:bg-slate-700/50 backdrop-blur-sm'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-500 transform ${darkMode ? 'translate-x-7 shadow-md' : 'translate-x-1'}`}></div>
                    </div>
                  </button>

                  <hr className="border-white/10 dark:border-slate-800 my-1 mx-2" />

                  <MenuOption icon="fas fa-cog text-indigo-500" label={t.appSettings} onClick={() => handleMenuAction('SETTINGS')} />
                  <MenuOption icon="fas fa-comment-dots text-pink-500" label={t.feedback} onClick={() => handleMenuAction('FEEDBACK')} />
                  <MenuOption icon="fas fa-language text-emerald-500" label={t.language} onClick={() => handleMenuAction('LANGUAGE_PICKER')} />
                  
                  <hr className="border-white/10 dark:border-slate-800 my-1 mx-2" />
                  
                  <button 
                    onClick={() => { setIsMenuOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-500/20 dark:hover:bg-rose-900/20 text-rose-600 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-rose-50/50 dark:bg-rose-900/30 flex items-center justify-center backdrop-blur-md">
                      <i className="fas fa-sign-out-alt"></i>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-4 animate-in slide-in-from-top-4 duration-700 delay-100 fill-mode-both">
          <div className="flex bg-white/10 dark:bg-black/20 rounded-[1.8rem] p-1.5 gap-1.5 backdrop-blur-md relative shadow-inner border border-white/5">
            <SegmentButton 
              active={activeSegment === 'BUYER'} 
              onClick={() => onSegmentChange('BUYER')} 
              icon="fa-shopping-cart" 
              label={t.buyerMode} 
              activeColor={`text-${getThemeColors(themePalette, 'BUYER')}-700`}
            />
            <SegmentButton 
              active={activeSegment === 'SELLER'} 
              onClick={() => onSegmentChange('SELLER')} 
              icon="fa-hand-holding-heart" 
              label={t.sellerMode} 
              activeColor={`text-${getThemeColors(themePalette, 'SELLER')}-700`}
            />
            <SegmentButton 
              active={activeSegment === 'LIBRARY'} 
              onClick={() => onSegmentChange('LIBRARY')} 
              icon="fa-university" 
              label={t.library} 
              activeColor={`text-${getThemeColors(themePalette, 'LIBRARY')}-700`}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 p-5 max-w-4xl mx-auto w-full transition-all duration-500 ease-out">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-white/20 dark:border-slate-800/50 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-[100] transition-colors pb-safe">
        <div className="flex justify-around items-center p-3 max-w-lg mx-auto">
          {activeSegment !== 'SELLER' ? (
            <>
              <NavButton 
                icon="fas fa-search" 
                label={t.explore} 
                active={activeView === 'EXPLORE'} 
                onClick={() => onViewChange('EXPLORE')} 
                colorClass={textClass}
              />
              <NavButton 
                icon="fas fa-paper-plane" 
                label={t.requests} 
                active={activeView === 'MY_REQUESTS'} 
                onClick={() => onViewChange('MY_REQUESTS')} 
                colorClass={textClass}
              />
            </>
          ) : (
            <>
              <NavButton 
                icon="fas fa-book-open" 
                label={t.myShelf} 
                active={activeView === 'MY_LISTINGS'} 
                onClick={() => onViewChange('MY_LISTINGS')} 
                colorClass={`text-${getThemeColors(themePalette, 'SELLER')}-600 dark:text-${getThemeColors(themePalette, 'SELLER')}-400`}
              />
              <NavButton 
                icon="fas fa-plus-circle" 
                label={t.listBook} 
                active={activeView === 'ADD_BOOK'} 
                onClick={() => onViewChange('ADD_BOOK')} 
                colorClass={`text-${getThemeColors(themePalette, 'SELLER')}-600 dark:text-${getThemeColors(themePalette, 'SELLER')}-400`}
              />
            </>
          )}
          <NavButton 
            icon="fas fa-user-circle" 
            label={t.profile} 
            active={activeView === 'PROFILE'} 
            onClick={() => onViewChange('PROFILE')} 
            colorClass={textClass}
          />
        </div>
      </nav>
    </div>
  );
};

const SegmentButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string; activeColor: string }> = ({ active, onClick, icon, label, activeColor }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ease-out active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md ${active ? `bg-white/90 ${activeColor} shadow-xl scale-[1.02] z-10 border border-white/20` : 'text-white/60 hover:text-white hover:bg-white/5'}`}
  >
    <i className={`fas ${icon} text-xs ${active ? 'animate-in zoom-in-50' : ''}`}></i> 
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const MenuOption: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/30 dark:hover:bg-slate-800/40 transition-all active:translate-x-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group"
  >
    <div className="w-10 h-10 rounded-2xl bg-white/20 dark:bg-slate-800/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform backdrop-blur-sm border border-white/10">
      <i className={icon}></i>
    </div>
    <span className="text-xs font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void; colorClass: string }> = ({ icon, label, active, onClick, colorClass }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 transition-all duration-500 min-w-[80px] group ${active ? `${colorClass} scale-110` : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'}`}
  >
    <div className={`relative mb-1 transition-transform duration-500 ${active ? 'scale-125' : 'group-hover:scale-110'}`}>
      <i className={`${icon} text-xl`}></i>
      {active && <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current animate-in zoom-in duration-500`}></div>}
    </div>
    <span className={`text-[9px] font-black text-center leading-tight uppercase tracking-tighter transition-all ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{label}</span>
  </button>
);

export default Layout;
