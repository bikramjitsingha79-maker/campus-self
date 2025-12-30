
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import BookCard from './components/BookCard';
import NotificationBar from './components/NotificationBar';
import AddBookForm from './components/AddBookForm';
import FeedbackForm from './components/FeedbackForm';
import { Book, BookRequest, ViewState, User, Language, Segment, UserRole } from './types';
import { MOCK_BOOKS, CURRENT_USER } from './constants';
import { getAIAssistantResponse, getSearchSuggestions } from './services/geminiService';
import { translations } from './translations';

const ViewContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-10 animate-slide-up duration-700">
    {children}
  </div>
);

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [activeSegment, setActiveSegment] = useState<Segment>('BUYER');
  const [activeView, setActiveView] = useState<ViewState>('EXPLORE');
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  
  // 2026 Excellence Special States
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [showExchangeModal, setShowExchangeModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [selectedBookForAction, setSelectedBookForAction] = useState<Book | null>(null);
  const [lastActionType, setLastActionType] = useState<'PURCHASE' | 'EXCHANGE' | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('darkMode') === 'true');
  const [language] = useState<Language>(() => (localStorage.getItem('language') as Language) || Language.ENGLISH);
  
  const t = useMemo(() => translations[language], [language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
      // Show welcome modal shortly after boot
      setTimeout(() => setShowWelcomeModal(true), 800);
    }, 2000);
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

  const handleBookRequest = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (requests.some(r => r.bookId === bookId)) {
      showNotification("You've already secured this treasure!", "warning");
      return;
    }

    setSelectedBookForAction(book);
    
    // Logic: If user has 10+ coins, give them the option to exchange.
    // Otherwise, direct to the 30% discount purchase flow.
    if (user.campusCoins >= 10) {
      setShowExchangeModal(true);
    } else {
      setShowDiscountModal(true);
    }
  };

  const confirmAction = (type: 'PURCHASE' | 'EXCHANGE') => {
    if (!selectedBookForAction) return;

    const newRequest: BookRequest = {
      id: `req_${Date.now()}`,
      bookId: selectedBookForAction.id,
      borrowerId: user.id,
      donorId: selectedBookForAction.donorId,
      status: 'PENDING',
      timestamp: new Date(),
    };

    setRequests(prev => [...prev, newRequest]);
    setLastActionType(type);

    if (type === 'EXCHANGE') {
      setUser(prev => ({ ...prev, campusCoins: prev.campusCoins - 10 }));
    } else {
      setUser(prev => ({ ...prev, campusCoins: prev.campusCoins + 5 }));
    }

    setShowDiscountModal(false);
    setShowExchangeModal(false);
    setShowSuccessModal(true);
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => setNotification({ message, type });

  const handleSegmentChange = (segment: Segment) => {
    setActiveSegment(segment);
    if (segment === 'SELLER') {
        setActiveView('MY_LISTINGS');
    } else {
        setActiveView('EXPLORE');
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'AI_ASSISTANT':
        return (
          <ViewContainer>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setActiveView('EXPLORE')} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm"><i className="fas fa-chevron-left"></i></button>
              <h2 className="text-2xl font-black gold-text uppercase tracking-tight">2026 AI Oracle</h2>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-yellow-500/10 shadow-2xl h-[70vh] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500/40 to-yellow-500/0"></div>
                <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-6">
                    <div className="text-center py-20">
                        <i className="fas fa-book-sparkles text-yellow-600 text-6xl mb-6 animate-float"></i>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">How can the Oracle assist?</h3>
                        <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold px-10">I can analyze book conditions, summarize chapters, or find rare editions.</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <input type="text" placeholder="Consult the 2026 library database..." className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-500/20" />
                    <button className="w-14 h-14 bg-yellow-600 text-white rounded-2xl shadow-xl flex items-center justify-center"><i className="fas fa-paper-plane"></i></button>
                </div>
            </div>
          </ViewContainer>
        );

      case 'EXPLORE':
        return (
          <ViewContainer>
            {/* 2026 EXCELLENCE HERO */}
            <div className="relative overflow-hidden bg-slate-950 rounded-[3.5rem] p-12 text-white shadow-2xl border border-yellow-500/20 group">
               <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/10 rounded-full -mr-36 -mt-36 blur-[100px] animate-pulse"></div>
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] w-12 bg-yellow-500/40"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500">Excellence Hub</span>
                    <div className="h-[1px] w-12 bg-yellow-500/40"></div>
                  </div>
                  <h2 className="text-8xl font-black gold-text shimmer-text leading-none mb-4 italic tracking-tighter transition-transform group-hover:scale-105 duration-700">2026</h2>
                  <h3 className="text-xl font-brand italic text-slate-300 tracking-[0.3em] mb-4">REDEFINING CAMPUS KNOWLEDGE</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 max-w-xs leading-relaxed">Exclusive 30% New Year discounts & direct coin exchanges now active.</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pb-32">
              {books.filter(b => !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase())).map((book, idx) => (
                <BookCard key={book.id} index={idx} book={book} onRequest={handleBookRequest} isRequested={requests.some(r => r.bookId === book.id)} />
              ))}
            </div>
            
            <button 
              onClick={() => setActiveView('AI_ASSISTANT')}
              className="fixed bottom-28 right-8 z-[130] w-20 h-20 bg-slate-950 text-white rounded-[2.5rem] flex flex-col items-center justify-center shadow-[0_20px_40px_rgba(191,149,63,0.3)] animate-float border-2 border-yellow-500/30 group active:scale-90 transition-all"
            >
              <i className="fas fa-book-sparkles text-3xl mb-1 text-yellow-500 group-hover:rotate-12 transition-transform"></i>
              <span className="text-[9px] font-black uppercase tracking-tighter gold-text">2026 AI</span>
            </button>
          </ViewContainer>
        );

      case 'MY_LISTINGS':
        return (
          <ViewContainer>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Your 2026 Shelf</h2>
                <button onClick={() => setActiveView('ADD_BOOK')} className="px-6 py-3 bg-yellow-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">List New Book</button>
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
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">2026 Achievement</h2>
            <div className="premium-card rounded-[3rem] p-10 text-center border-2 border-yellow-500/10">
                <div className="w-24 h-24 bg-yellow-500/10 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 border-2 border-yellow-500/20 text-yellow-600 font-black text-4xl shadow-xl animate-float">
                    {user.name.charAt(0)}
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h3>
                <div className="inline-block px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{user.college} Excellence Member</p>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner group">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Campus Coins</span>
                        <div className="flex items-center justify-center gap-2">
                            <i className="fas fa-coins text-yellow-500 group-hover:animate-bounce"></i>
                            <span className="text-4xl font-black gold-text">{user.campusCoins}</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner group">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Shelf Score</span>
                        <div className="flex items-center justify-center gap-2">
                            <i className="fas fa-trophy text-yellow-500 group-hover:animate-bounce"></i>
                            <span className="text-4xl font-black gold-text">{user.donationScore}</span>
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
              setActiveView('MY_LISTINGS');
              showNotification("Excellence Listing Posted! 📚", "success");
            }} onCancel={() => setActiveView('MY_LISTINGS')} />
        );

      case 'MY_REQUESTS':
        return (
          <ViewContainer>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Claims</h2>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Your quest for knowledge starts here.</p>
                </div>
              ) : (
                requests.map(req => {
                  const book = books.find(b => b.id === req.bookId);
                  return (
                    <div key={req.id} className="premium-card p-6 rounded-[2rem] flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-yellow-600 shadow-inner group-hover:scale-110 transition-transform">
                          <i className="fas fa-book-open"></i>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white uppercase truncate max-w-[180px]">{book?.title}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.status} • {req.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-slate-300"></i>
                    </div>
                  );
                })
              )}
            </div>
          </ViewContainer>
        );

      default:
        return <div className="py-20 text-center gold-text text-xl font-black uppercase tracking-widest">Entering Excellence...</div>;
    }
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="relative w-40 h-40 bg-slate-900 rounded-[3.5rem] flex items-center justify-center mb-10 shadow-[0_0_100px_rgba(191,149,63,0.3)] animate-float border-2 border-yellow-500/20">
          <i className="fas fa-book-atlas text-yellow-500 text-7xl"></i>
          <div className="absolute -inset-6 border border-yellow-500/10 rounded-[4.5rem] animate-spin-slow"></div>
        </div>
        <h2 className="text-8xl font-black gold-text shimmer-text italic mb-2 tracking-tighter">2026</h2>
        <h3 className="text-xl font-brand italic text-slate-400 tracking-[0.5em] uppercase">The Excellence Shelf</h3>
      </div>
    );
  }

  return (
    <Layout 
      activeView={activeView} activeSegment={activeSegment}
      onViewChange={setActiveView} onSegmentChange={handleSegmentChange}
      userDonationScore={user.donationScore} darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode(!darkMode)}
      searchQuery={searchQuery} onSearchChange={setSearchQuery}
      searchSuggestions={searchSuggestions}
    >
      <NotificationBar message={notification?.message || null} type={notification?.type} theme="yellow" onClose={() => setNotification(null)} />
      {renderView()}

      {/* 2026 WELCOME MODAL */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] p-10 border-4 border-yellow-500/30 shadow-[0_0_100px_rgba(191,149,63,0.4)] relative overflow-hidden animate-in zoom-in-90 duration-700">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
              <div className="text-center relative z-10">
                  <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-2 border-yellow-500/40 shadow-2xl">
                      <i className="fas fa-award text-yellow-500 text-5xl animate-float"></i>
                  </div>
                  <h2 className="text-3xl font-black gold-text uppercase mb-4 leading-tight tracking-tight">2026 Welcome</h2>
                  <div className="space-y-4 mb-10">
                    <div className="flex items-start gap-4 text-left p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-yellow-500/10">
                      <i className="fas fa-percentage text-yellow-600 mt-1"></i>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase leading-relaxed tracking-wide">Automatic <span className="text-yellow-600">30% Discount</span> on your first 2026 acquisition.</p>
                    </div>
                    <div className="flex items-start gap-4 text-left p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-yellow-500/10">
                      <i className="fas fa-repeat text-yellow-600 mt-1"></i>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase leading-relaxed tracking-wide">Direct <span className="text-yellow-600">Coin Exchange</span> for books is now live.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowWelcomeModal(false)} className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-yellow-600 active:scale-95 transition-all">Enter 2026</button>
              </div>
          </div>
        </div>
      )}

      {/* 2026 DISCOUNT MODAL */}
      {showDiscountModal && selectedBookForAction && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 border-4 border-yellow-500/30 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
                  <div className="text-center">
                      <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-yellow-500/20 shadow-inner">
                          <i className="fas fa-bolt-lightning text-yellow-600 text-4xl"></i>
                      </div>
                      <h3 className="text-2xl font-black gold-text uppercase mb-2 leading-tight">30%+ Excellence Discount!</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                          Your 2026 status has unlocked a significant saving on <span className="text-yellow-600 font-black">{selectedBookForAction.title}</span>.
                      </p>
                      <div className="mt-8 space-y-3">
                          <button onClick={() => confirmAction('PURCHASE')} className="w-full py-5 bg-yellow-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-yellow-700 active:scale-95 transition-all">Claim 30% Deal</button>
                          <button onClick={() => setShowDiscountModal(false)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest active:scale-95">Browse More</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 2026 EXCHANGE MODAL */}
      {showExchangeModal && selectedBookForAction && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 border-4 border-yellow-500/30 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full -ml-16 -mt-16 animate-pulse"></div>
                  <div className="text-center">
                      <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-yellow-500/20">
                          <i className="fas fa-coins text-yellow-600 text-4xl"></i>
                      </div>
                      <h3 className="text-2xl font-black gold-text uppercase mb-2">2026 Exchange</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                          Use <span className="text-yellow-600">10 Coins</span> to skip payment and acquire <span className="text-yellow-600">{selectedBookForAction.title}</span> for free.
                      </p>
                      <div className="mt-8 space-y-3">
                          <button onClick={() => confirmAction('EXCHANGE')} className="w-full py-5 bg-yellow-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-yellow-700 active:scale-95 transition-all">Exchange Now</button>
                          <button onClick={() => confirmAction('PURCHASE')} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Pay with Discount</button>
                          <button onClick={() => setShowExchangeModal(false)} className="w-full py-2 text-slate-400 font-black uppercase text-[10px] tracking-widest">Not Now</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* TRANSACTION SUCCESS MODAL - THE CONCLUSION */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[4rem] p-12 text-center border-4 border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-20 duration-700">
            <div className="w-28 h-28 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 animate-float">
              <i className="fas fa-check-double text-white text-5xl"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Quest Completed!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em] leading-relaxed mb-10 px-4">
              Your 2026 acquisition of <span className="text-emerald-500">"{selectedBookForAction?.title}"</span> has been finalized. 
              {lastActionType === 'EXCHANGE' ? ' Coin transfer successful.' : ' Discount applied to your final invoice.'}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setShowSuccessModal(false); setActiveView('MY_REQUESTS'); }} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">Track My Claim</button>
              <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Back to Library</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const QuickOption: React.FC<{ icon: string; label: string; color: string; onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="min-w-[140px] h-[140px] flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 border border-yellow-500/10 rounded-[2.8rem] shadow-xl transition-all hover:scale-105 active:scale-95 group shrink-0 relative overflow-hidden">
    <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner ${color} transition-all group-hover:scale-110`}>
      <i className={`fas ${icon} text-2xl`}></i>
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center px-2">{label}</span>
  </button>
);

export default App;
