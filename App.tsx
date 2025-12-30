
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import BookCard from './components/BookCard';
import NotificationBar from './components/NotificationBar';
import AddBookForm from './components/AddBookForm';
import { Book, BookRequest, ViewState, User, Language, Segment } from './types';
import { MOCK_BOOKS, CURRENT_USER } from './constants';
import { getSearchSuggestions, getBookRecommendation, getBookPreview, searchEBooks } from './services/geminiService';

// Audio utility
const playPop = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch(e) {}
};

const playSuccess = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
  } catch(e) {}
};

const ViewContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-10 animate-slide-up duration-700">
    {children}
  </div>
);

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [activeSegment, setActiveSegment] = useState<Segment>('BUYER');
  const [activeView, setActiveView] = useState<ViewState>('EXPLORE');
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS as Book[]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  
  // Feature states
  const [isLoadingFeature, setIsLoadingFeature] = useState(false);
  const [featureResult, setFeatureResult] = useState<string>('');
  const [suggestForm, setSuggestForm] = useState({ dept: '', semester: '' });
  const [previewQuery, setPreviewQuery] = useState('');
  const [ebookQuery, setEbookQuery] = useState('');
  
  // Community Hub Mock State
  const [chatUser, setChatUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    // Satisfying boot sequence duration
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const suggestions = await getSearchSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => setNotification({ message, type });

  // Navigation Logic
  const handleNav = (v: ViewState) => {
    playPop();
    setFeatureResult('');
    setActiveView(v);
  };

  const handleSegmentChange = (s: Segment) => {
    playPop();
    setActiveSegment(s);
    if (s === 'SELLER') setActiveView('MY_LISTINGS');
    else setActiveView('EXPLORE');
  };

  const handleGetAISuggestions = async () => {
    if (!suggestForm.dept || !suggestForm.semester) {
      showNotification("Please specify Dept & Semester!", "warning");
      return;
    }
    setIsLoadingFeature(true);
    playPop();
    const result = await getBookRecommendation(suggestForm.dept, suggestForm.semester);
    setFeatureResult(result);
    setIsLoadingFeature(false);
    playSuccess();
  };

  const handleGetBookPreview = async () => {
    if (!previewQuery) return;
    setIsLoadingFeature(true);
    playPop();
    const result = await getBookPreview(previewQuery);
    setFeatureResult(result);
    setIsLoadingFeature(false);
    playSuccess();
  };

  const handleSearchEbooks = async () => {
    if (!ebookQuery) return;
    setIsLoadingFeature(true);
    playPop();
    const result = await searchEBooks(ebookQuery, suggestForm.semester || "Undergrad");
    setFeatureResult(result);
    setIsLoadingFeature(false);
    playSuccess();
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    playPop();
    const text = chatInput;
    setMessages(prev => [...prev, { sender: 'You', text }]);
    setChatInput('');
    // Mock reply from a nearby user
    setTimeout(() => {
      playPop();
      setMessages(prev => [...prev, { 
        sender: chatUser || 'Student', 
        text: `Hey Alex! I saw you looking for ${MOCK_BOOKS[0].title}. I have a copy available in the ${MOCK_BOOKS[0].area}. Want to meet up?` 
      }]);
    }, 1500);
  };

  const renderView = () => {
    switch (activeView) {
      case 'AI_SUGGEST':
        return (
          <ViewContainer>
            <FeatureHeader title="Smart Suggestions" onBack={() => handleNav('EXPLORE')} icon="fa-brain-circuit" />
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-yellow-500/10 shadow-2xl space-y-8 animate-zoom-fade">
              <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-3xl border border-yellow-500/10">
                <i className="fas fa-sparkles text-yellow-600 animate-pulse"></i>
                <p className="text-[10px] font-black uppercase text-yellow-800 dark:text-yellow-400 tracking-widest">Oracle AI is analyzing current 2026 syllabus requirements.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FeatureInput 
                  label="Department Name" 
                  placeholder="e.g. Physics, Law..." 
                  value={suggestForm.dept} 
                  onChange={(v) => setSuggestForm({...suggestForm, dept: v})}
                />
                <FeatureInput 
                  label="Current Semester" 
                  placeholder="e.g. 1st Sem, 4th Sem..." 
                  value={suggestForm.semester} 
                  onChange={(v) => setSuggestForm({...suggestForm, semester: v})}
                />
              </div>
              <button 
                onClick={handleGetAISuggestions}
                className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-yellow-600 group click-satisfying"
              >
                {isLoadingFeature ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-wand-sparkles group-hover:rotate-12 transition-transform"></i>}
                Generate Recommendations
              </button>
              <FeatureResult result={featureResult} loading={isLoadingFeature} />
            </div>
          </ViewContainer>
        );

      case 'BOOK_PREVIEW':
        return (
          <ViewContainer>
            <FeatureHeader title="Book Preview" onBack={() => handleNav('EXPLORE')} icon="fa-magnifying-glass-plus" />
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-yellow-500/10 shadow-2xl space-y-8 animate-zoom-fade">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Find a book to see its summary and curriculum value.</p>
              <div className="relative">
                <FeatureInput 
                  label="Search for Book Title" 
                  placeholder="Enter book title or author..." 
                  value={previewQuery} 
                  onChange={setPreviewQuery}
                />
                <i className="fas fa-search absolute right-6 bottom-5 text-slate-300 pointer-events-none"></i>
              </div>
              <button 
                onClick={handleGetBookPreview}
                className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-yellow-600 click-satisfying"
              >
                {isLoadingFeature ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-eye"></i>}
                Analyze Book Content
              </button>
              <FeatureResult result={featureResult} loading={isLoadingFeature} />
            </div>
          </ViewContainer>
        );

      case 'E_BOOKS':
        return (
          <ViewContainer>
            <FeatureHeader title="E-Book Archive" onBack={() => handleNav('EXPLORE')} icon="fa-scroll" />
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-yellow-500/10 shadow-2xl space-y-8 animate-zoom-fade">
              <div className="flex flex-col gap-6">
                 <FeatureInput 
                    label="Resource Search" 
                    placeholder="Search for E-Books, PDF, or Subject..."
                    value={ebookQuery}
                    onChange={setEbookQuery}
                 />
              </div>
              <button 
                onClick={handleSearchEbooks}
                className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-emerald-700 click-satisfying"
              >
                {isLoadingFeature ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-cloud-arrow-down"></i>}
                Find Digital Resources
              </button>
              <FeatureResult result={featureResult} loading={isLoadingFeature} />
            </div>
          </ViewContainer>
        );

      case 'CAMPUS_HUB':
        return (
          <ViewContainer>
            <FeatureHeader title="Community Sync" onBack={() => handleNav('EXPLORE')} icon="fa-users-rays" />
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-yellow-500/10 shadow-2xl overflow-hidden h-[70vh] flex flex-col animate-zoom-fade">
               {!chatUser ? (
                 <div className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Nearby Students (500m)</h3>
                       <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Live</span>
                       </div>
                    </div>
                    {['Rohan K. (CS)', 'Sneha P. (Law)', 'David M. (Arts)', 'Ananya S. (Physics)'].map((person, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => { setChatUser(person); playPop(); }}
                        className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] cursor-pointer hover:scale-[1.03] transition-all border border-transparent hover:border-yellow-500/30 group click-satisfying"
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-yellow-500 flex items-center justify-center font-black text-xl border border-yellow-500/20 group-hover:rotate-3">
                               {person.charAt(0)}
                            </div>
                            <div>
                               <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{person}</h4>
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sharing: Algorithms, BioChem</span>
                            </div>
                         </div>
                         <i className="fas fa-comment-dots text-slate-300 group-hover:text-yellow-600 transition-colors"></i>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 backdrop-blur-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                       <div className="flex items-center gap-4">
                          <button onClick={() => { setChatUser(null); setMessages([]); playPop(); }} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-yellow-600 transition-all click-satisfying"><i className="fas fa-chevron-left"></i></button>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-900 text-yellow-500 flex items-center justify-center font-black text-sm">{chatUser.charAt(0)}</div>
                             <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{chatUser}</h4>
                          </div>
                       </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
                       {messages.map((msg, i) => (
                         <div key={i} className={`message-bubble ${msg.sender === 'You' ? 'message-sent' : 'message-received'}`}>
                            {msg.text}
                         </div>
                       ))}
                    </div>
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex gap-3">
                       <input 
                          type="text" 
                          placeholder="Type an instant message..." 
                          className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-yellow-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 uppercase shadow-inner"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                       />
                       <button onClick={handleSendChat} className="w-16 h-16 bg-yellow-600 text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all hover:bg-yellow-700 click-satisfying"><i className="fas fa-paper-plane text-xl"></i></button>
                    </div>
                 </div>
               )}
            </div>
          </ViewContainer>
        );

      case 'EXPLORE':
        return (
          <ViewContainer>
            {/* 2026 EXCELLENCE HERO */}
            <div className="relative overflow-hidden bg-slate-950 rounded-[4rem] p-16 text-white shadow-2xl border border-yellow-500/20 group">
               <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full -mr-48 -mt-48 blur-[120px] animate-pulse"></div>
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex items-center gap-8 mb-8">
                    <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-yellow-500/60"></div>
                    <span className="text-[12px] font-black uppercase tracking-[0.8em] text-yellow-500 animate-glitter">Excellence Hub</span>
                    <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-yellow-500/60"></div>
                  </div>
                  <h2 className="text-9xl font-black gold-text shimmer-text leading-none mb-6 italic tracking-tighter transition-transform group-hover:scale-110 duration-700 select-none">2026</h2>
                  <h3 className="text-2xl font-brand italic text-slate-300 tracking-[0.4em] mb-8 select-none uppercase">Future Grid Library</h3>
                  <div className="px-10 py-4 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                     <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Direct academic resource synchronization active.</p>
                  </div>
               </div>
            </div>

            {/* HORIZONTAL FROZEN OPTIONS */}
            <div className="flex gap-8 overflow-x-auto no-scrollbar px-2 py-8 scroll-smooth">
              <FrozenOption 
                icon="fa-brain-circuit" 
                label="AI Suggestions" 
                colorClass="frozen-blue" 
                onClick={() => handleNav('AI_SUGGEST')} 
              />
              <FrozenOption 
                icon="fa-book-open-reader" 
                label="Book Preview" 
                colorClass="frozen-purple" 
                onClick={() => handleNav('BOOK_PREVIEW')} 
              />
              <FrozenOption 
                icon="fa-scroll" 
                label="E-book Resources" 
                colorClass="frozen-emerald" 
                onClick={() => handleNav('E_BOOKS')} 
              />
              <FrozenOption 
                icon="fa-users-rays" 
                label="Community Hub" 
                colorClass="frozen-pink" 
                onClick={() => handleNav('CAMPUS_HUB')} 
              />
            </div>

            <div className="grid grid-cols-2 gap-8 pb-32">
              {books.filter(b => !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase())).map((book, idx) => (
                <BookCard key={book.id} index={idx} book={book} onRequest={() => showNotification("Secure Request Posted!", "success")} />
              ))}
            </div>
            
            <button 
              onClick={() => handleNav('AI_SUGGEST')}
              className="fixed bottom-32 right-8 z-[130] w-20 h-20 bg-slate-950 text-white rounded-[2.5rem] flex flex-col items-center justify-center shadow-[0_30px_60px_-15px_rgba(191,149,63,0.6)] animate-float border-2 border-yellow-500/30 group active:scale-90 transition-all click-satisfying"
            >
              <i className="fas fa-brain text-3xl mb-1 text-yellow-500 group-hover:rotate-12 transition-transform"></i>
              <span className="text-[9px] font-black uppercase tracking-tighter gold-text">AI CORE</span>
            </button>
          </ViewContainer>
        );

      case 'MY_LISTINGS':
        return (
          <ViewContainer>
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">Sell Books</h2>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Post to the 2026 Grid</p>
                </div>
                <button onClick={() => handleNav('ADD_BOOK')} className="px-10 py-5 bg-yellow-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-yellow-700 click-satisfying">Post Listing</button>
             </div>
             <div className="grid grid-cols-2 gap-8">
                {books.filter(b => b.donorId === user.id).map((book, idx) => (
                    <BookCard key={book.id} index={idx} book={book} onRequest={() => {}} />
                ))}
             </div>
          </ViewContainer>
        );

      case 'PROFILE':
        return (
          <ViewContainer>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Excellence Profile</h2>
            <div className="premium-card rounded-[4rem] p-12 text-center border-2 border-yellow-500/10 shadow-2xl animate-zoom-fade">
                <div className="relative inline-block mb-10 group">
                   <div className="w-32 h-32 bg-yellow-500/10 rounded-[3rem] flex items-center justify-center border-2 border-yellow-500/20 text-yellow-600 font-black text-6xl shadow-2xl animate-float group-hover:rotate-6 transition-transform">
                       {user.name.charAt(0)}
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-950 text-yellow-500 rounded-2xl flex items-center justify-center border border-yellow-500/40 animate-pulse">
                      <i className="fas fa-crown text-sm"></i>
                   </div>
                </div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">{user.name}</h3>
                <div className="inline-block px-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-12">
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[11px]">{user.college} Scholar • 2026 Batch</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-inner group">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Excellence Coins</span>
                        <div className="flex items-center justify-center gap-4">
                            <i className="fas fa-coins text-yellow-500 text-3xl"></i>
                            <span className="text-5xl font-black gold-text tracking-tighter">{user.campusCoins}</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-inner group">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Institutional Rank</span>
                        <div className="flex items-center justify-center gap-4">
                            <i className="fas fa-trophy text-yellow-500 text-3xl"></i>
                            <span className="text-5xl font-black gold-text tracking-tighter">#{user.donationScore}</span>
                        </div>
                    </div>
                </div>
            </div>
          </ViewContainer>
        );

      case 'ADD_BOOK':
        return (
          <AddBookForm user={user} onAdd={(bookData) => {
              const newBook: Book = { ...bookData, id: `book_${Date.now()}` } as Book;
              setBooks(prev => [newBook, ...prev]);
              handleNav('MY_LISTINGS');
              showNotification("Excellence Listing Posted!", "success");
              playSuccess();
            }} onCancel={() => handleNav('MY_LISTINGS')} />
        );

      case 'MY_REQUESTS':
        return (
          <ViewContainer>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">My Claims</h2>
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
               <i className="fas fa-bolt-lightning text-yellow-600 text-4xl mb-6 opacity-40"></i>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">No active grid claims recorded yet.</p>
            </div>
          </ViewContainer>
        );

      default:
        return <div className="py-20 text-center gold-text text-xl font-black uppercase tracking-widest animate-pulse">Entering 2026 Grid...</div>;
    }
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden transition-all duration-1000">
        {/* Layered Satisfying Boot Sequence */}
        <div className="perspective-lg mb-12">
           <div className="w-56 h-72 bg-slate-900 rounded-[3rem] border-4 border-yellow-500/30 flex items-center justify-center shadow-[0_0_100px_rgba(191,149,63,0.3)] animate-book-flip relative preserve-3d">
              <i className="fas fa-book-sparkles text-yellow-500 text-9xl absolute backface-hidden"></i>
              <div className="absolute inset-0 bg-yellow-500/5 rounded-[2.8rem] animate-pulse-slow"></div>
           </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-9xl font-black gold-text shimmer-text italic tracking-tighter select-none animate-reveal-word">
            2026
          </h2>
          <div className="relative h-1 w-64 bg-slate-900 rounded-full mx-auto overflow-hidden">
             <div className="absolute top-0 left-0 h-full bg-yellow-600 animate-progress-fill"></div>
          </div>
          <h3 className="text-xl font-brand italic text-slate-400 tracking-[0.5em] uppercase animate-reveal-word opacity-0 [animation-delay:400ms]">
            Campus Shelf
          </h3>
        </div>

        {/* Ambient background particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-float opacity-40"></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-yellow-500 rounded-full animate-float opacity-20 [animation-delay:1s]"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-500 rounded-full animate-float opacity-30 [animation-delay:1.5s]"></div>
      </div>
    );
  }

  return (
    <Layout 
      activeView={activeView} activeSegment={activeSegment}
      onViewChange={setActiveView} onSegmentChange={handleSegmentChange}
      userDonationScore={user.donationScore} darkMode={darkMode}
      onToggleDarkMode={() => { playPop(); setDarkMode(!darkMode); }}
      searchQuery={searchQuery} onSearchChange={setSearchQuery}
      searchSuggestions={searchSuggestions}
    >
      <NotificationBar message={notification?.message || null} onClose={() => setNotification(null)} type={notification?.type} />
      {renderView()}
    </Layout>
  );
};

// --- Subcomponents ---

const FeatureHeader: React.FC<{ title: string, onBack: () => void, icon: string }> = ({ title, onBack, icon }) => (
  <div className="flex items-center gap-6 mb-6 animate-in slide-in-from-left-8 duration-700">
    <button onClick={onBack} className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-md hover:scale-110 active:scale-90 transition-all click-satisfying"><i className="fas fa-chevron-left text-xl"></i></button>
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center shadow-inner">
        <i className={`fas ${icon} text-yellow-600 text-3xl animate-float`}></i>
      </div>
      <h2 className="text-4xl font-black gold-text uppercase tracking-tight">{title}</h2>
    </div>
  </div>
);

const FeatureInput: React.FC<{ label: string, placeholder: string, value: string, onChange: (v: string) => void }> = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-3">
    <label className="block text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] ml-3">{label}</label>
    <input 
      type="text"
      placeholder={placeholder}
      className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-yellow-500/40 rounded-[2rem] text-sm font-black text-slate-900 dark:text-white focus:outline-none transition-all uppercase placeholder:text-slate-300 shadow-inner"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const FeatureResult: React.FC<{ result: string, loading: boolean }> = ({ result, loading }) => {
  if (loading) return (
    <div className="p-20 text-center animate-pulse flex flex-col items-center">
      <div className="w-24 h-24 bg-yellow-500/10 rounded-[3rem] flex items-center justify-center mb-8 border border-yellow-500/20">
        <i className="fas fa-atom text-5xl text-yellow-600 animate-spin-slow"></i>
      </div>
      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500">Querying Academic Grid...</p>
    </div>
  );
  if (!result) return null;
  return (
    <div className="p-12 bg-slate-900 text-white rounded-[4rem] border-4 border-yellow-500/20 animate-in zoom-in-95 duration-500 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-[100px] group-hover:bg-yellow-500/10 transition-colors"></div>
      <div className="flex items-center gap-5 mb-10">
        <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center shadow-xl rotate-3"><i className="fas fa-sparkles text-white text-xl"></i></div>
        <span className="text-[12px] font-black uppercase tracking-[0.4em] text-yellow-500">Data Synchronization Complete</span>
      </div>
      <div className="text-xl font-bold text-slate-200 leading-relaxed whitespace-pre-wrap uppercase tracking-tight font-brand italic">
        {result}
      </div>
    </div>
  );
};

const FrozenOption: React.FC<{ icon: string, label: string, colorClass: string, onClick: () => void }> = ({ icon, label, colorClass, onClick }) => (
  <button 
    onClick={() => { playPop(); onClick(); }}
    className={`frozen-box ${colorClass} min-w-[160px] h-[160px] rounded-[3.5rem] flex flex-col items-center justify-center p-6 transition-all shrink-0 active:scale-95 group border-4 click-satisfying`}
  >
    <div className="absolute top-0 left-0 w-full h-2 bg-white/40 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
    <div className="w-18 h-18 bg-white/40 dark:bg-white/10 rounded-3xl flex items-center justify-center mb-5 group-hover:scale-125 transition-all shadow-2xl group-hover:rotate-12">
      <i className={`fas ${icon} text-3xl text-slate-900 dark:text-white`}></i>
    </div>
    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white text-center leading-tight">
      {label}
    </span>
  </button>
);

export default App;
