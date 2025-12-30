
import React, { useState } from 'react';
import { User } from '../types';

interface FeedbackFormProps {
  user: User;
  onSubmit: (feedback: { category: string; message: string; targetUniversity?: string }) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ user, onSubmit }) => {
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [targetUniversity, setTargetUniversity] = useState(user.college);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSubmit({ 
      category, 
      message, 
      targetUniversity: category === 'Campus Specific' ? targetUniversity : undefined 
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-[2.8rem] p-10 text-center border border-slate-100 dark:border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 animate-float shadow-xl shadow-emerald-100/50">
          <i className="fas fa-check-circle text-4xl"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Sent Successfully!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-10 leading-relaxed uppercase font-black tracking-widest">Thank you for helping us grow, {user.name.split(' ')[0]}.</p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="w-full py-5 bg-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-pink-700 active:scale-95 transition-all"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
      <div className="bg-gradient-to-br from-pink-600 to-pink-800 dark:from-pink-900 dark:to-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 animate-pulse"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Campus Voice</h2>
          <p className="text-pink-100/80 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Tell us how to make your campus library even better.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-[2.8rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-widest ml-1">Select Category</label>
          <div className="grid grid-cols-3 gap-3">
            {['Suggestion', 'Specific', 'Praise'].map((cat, idx) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border animate-in slide-in-from-bottom-4 duration-500 fill-mode-both ${
                  category === cat 
                    ? 'bg-pink-600 border-pink-600 text-white shadow-xl scale-[1.05] z-10' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
          <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-widest ml-1">Your Message</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all resize-none shadow-inner dark:text-white uppercase placeholder:text-slate-300"
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim()}
          className="w-full py-5 bg-pink-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-pink-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none animate-in fade-in duration-700 delay-500 fill-mode-both"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
