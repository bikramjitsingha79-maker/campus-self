
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import BookCard from './components/BookCard';
import NotificationBar from './components/NotificationBar';
import AddBookForm from './components/AddBookForm';
import FeedbackForm from './components/FeedbackForm';
import LoginView from './components/LoginView';
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('isLoggedIn') === 'true');
  const [isBooting, setIsBooting] = useState<boolean>(false);
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
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
    localStorage.setItem('themePalette', themePalette);
  }, [language, themePalette]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    localStorage.setItem('userData', JSON.stringify(user));
  }, [isLoggedIn, user]);

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

  const handleLogin = (email: string, college: string) => {
    setIsBooting(true);
    const nameFromEmail = email.split('@')[0];
    const newUser = { ...user, email, college, name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) };
    setTimeout(() => {
      setUser(newUser);
      setIsLoggedIn(true);
      setIsBooting(false);
      setActiveView('EXPLORE');
      showNotification(`Welcome to Campus Shelf, ${newUser.name}!`);
    }, 2000); 
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    showNotification("Logged out successfully", "info");
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
    showNotification(`Connection request sent to ${name}!`);
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
      showNotification("You've already requested this book", "warning");
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
    const updatedUser = { ...user, campusCoins: user.campusCoins + 2 };
    setUser(updatedUser);
    showNotification(`Request sent! You earned 2 Campus Coins! ✨`, 'success');
  };

  const handleSendAiChatMessage = async () => {
    if (!aiChatInput.trim()) return;
    const msg = aiChatInput;
    setAiChatInput('');
    setAiChatHistory(prev => [...prev, {role: 'user', text: msg}]);
    setIsLoadingFeature(true);
    const botResponse = await getAIAssistantResponse(msg, `User is ${user.name} from ${user.college}, branch ${user.branch}`);
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
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">AI Assistant</h2>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/80 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/50 shadow-2xl h-[70vh] flex flex-col frozen-container">
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4">
                {aiChatHistory.length === 0 && (
                  <div className="text-center py-20 opacity-40">
                    <i className="fas fa-user-astronaut text-4xl mb-4"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest">How can I help you today, {user.name}?</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-2 px-10">I can suggest books, find resources, or help fix app issues.</p>
                  </div>
                )}
                {aiChatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-[11px] font-bold tracking-tight leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoadingFeature && (
                  <div className="flex justify-start">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] rounded-tl-none animate-pulse">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[11px] font-black uppercase focus:outline-none focus:ring-4 focus:ring-pink-500/10 placeholder:text-slate-400"
                  placeholder="Ask me anything..."
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendAiChatMessage()}
                />
                <button 
                  onClick={handleSendAiChatMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
                >
                  <i className="fas fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>
          </ViewContainer>
        );

      case 'CAMPUS_HUB':
        return (
          <ViewContainer>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setActiveView('EXPLORE')} className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-800/40 flex items-center justify-center text-slate-500 hover:text-black transition-all"><i className="fas fa-arrow-left"></i></button>
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">Campus Hub</h2>
            </div>

            <div className="relative group mb-6">
              <div className="absolute -inset-1 rounded-[2.5rem] crystal-border blur opacity-20"></div>
              <div className="relative flex items-center bg-white/80 dark:bg-white/90 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/40 shadow-xl p-1">
                <i className="fas fa-search absolute left-6 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Find peers by name or branch..."
                  className="w-full pl-14 pr-6 py-4 bg-transparent text-[11px] font-black text-slate-900 focus:outline-none uppercase placeholder:text-slate-400"
                  value={hubSearch}
                  onChange={(e) => setHubSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 ml-2">Active Students at {user.college}</h3>
              <div className="grid gap-4">
                {MOCK_CAMPUS_USERS.filter(u => u.name.toLowerCase().includes(hubSearch.toLowerCase()) || u.branch.toLowerCase().includes(hubSearch.toLowerCase())).map((peer) => (
                  <div key={peer.id} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/50 shadow-xl flex items-center gap-5 group hover:scale-[1.02] transition-transform frozen-container frozen-shimmer-overlay">
                    <div className="relative shrink-0">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-xl font-black shadow-inner">
                         {peer.name.charAt(0)}
                       </div>
                       <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-[10px] shadow-lg">
                         <i className="fas fa-check"></i>
                       </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{peer.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{peer.branch} • {peer.year}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md uppercase flex items-center gap-1">
                          <i className="fas fa-coins"></i> {peer.campusCoins} Coins
                        </span>
                        <button 
                          onClick={() => handleGetIcebreaker(peer.branch)}
                          className="text-[8px] font-black text-indigo-500 hover:underline uppercase"
                        >
                          AI Icebreaker
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleConnect(peer.id, peer.name)}
                      className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${connectedUsers.includes(peer.id) ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
                    >
                      {connectedUsers.includes(peer.id) ? 'Pending' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {aiIcebreaker && (
              <div className="mt-10 p-8 bg-indigo-600 text-white rounded-[3rem] border border-white/20 animate-in zoom-in duration-500 shadow-2xl relative overflow-hidden frozen-container">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">AI Match Assistant</h4>
                <p className="text-sm font-black italic leading-relaxed">"{aiIcebreaker}"</p>
                <button onClick={() => setAiIcebreaker('')} className="mt-6 text-[9px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-lg hover:bg-white/40 transition-colors">Clear Icebreaker</button>
              </div>
            )}
          </ViewContainer>
        );

      case 'AI_SUGGEST':
        return (
          <ViewContainer>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setActiveView('EXPLORE')} className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-800/40 flex items-center justify-center text-slate-500 transition-all"><i className="fas fa-arrow-left"></i></button>
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">AI Book Suggest</h2>
            </div>
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-8 rounded-[3rem] border-2 border-white/50 shadow-2xl space-y-6 frozen-container">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Course Name</label>
                  <input type="text" placeholder="e.g. Computer Science" className="w-full px-5 py-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl text-sm font-black uppercase border border-white/40 focus:outline-none" value={aiSuggestForm.course} onChange={(e) => setAiSuggestForm({...aiSuggestForm, course: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Semester</label>
                  <select className="w-full px-5 py-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl text-sm font-black uppercase border border-white/40 focus:outline-none cursor-pointer" value={aiSuggestForm.semester} onChange={(e) => setAiSuggestForm({...aiSuggestForm, semester: e.target.value})}>
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleGetAISuggestion} disabled={isLoadingFeature} className="w-full py-5 bg-pink-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                {isLoadingFeature ? "Analyzing..." : "Generate Suggestion"}
              </button>
              {aiRecommendation && <div className="mt-8 p-6 bg-pink-50/50 rounded-3xl border border-pink-200/50 animate-in zoom-in duration-500"><p className="text-sm font-bold italic leading-relaxed">"{aiRecommendation}"</p></div>}
            </div>
          </ViewContainer>
        );

      case 'EXPLORE':
        return (
          <ViewContainer>
            {/* FEATURED CAMPAIGNS - Shown above the options */}
            <div className="space-y-4 animate-in slide-in-from-top-12 duration-1000 fill-mode-both">
              {/* Permanent 70% Discount Banner */}
              {showPromo && (
                <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/20 frozen-container frozen-shimmer-overlay">
                  <button 
                    onClick={() => setShowPromo(false)} 
                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-all z-20"
                  >
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <div className="mb-2 inline-block bg-white/20 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em]">Permanent Reward</div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-1 shimmer-text leading-none">Year Sale</h2>
                      <p className="text-[10px] font-bold text-pink-50/80 uppercase tracking-widest">Collect 30 Coins for 70% Off All Books</p>
                    </div>
                    <div className="bg-white text-pink-600 px-6 py-3 rounded-2xl flex items-baseline gap-2 shadow-lg transform rotate-2">
                      <span className="text-4xl font-black tracking-tighter">70%</span>
                      <span className="text-[10px] font-black uppercase">OFF</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Flash 50% Discount Pop-up Banner */}
              {showFlashPromo && (
                <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl border-2 border-emerald-500/30 frozen-container frozen-shimmer-overlay">
                  <button 
                    onClick={() => setShowFlashPromo(false)} 
                    className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-20"
                  >
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <div className="mb-2 inline-block bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border border-emerald-500/20">Flash Campaign</div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-1 text-emerald-400 leading-none">Flash 50</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-snug">Limited time 50% discount on <br/> any purchase from the Shelf!</p>
                    </div>
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-baseline gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transform -rotate-2">
                      <span className="text-4xl font-black tracking-tighter">50%</span>
                      <span className="text-[10px] font-black uppercase">OFF</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK OPTIONS */}
            <div className="flex overflow-x-auto gap-4 px-1 py-4 no-scrollbar animate-in slide-in-from-right-12 duration-1000 fill-mode-both stagger-2">
              <QuickOption icon="fa-magic" label="AI Suggest" color="text-pink-500" onClick={() => setActiveView('AI_SUGGEST')} />
              <QuickOption icon="fa-coins" label="Campus Coin" color="text-yellow-500" onClick={() => setIsCoinPopupOpen(true)} />
              <QuickOption icon="fa-eye" label="Book Preview" color="text-indigo-500" onClick={() => setActiveView('BOOK_PREVIEW')} />
              <QuickOption icon="fa-tablet-alt" label="E-Books" color="text-emerald-500" onClick={() => setActiveView('E_BOOKS')} />
              <QuickOption icon="fa-users" label="Campus Hub" color="text-amber-500" onClick={() => setActiveView('CAMPUS_HUB')} />
            </div>

            <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-6 py-4 rounded-[1.5rem] border border-white/20 shadow-sm">
                <span className="text-[11px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Books at <span className={exploreAccentColor}>{user.college}</span></span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative"><input type="checkbox" checked={filterCollege} onChange={(e) => setFilterCollege(e.target.checked)} className="sr-only peer"/><div className={`w-10 h-6 bg-slate-100/50 dark:bg-slate-700/50 rounded-full peer-checked:bg-${activeThemeColor}-600`}></div><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 shadow-sm transition-transform"></div></div>
                </label>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-10">
              {processedBooks.map((book, idx) => <BookCard key={book.id} index={idx} book={book} onRequest={startRequest} isRequested={requests.some(r => r.bookId === book.id)} />)}
            </div>
            
            {/* FLOATING AI ASSISTANT ICON */}
            <button 
              onClick={() => setActiveView('AI_ASSISTANT')}
              className="fixed bottom-24 right-6 z-[130] w-16 h-16 bg-pink-600 dark:bg-indigo-600 text-white rounded-[1.8rem] flex flex-col items-center justify-center shadow-2xl animate-float transition-all hover:scale-110 active:scale-95 border-2 border-white group"
            >
              <i className="fas fa-user-astronaut text-xl mb-0.5"></i>
              <span className="text-[7px] font-black uppercase tracking-tighter">AI Help</span>
              <div className="absolute -inset-1 border border-white/20 rounded-[2rem] animate-spin-slow pointer-events-none group-hover:border-white/50"></div>
            </button>
          </ViewContainer>
        );

      case 'BOOK_PREVIEW':
        return (
          <ViewContainer>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setActiveView('EXPLORE')} className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-800/40 flex items-center justify-center text-slate-500 transition-all"><i className="fas fa-arrow-left"></i></button>
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">AI Book Preview</h2>
            </div>
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-[2.5rem] crystal-border blur opacity-20"></div>
                <div className="relative flex items-center bg-white/80 dark:bg-white/90 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/40 shadow-xl p-2">
                  <input type="text" placeholder="Enter book title to preview..." className="flex-1 px-6 py-4 bg-transparent text-[11px] font-black text-slate-900 focus:outline-none uppercase placeholder:text-slate-400" value={previewSearch} onChange={(e) => setPreviewSearch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleGetPreview()} />
                  <button onClick={handleGetPreview} disabled={isLoadingFeature} className="w-14 h-14 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0">
                    <i className={isLoadingFeature ? "fas fa-circle-notch fa-spin" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>
              {previewResult && (
                <div className="bg-white/50 p-8 rounded-[3rem] border border-white shadow-2xl animate-in fade-in duration-700 frozen-container">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6">Preview Summary</h3>
                  <div className="space-y-4">
                    {previewResult.split('\n').map((line, i) => <p key={i} className="text-sm font-black uppercase text-slate-700 leading-relaxed">• {line.replace(/^\d+\.\s*/, '')}</p>)}
                  </div>
                </div>
              )}
            </div>
          </ViewContainer>
        );

      case 'E_BOOKS':
        return (
          <ViewContainer>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setActiveView('EXPLORE')} className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-800/40 flex items-center justify-center text-slate-500 transition-all"><i className="fas fa-arrow-left"></i></button>
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">E-Book Central</h2>
            </div>
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-white shadow-xl space-y-6 frozen-container">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Subject</label><input type="text" placeholder="e.g. Physics" className="w-full px-5 py-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl text-sm font-black uppercase border border-white/40 focus:outline-none" value={ebookSearch.subject} onChange={(e) => setEbookSearch({...ebookSearch, subject: e.target.value})} /></div>
                <div><label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Semester</label><select className="w-full px-5 py-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl text-sm font-black uppercase border border-white/40 focus:outline-none" value={ebookSearch.semester} onChange={(e) => setEbookSearch({...ebookSearch, semester: e.target.value})}>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}</select></div>
              </div>
              <button onClick={handleGetEBooks} disabled={isLoadingFeature} className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Fetch Digital Resources</button>
              {ebookResult && <div className="mt-8 space-y-4 animate-in fade-in duration-700"><h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Resources Found</h3><div className="grid gap-3">{ebookResult.split('\n').map((res, i) => <div key={i} className="p-5 bg-white/40 rounded-3xl border border-white/20 flex items-center justify-between"><span className="text-xs font-black uppercase text-slate-700">{res}</span><i className="fas fa-file-pdf text-emerald-600"></i></div>)}</div></div>}
            </div>
          </ViewContainer>
        );

      case 'MY_REQUESTS':
        return (
          <ViewContainer>
            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">Sent Requests</h2>
            <div className="space-y-4">
              {requests.filter(r => r.borrowerId === user.id).length === 0 ? (
                <div className="bg-white/40 dark:bg-slate-800/40 p-10 rounded-[2.5rem] text-center border border-white/20 shadow-inner">
                  <p className="text-slate-400 uppercase font-black tracking-widest text-[10px]">No active requests</p>
                </div>
              ) : (
                requests.filter(r => r.borrowerId === user.id).map(req => {
                  const book = books.find(b => b.id === req.bookId);
                  return (
                    <div key={req.id} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/50 shadow-xl flex justify-between items-center group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                          <i className="fas fa-paper-plane text-xs"></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{book?.title || 'Unknown Book'}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Requested • {req.timestamp.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${req.status === 'ACCEPTED' ? 'bg-emerald-500 text-white' : req.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
                        {req.status}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ViewContainer>
        );

      case 'MY_LISTINGS':
        const myShelfBooks = books.filter(b => b.donorId === user.id);
        return (
          <ViewContainer>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">My Shelf</h2>
              <button 
                onClick={() => setActiveView('ADD_BOOK')}
                className="px-5 py-2.5 bg-pink-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-pink-700 transition-all"
              >
                List New Book
              </button>
            </div>
            {myShelfBooks.length === 0 ? (
              <div className="bg-white/40 dark:bg-slate-800/40 p-16 rounded-[3rem] text-center border border-dashed border-slate-300 dark:border-slate-700">
                <i className="fas fa-book-open text-3xl text-slate-200 dark:text-slate-800 mb-4"></i>
                <p className="text-slate-400 uppercase font-black tracking-widest text-[10px]">Your shelf is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {myShelfBooks.map((book, idx) => (
                  <BookCard key={book.id} index={idx} book={book} onRequest={() => {}} />
                ))}
              </div>
            )}
          </ViewContainer>
        );

      case 'PROFILE':
        return (
          <ViewContainer>
            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">My Profile</h2>
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full -mr-32 -mt-32"></div>
              
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-24 h-24 rounded-[2.5rem] bg-pink-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-pink-200 dark:shadow-none mb-4 ring-8 ring-white/20 dark:ring-white/5">
                  {user.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{user.college}</p>
                <div className="mt-4 flex items-center gap-2 bg-yellow-400/20 text-yellow-600 px-4 py-1.5 rounded-full border border-yellow-400/20">
                  <i className="fas fa-coins text-xs"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">{user.campusCoins} Campus Coins</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl border border-white/20 text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Donations</span>
                  <span className="text-2xl font-black text-pink-600 tracking-tighter">{user.donationScore}</span>
                </div>
                <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl border border-white/20 text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Status</span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{user.donationScore >= 10 ? 'Campus Hero' : 'Rising Star'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-white/20">
                  <i className="fas fa-graduation-cap text-slate-400 w-5"></i>
                  <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">{user.branch} • {user.year}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-white/20">
                  <i className="fas fa-envelope text-slate-400 w-5"></i>
                  <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">{user.email}</span>
                </div>
              </div>
            </div>
          </ViewContainer>
        );

      case 'SETTINGS':
        return (
          <ViewContainer>
            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">Theme Customizer</h2>
            <div className="grid grid-cols-2 gap-4">
              {([
                { id: 'CLASSIC', name: 'Classic', colors: ['bg-pink-500', 'bg-rose-500', 'bg-indigo-500'] },
                { id: 'CYBERPUNK', name: 'Cyberpunk', colors: ['bg-purple-500', 'bg-fuchsia-500', 'bg-yellow-400'] },
                { id: 'OCEAN', name: 'Ocean', colors: ['bg-cyan-500', 'bg-blue-500', 'bg-teal-500'] },
                { id: 'MIDNIGHT', name: 'Midnight', colors: ['bg-slate-700', 'bg-neutral-800', 'bg-rose-900'] },
              ] as const).map((palette) => (
                <button key={palette.id} onClick={() => setThemePalette(palette.id)} className={`relative p-5 rounded-[2rem] border-4 transition-all overflow-hidden frozen-container ${themePalette === palette.id ? `border-${activeThemeColor}-500 scale-105 shadow-2xl` : 'border-white/20 bg-white/40 dark:bg-slate-800/40'}`}>
                  <div className="flex gap-2 mb-3">{palette.colors.map((c, i) => <div key={i} className={`w-6 h-6 rounded-full ${c} shadow-sm ring-2 ring-white`}></div>)}</div>
                  <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">{palette.name}</span>
                </button>
              ))}
            </div>
          </ViewContainer>
        );

      case 'ADD_BOOK':
        return (
          <AddBookForm 
            user={user} 
            onAdd={(bookData) => {
              const newBook: Book = { ...bookData, id: `book_${Date.now()}` } as Book;
              setBooks(prev => [newBook, ...prev]);
              setActiveView('MY_LISTINGS');
              showNotification("Book listed successfully!", "success");
            }} 
            onCancel={() => setActiveView('MY_LISTINGS')} 
          />
        );

      case 'FEEDBACK':
        return (
          <FeedbackForm user={user} onSubmit={() => { showNotification("Feedback received!", "success"); setActiveView('EXPLORE'); }} />
        );

      case 'LANGUAGE_PICKER':
        return (
          <ViewContainer>
            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">{t.selectLanguage}</h2>
            <div className="grid gap-3">
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <button 
                  key={lang}
                  onClick={() => { setLanguage(lang); setActiveView('SETTINGS'); }}
                  className={`p-6 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all backdrop-blur-md frozen-container frozen-shimmer-overlay ${language === lang ? `bg-${activeThemeColor}-600 text-white shadow-xl scale-[1.02]` : 'bg-white/40 dark:bg-slate-800/40 dark:text-white border border-white/20 hover:translate-x-1'}`}
                >
                  <div className="relative z-20">{languageNames[lang]}</div>
                </button>
              ))}
            </div>
          </ViewContainer>
        );

      default: return <div className="py-20 text-center text-slate-400">View not found</div>;
    }
  };

  const handleGetAISuggestion = async () => {
    if (!aiSuggestForm.course || !aiSuggestForm.semester) { showNotification("Please fill all fields", "warning"); return; }
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 transition-colors">
        <div className={`relative w-32 h-32 bg-${activeThemeColor}-600 rounded-[2.8rem] flex items-center justify-center mb-10 shadow-2xl animate-bounce border-4 border-white/20`}>
          <i className="fas fa-book text-white text-5xl"></i>
        </div>
        <h2 className="text-4xl tracking-tighter uppercase text-slate-900 dark:text-white font-black italic">
          CAMPUS <span className="text-pink-600 shimmer-text">SHELF</span>
        </h2>
      </div>
    );
  }

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;

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
        
        {/* MOVABLE CAMPUS COIN POP-UP */}
        {isCoinPopupOpen && (
          <div 
            style={{ left: coinPos.x, top: coinPos.y }}
            className={`fixed z-[140] w-80 select-none touch-none bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[3rem] border-[3px] border-white shadow-[0_30px_60px_rgba(0,0,0,0.2)] animate-in zoom-in-90 duration-300 frozen-container frozen-shimmer-overlay ${isDragging ? 'scale-105 cursor-grabbing opacity-90' : 'cursor-grab'} transition-transform`}
          >
            <div 
              onMouseDown={onMouseDown}
              className="h-14 w-full flex items-center justify-center border-b border-black/5 dark:border-white/5 active:bg-slate-50 dark:active:bg-slate-800 transition-colors rounded-t-[3rem]"
            >
              <div className="w-16 h-2 bg-slate-300 dark:bg-slate-700 rounded-full shadow-inner"></div>
            </div>

            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-2">My Treasures</h3>
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shadow-inner">
                       <i className="fas fa-coins text-amber-500 text-2xl animate-float"></i>
                     </div>
                     <span className="text-4xl font-black tracking-tighter italic text-slate-900 dark:text-white">{user.campusCoins}</span>
                   </div>
                </div>
                <button onClick={() => setIsCoinPopupOpen(false)} className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90">
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>

              <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8 border border-white shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((user.campusCoins / 30) * 100, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                </div>
              </div>

              <div className={`p-6 rounded-[2rem] border-2 text-center transition-all ${user.campusCoins >= 30 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50/50 dark:bg-slate-800/50 border-white/40'}`}>
                 <p className={`text-[10px] font-black uppercase tracking-widest leading-relaxed ${user.campusCoins >= 30 ? 'text-emerald-600' : 'text-slate-500'}`}>
                   {user.campusCoins >= 30 
                     ? "Discount Activated! 70% Off your next purchase." 
                     : `You are ${(30 - user.campusCoins)} coins away from 70% discount.`}
                 </p>
              </div>

              <button 
                onClick={() => setIsCoinPopupOpen(false)}
                className="w-full mt-8 py-5 bg-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-pink-700 active:scale-95 transition-all shadow-pink-100"
              >
                Back to Shelf
              </button>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
};

const QuickOption: React.FC<{ icon: string; label: string; color: string; onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="min-w-[130px] h-[130px] flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-white/90 backdrop-blur-3xl border-2 border-white/50 rounded-[2.5rem] shadow-xl transition-all active:scale-90 hover:scale-[1.05] frozen-container frozen-shimmer-overlay group shrink-0 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 pointer-events-none"></div>
    <div className={`w-12 h-12 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 ${color} transition-all group-hover:rotate-6 group-hover:scale-110 relative z-20`}><i className={`fas ${icon} text-xl`}></i></div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100 leading-tight px-2 text-center relative z-20">{label}</span>
  </button>
);

export default App;
