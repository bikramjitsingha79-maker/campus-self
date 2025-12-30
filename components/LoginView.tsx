
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (email: string, college: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('MIT');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call and success animation
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Delay the actual login callback to show the success animation
      setTimeout(() => {
        onLogin(email, college);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-emerald-500 animate-[bounceIn_0.5s_ease-out_forwards]">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 dark:shadow-none animate-[scaleIn_0.3s_ease-out_forwards]">
              <i className="fas fa-check text-white text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Verified</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest mt-2">Entering Campus...</p>
          </div>
        )}

        <div className={`transition-all duration-700 ${isSuccess ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3 hover:rotate-0 transition-transform cursor-pointer group">
              <i className="fas fa-book-reader text-white text-4xl group-hover:scale-110 transition-transform"></i>
            </div>
            <h1 className="text-4xl tracking-tighter uppercase mb-2">
              <span className="font-black italic text-black dark:text-white">Campus</span>
              <span className="font-brand italic ml-1 text-pink-600 opacity-90">Shelf</span>
            </h1>
            <p className="text-black/60 dark:text-white/60 text-sm font-black uppercase tracking-widest">Re-circulating knowledge</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-2 border-slate-100 dark:border-slate-800 transition-all">
            <h2 className="text-2xl font-black text-black dark:text-white mb-8 uppercase tracking-tight">
              {isSignUp ? 'Join the Shelf' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Campus Email</label>
                <div className="relative group">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors"></i>
                  <input 
                    type="email" 
                    required
                    placeholder="student@university.edu"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-pink-500 rounded-2xl text-sm font-black text-black dark:text-white focus:outline-none transition-all placeholder:text-slate-400 uppercase shadow-inner"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors"></i>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-pink-500 rounded-2xl text-sm font-black text-black dark:text-white focus:outline-none transition-all placeholder:text-slate-400 shadow-inner"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">University</label>
                <div className="relative group">
                  <i className="fas fa-university absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors"></i>
                  <select 
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-pink-500 rounded-2xl text-sm font-black text-black dark:text-white focus:outline-none transition-all appearance-none cursor-pointer uppercase shadow-inner"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  >
                    <option value="MIT">MIT</option>
                    <option value="Stanford">Stanford</option>
                    <option value="Harvard">Harvard</option>
                    <option value="Delhi University">Delhi University</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 bg-pink-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-pink-700 active:scale-95 transition-all disabled:opacity-80 mt-4 flex items-center justify-center gap-3 overflow-hidden relative group`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="animate-pulse">Authorizing...</span>
                  </div>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Enter Campus'}</span>
                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </>
                )}
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </form>

            <div className="mt-10 text-center border-t border-slate-50 dark:border-slate-800 pt-8">
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[11px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest hover:underline transition-all"
              >
                {isSignUp ? 'Already a member? Log In' : 'New to Shelf? Join the community'}
              </button>
            </div>
          </div>
        </div>

        <div className={`mt-12 flex justify-center gap-6 transition-all duration-700 ${isSuccess ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
           <div className="flex items-center gap-2 group cursor-default">
             <i className="fas fa-shield-check text-pink-600 dark:text-white text-[10px] group-hover:scale-125 transition-transform"></i>
             <span className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Verified Students</span>
           </div>
           <div className="flex items-center gap-2 group cursor-default">
             <i className="fas fa-leaf text-pink-600 dark:text-white text-[10px] group-hover:scale-125 transition-transform"></i>
             <span className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Eco Friendly</span>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoginView;
