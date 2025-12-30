
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import BookCard from './components/BookCard';
import NotificationBar from './components/NotificationBar';
import AddBookForm from './components/AddBookForm';
import FeedbackForm from './components/FeedbackForm';
import { Book, BookRequest, ViewState, User, Language, Segment, ThemePalette, UserRole } from './types';
import { MOCK_BOOKS, CURRENT_USER } from './constants';
import { getBookRecommendation, findNearbyLibraries, getBookPreview, searchEBooks, getCampusNetworkingTip, getAIAssistantResponse } from './services/geminiService';
import { translations, languageNames } from './translations';

// Mock Campus Users for the Hub
const MOCK_CAMPUS_USERS: User[] = [
  { id: 'user_2', name: 'Sarah Miller', email: 'sarah@mit.edu', college: 'MIT', branch: 'Architecture', year: '3rd Year', role: UserRole.STUDENT, donationScore: 12, campusCoins: 45 },
  { id: 'user_5', name: 'David Chen', email: 'david@mit.edu', college: 'MIT', branch: 'Computer Science', year: '2nd Year', role: UserRole.STUDENT, donationScore: 4, campusCoins: 8 },
  { id: 'user_8', name: 'Priya Sharma', email: 'priya@mit.edu', college: 'MIT', branch: 'Electrical Eng', year: '4th Year', role: UserRole.STUDENT, donationScore: 15, campusCoins: 31 },
  { id: 'user_9', name: 'James Wilson', email: 'james@mit.edu', college: 'MIT', branch: 'Mathematics', year: '1st Year', role: UserRole.STUDENT, donationScore: 1, campusCoins: 2 },
];

const ViewContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 zoom-in-95 duration-700 fill-mode-both ease-out">
    {children}
  </div>
);

const App: React.FC = () => {
  // Security removed: App is now free for all by default
  const [isLoggedIn] = useState<boolean>(true); 
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [activeSegment, setActiveSegment] = useState<Segment>('BUYER');
  const [activeView, setActiveView] = useState<ViewState>('EXPLORE');
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });
  const [filterCollege, setFilterCollege] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  
  // Promo States
  const [showPromo, setShowPromo] = useState<boolean>(true);
  const [showFlashPromo, setShowFlashPromo] = useState<boolean>(true);
  
  // Specific States for Quick Options
  const [aiSuggestForm, setAiSuggestForm] = useState({ course: '', semester: '' });
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewResult, setPreviewResult] = useState('');
  const [ebookSearch, setEbookSearch] = useState({ subject: '', semester: '1' });
  const [ebookResult, setEbookResult] = useState('');
  const [isLoadingFeature, setIsLoadingFeature] = useState(false);

  // AI Assistant Chat State
  const [aiChatHistory, setAiChatHistory] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Campus Hub & Coin States
  const [hubSearch, setHubSearch] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [aiIcebreaker, setAiIcebreaker] = useState('');

  // Draggable Coin Popup State
  const [isCoinPopupOpen, setIsCoinPopupOpen] = useState(false);
  const [coinPos, setCoinPos] = useState({ x: 50, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const [themePalette, setThemePalette] = useState<ThemePalette>(() => (localStorage.getItem('themePalette') as ThemePalette) || 'CLASSIC');
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('darkMode') === 'true');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || Language.ENGLISH);
  
  const t = useMemo(() => translations[language], [language]);

  const getPaletteConfig = (palette: ThemePalette) => {
    const palettes: Record<ThemePalette, Record<Segment, string>> = {
      CLASSIC: { BUYER: 'pink', SELLER: 'rose', LIBRARY: 'indigo' },
      CYBERPUNK: { BUYER: 'purple', SELLER: 'fuchsia', LIBRARY: 'yellow' },
      OCEAN: { BUYER: 'cyan', SELLER: 'blue', LIBRARY: 'teal' },
      MIDNIGHT: { BUYER: 'slate', SELLER: 'neutral', LIBRARY: 'rose' }
    };
    return palettes[palette];
  };

  const currentPalette = getPaletteConfig(themePalette);
  const activeThemeColor = currentPalette[activeSegment];

  useEffect(() => {
    // Initial boot animation
    const timer = setTimeout(() => setIsBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
    localStorage.setItem('themePalette', themePalette);
  }, [language, themePalette]);

  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (activeView === 'AI_ASSISTANT') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatHistory, activeView]);

  // Draggable Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - coinPos.x, y: e.clientY - coinPos.y };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setCoinPos({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    };
    const onMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const handleLogout = () => {
    showNotification("Resetting festive session...", "info");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleSegmentChange = (segment: Segment) => {
    setActiveSegment(segment);
    segment === 'SELLER' ? setActiveView('MY_LISTINGS') : setActiveView('EXPLORE');
  };

  const processedBooks = useMemo(() => {
    let filtered = books;
    if (activeView === 'EXPLORE') {
      if (filterCollege) filtered = filtered.filter(b => b.college === user.college);
      if (activeSegment === 'LIBRARY') {
        const acceptedIds = requests.filter(r => r.borrowerId === user.id && r.status === 'ACCEPTED').map(r => r.bookId);
        filtered = filtered.filter(b => acceptedIds.includes(b.id) || b.isInstitutionDonated);
      } else if (activeSegment === 'BUYER') {
        filtered = filtered.filter(b => !b.isInstitutionDonated);
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => (a.isUrgent === b.isUrgent ? a.title.localeCompare(b.title) : a.isUrgent ? -1 : 1));
  }, [books, activeView, activeSegment, filterCollege, user.college, requests, user.id, searchQuery]);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => setNotification({ message, type });

  const handleConnect = (userId: string, name: string) => {
    if (connectedUsers.includes(userId)) return;
    setConnectedUsers(prev => [...prev, userId]);
    showNotification(`Festive request sent to ${name}!`);
  };

  const handleGetIcebreaker = async (branch: string) => {
    setIsLoadingFeature(true);
    const res = await getCampusNetworkingTip(user.branch, branch);
    setAiIcebreaker(res);
    setIsLoadingFeature(false);
  };

  const startRequest = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (requests.some(r => r.bookId === bookId)) {
      showNotification("Already requested this gift!", "warning");
      return;
    }

    const newRequest: BookRequest = {
      id: `req_${Date.now()}`,
      bookId,
      borrowerId: user.id,
      donorId: book.donorId,
      status: 'PENDING',
      timestamp: new Date(),
    };

    setRequests(prev => [...prev, newRequest]);
    const updatedUser = { ...user, campusCoins: user.campusCoins + 5 }; // Boost for New Year
    setUser(updatedUser);
    showNotification(`New Year Request sent! +5 Bonus Coins! 🎆`, 'success');
  };

  const handleSendAiChatMessage = async () => {
    if (!aiChatInput.trim()) return;
    const msg = aiChatInput;
    setAiChatInput('');
    setAiChatHistory(prev => [...prev, {role: 'user', text: msg}]);
    setIsLoadingFeature(true);
    const botResponse = await getAIAssistantResponse(msg, `User is ${user.name} from ${user.college}, branch ${user.branch}. It is currently New Year 2026 celebration time.`);
    setAiChatHistory(prev => [...prev, {role: 'bot', text: botResponse || '...' }]);
    setIsLoadingFeature(false);
  };

  const renderView = () => {
    const exploreAccentColor = `text-${activeThemeColor}-600`;

    switch (activeView) {
      case 'AI_ASSISTANT':
        return (
          <ViewContainer>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setActiveView('EXPLORE')} className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-800/40 flex items-center justify-center text-slate-500 transition-all"><i className="fas fa-arrow-left"></i></button>
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">AI 2026 Navigator</h2>
            </div>
            <div className="bg-white/70 dark:bg-slate-900/90 backdrop-blur-3xl p-6 rounded-[3.5rem] border-4 border-yellow-500/30 shadow-2xl h-[70vh] flex flex-col frozen-container relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent"></div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 mb-4 p-2">
                {aiChatHistory.length === 0 && (
                  <div className="text-center py-10 animate-in fade-in zoom-in duration-1000">
                    <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner animate-float border-2 border-yellow-500/20">
                      <i className="fas fa-glass-cheers text-yellow-600 text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Happy New Year 2026!</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2 px-10">I am your festive campus guide. Need resolutions, books, or app help?</p>
                  </div>
                )}
                {aiChatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-[12px] font-bold tracking-tight leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white rounded-tl-none border-2 border-yellow-500/10'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoadingFeature && (
                  <div className="flex justify-start">
                    <div className="p-5 bg-white/80 dark:bg-slate-800 rounded-[1.8rem] rounded-tl-none animate-pulse border border-yellow-500/10">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>

              <div className="relative pt-2">
                <input 
                  type="text" 
                  className="w-full pl-6 pr-16 py-5 bg-slate-50 dark:bg-slate-900/50 border-2 border-yellow-500/10 rounded-[2rem] text-[12px] font-black uppercase focus:outline-none focus:ring-8 focus:ring-yellow-500/5 focus:border-yellow-500 placeholder:text-slate-400 transition-all shadow-inner"
                  placeholder="Ask for 2026 suggestions..."
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendAiChatMessage()}
                />
                <button 
                  onClick={handleSendAiChatMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-600 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all"
                >
                  <i className="fas fa-paper-plane text-sm"></i>
                </button>
              </div>
            </div>
          </ViewContainer>
        );

      case 'EXPLORE':
        return (
          <ViewContainer>
            {/* FESTIVE 2026 HERO BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-[3.5rem] p-10 text-white shadow-2xl border-4 border-yellow-500/30 frozen-container frozen-shimmer-overlay animate-in slide-in-from-top-12 duration-1000">
               <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-24 -mb-24 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
               
               <div className="relative z-10 flex flex-col items-center text-center gap-4">
                  <div className="inline-block px-6 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] font-black uppercase tracking-[0.5em] border border-yellow-500/20 mb-2">
                    Campus Shelf • Celebration
                  </div>
                  <h2 className="text-6xl font-black tracking-tighter italic leading-none gold-text shimmer-text scale-110">
                    2026
                  </h2>
                  <p className="text-lg font-brand italic text-slate-300">New Year, New Knowledge</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Collect coins to unlock exclusive <span className="text-yellow-500">2026 Platinum Hero</span> status</p>
               </div>
               
               {/* Sparkle Icons around the banner */}
               <i className="fas fa-sparkles absolute top-6 left-10 text-yellow-500/40 text-xl animate-firework"></i>
               <i className="fas fa-bolt absolute bottom-6 right-12 text-indigo-400/40 text-lg animate-firework"></i>
            </div>

            {/* QUICK OPTIONS - Festive Styled */}
            <div className="flex overflow-x-auto gap-5 px-1 py-4 no-scrollbar animate-in slide-in-from-right-12 duration-1000 fill-mode-both stagger-2">
              <QuickOption icon="fa-gift" label="New Year AI" color="text-yellow-500" onClick={() => setActiveView('AI_ASSISTANT')} festive />
              <QuickOption icon="fa-coins" label="Festive Coins" color="text-yellow-400" onClick={() => setIsCoinPopupOpen(true)} />
              <QuickOption icon="fa-eye" label="2026 Previews" color="text-indigo-400" onClick={() => setActiveView('BOOK_PREVIEW')} />
              <QuickOption icon="fa-tablet-alt" label="E-Library" color="text-emerald-400" onClick={() => setActiveView('E_BOOKS')} />
              <QuickOption icon="fa-users" label="Campus Hub" color="text-amber-500" onClick={() => setActiveView('CAMPUS_HUB')} />
            </div>

            <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-6 py-4 rounded-[1.5rem] border border-yellow-500/10 shadow-sm">
                <span className="text-[11px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Available Gifts at <span className="text-yellow-600 font-black">{user.college}</span></span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative"><input type="checkbox" checked={filterCollege} onChange={(e) => setFilterCollege(e.target.checked)} className="sr-only peer"/><div className={`w-10 h-6 bg-slate-100/50 dark:bg-slate-700/50 rounded-full peer-checked:bg-yellow-600`}></div><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 shadow-sm transition-transform"></div></div>
                </label>
            </div>

            <div className="grid grid-cols-2 gap-6 pb-10">
              {processedBooks.map((book, idx) => <BookCard key={book.id} index={idx} book={book} onRequest={startRequest} isRequested={requests.some(r => r.bookId === book.id)} />)}
            </div>
            
            {/* FLOATING AI TOOL ICON (Festive Person Figure) */}
            <button 
              onClick={() => setActiveView('AI_ASSISTANT')}
              className="fixed bottom-24 right-6 z-[130] w-20 h-20 bg-indigo-950 dark:bg-slate-900 text-white rounded-full flex flex-col items-center justify-center shadow-[0_15px_40px_rgba(251,191,36,0.3)] animate-float transition-all hover:scale-110 active:scale-95 border-4 border-yellow-500/40 group"
            >
              <i className="fas fa-person-rays text-3xl mb-1 text-yellow-500"></i>
              <span className="text-[9px] font-black uppercase tracking-tighter gold-text">2026 AI</span>
              <div className="absolute -inset-2 border-2 border-yellow-500/20 rounded-full animate-spin-slow pointer-events-none"></div>
              <div className="absolute -inset-4 border border-indigo-500/10 rounded-full animate-pulse pointer-events-none"></div>
            </button>
          </ViewContainer>
        );

      default: return <div className="py-20 text-center text-slate-400">View not found</div>;
    }
  };

  const handleGetAISuggestion = async () => {
    if (!aiSuggestForm.course || !aiSuggestForm.semester) { showNotification("Provide course details for 2026", "warning"); return; }
    setIsLoadingFeature(true);
    const res = await getBookRecommendation(aiSuggestForm.course, aiSuggestForm.semester);
    setAiRecommendation(res);
    setIsLoadingFeature(false);
  };

  const handleGetPreview = async () => {
    if (!previewSearch) return;
    setIsLoadingFeature(true);
    const res = await getBookPreview(previewSearch);
    setPreviewResult(res);
    setIsLoadingFeature(false);
  };

  const handleGetEBooks = async () => {
    if (!ebookSearch.subject) return;
    setIsLoadingFeature(true);
    const res = await searchEBooks(ebookSearch.subject, ebookSearch.semester);
    setEbookResult(res);
    setIsLoadingFeature(false);
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 transition-colors">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
           <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-500 rounded-full animate-firework"></div>
           <div className="absolute top-40 right-20 w-6 h-6 bg-red-500 rounded-full animate-firework"></div>
           <div className="absolute bottom-20 left-1/2 w-8 h-8 bg-blue-500 rounded-full animate-firework"></div>
        </div>
        
        <div className="relative w-40 h-40 bg-slate-900 rounded-[3.5rem] flex items-center justify-center mb-12 shadow-2xl animate-float border-4 border-yellow-500/40">
          <i className="fas fa-glass-cheers text-yellow-500 text-6xl"></i>
          <div className="absolute -inset-4 border-2 border-yellow-500/20 rounded-[4rem] animate-spin-slow"></div>
        </div>
        <h2 className="text-6xl tracking-tighter uppercase text-white font-black italic gold-text shimmer-text">
          2026
        </h2>
        <h3 className="text-xl font-brand italic text-slate-400 mt-2 tracking-[0.2em]">HAPPY NEW YEAR</h3>
        <div className="mt-10 flex gap-4">
           <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
           <div className="w-4 h-4 bg-yellow-600 rounded-full animate-pulse delay-150"></div>
           <div className="w-4 h-4 bg-yellow-700 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      <Layout 
        activeView={activeView} activeSegment={activeSegment} themePalette={themePalette}
        onViewChange={setActiveView} onSegmentChange={handleSegmentChange}
        userDonationScore={user.donationScore} language={language} darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)} onLogout={handleLogout}
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
      >
        <NotificationBar message={notification?.message || null} type={notification?.type} theme={activeThemeColor as any} onClose={() => setNotification(null)} />
        <div className="transition-all duration-500">{renderView()}</div>
        
        {/* FESTIVE CAMPUS COIN POP-UP */}
        {isCoinPopupOpen && (
          <div 
            style={{ left: coinPos.x, top: coinPos.y }}
            className={`fixed z-[140] w-80 select-none touch-none bg-slate-900/95 backdrop-blur-3xl rounded-[3.5rem] border-[3px] border-yellow-500/40 shadow-[0_30px_60px_rgba(0,0,0,0.5)] animate-in zoom-in-90 duration-300 frozen-container frozen-shimmer-overlay ${isDragging ? 'scale-105 cursor-grabbing opacity-90' : 'cursor-grab'} transition-transform`}
          >
            <div 
              onMouseDown={onMouseDown}
              className="h-14 w-full flex items-center justify-center border-b border-white/10 active:bg-slate-800 transition-colors rounded-t-[3.5rem]"
            >
              <div className="w-16 h-2 bg-yellow-500/20 rounded-full shadow-inner"></div>
            </div>

            <div className="p-10 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-2">2026 Treasures</h3>
                   <div className="flex items-center gap-3">
                     <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center shadow-inner border border-yellow-500/20">
                       <i className="fas fa-certificate text-yellow-500 text-3xl animate-float"></i>
                     </div>
                     <span className="text-5xl font-black tracking-tighter italic gold-text">{user.campusCoins}</span>
                   </div>
                </div>
                <button onClick={() => setIsCoinPopupOpen(false)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-yellow-500 transition-all active:scale-90">
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>

              <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mb-8 border border-yellow-500/10 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((user.campusCoins / 50) * 100, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                </div>
              </div>

              <div className={`p-6 rounded-[2rem] border-2 text-center transition-all ${user.campusCoins >= 50 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
                 <p className={`text-[10px] font-black uppercase tracking-widest leading-relaxed ${user.campusCoins >= 50 ? 'text-yellow-400' : 'text-slate-400'}`}>
                   {user.campusCoins >= 50 
                     ? "Platinum Discount Activated! Celebrate 2026 with 80% Off." 
                     : `Reach 50 Coins for Platinum 2026 Rewards.`}
                 </p>
              </div>

              <button 
                onClick={() => setIsCoinPopupOpen(false)}
                className="w-full mt-8 py-5 bg-yellow-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-yellow-700 active:scale-95 transition-all"
              >
                Let's Celebrate
              </button>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
};

const QuickOption: React.FC<{ icon: string; label: string; color: string; onClick: () => void; festive?: boolean }> = ({ icon, label, color, onClick, festive }) => (
  <button onClick={onClick} className={`min-w-[140px] h-[140px] flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl border-2 ${festive ? 'border-yellow-500/40 shadow-[0_10px_30px_rgba(251,191,36,0.2)]' : 'border-white/50 shadow-xl'} rounded-[3rem] transition-all active:scale-90 hover:scale-[1.08] frozen-container frozen-shimmer-overlay group shrink-0 relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 via-transparent to-white/10 pointer-events-none"></div>
    <div className={`w-14 h-14 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 ${color} transition-all group-hover:rotate-6 group-hover:scale-110 relative z-20`}><i className={`fas ${icon} text-2xl`}></i></div>
    <span className={`text-[11px] font-black uppercase tracking-widest ${festive ? 'gold-text' : 'text-slate-900 dark:text-slate-100'} leading-tight px-2 text-center relative z-20`}>{label}</span>
  </button>
);

export default App;
