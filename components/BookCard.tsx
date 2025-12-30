
import React from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onRequest: (bookId: string) => void;
  isRequested?: boolean;
  index?: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, onRequest, isRequested, index = 0 }) => {
  const getActionIcon = () => {
    if (isRequested) return 'fa-check';
    return 'fa-paper-plane';
  };

  const marketPrice = book.marketPrice || 0;
  const currentPrice = book.currentPrice || 0;
  const discountPercent = marketPrice > 0 
    ? Math.round(((marketPrice - currentPrice) / marketPrice) * 100) 
    : 0;

  // Stagger animation based on index
  const staggerDelay = Math.min(index * 50, 400);

  return (
    <div 
      style={{ animationDelay: `${staggerDelay}ms` }}
      className={`group relative bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] shadow-sm border-2 ${book.isUrgent ? 'border-pink-400 ring-2 ring-pink-50 dark:ring-pink-900/20' : 'border-white/20 dark:border-slate-800/50'} overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2 active:scale-[0.96] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both frozen-container frozen-shimmer-overlay`}
    >
      {book.isUrgent && (
        <div className="absolute top-4 left-4 z-20 bg-pink-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest animate-float">
          Urgent
        </div>
      )}

      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100/50 dark:bg-slate-900/50">
        <img 
          src={book.imageUrl} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {book.isInstitutionDonated && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-pink-600 p-2 rounded-2xl shadow-xl transform transition-transform group-hover:rotate-12 border border-white/20 z-20">
            <i className="fas fa-university text-xs"></i>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 z-20 relative">
        <div className="mb-3">
          <p className="text-[9px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-[0.2em] mb-1 truncate">{book.branch}</p>
          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-pink-600 transition-colors">
            {book.title}
          </h3>
        </div>

        <div className="mt-auto">
          {/* Beautiful Price Display Section */}
          <div className="flex items-center justify-between gap-2 bg-white/30 dark:bg-slate-900/50 p-3 rounded-3xl border border-white/20 shadow-inner group-hover:bg-white/60 dark:group-hover:bg-slate-800 transition-colors backdrop-blur-sm relative overflow-hidden">
            <div className="flex flex-col relative z-20">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Campus Price</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black tracking-tighter ${currentPrice === 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                  {currentPrice === 0 ? 'FREE' : `₹${currentPrice}`}
                </span>
                {discountPercent > 0 && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-rose-500 line-through opacity-50 leading-none">₹{marketPrice}</span>
                    <span className="text-[8px] font-black text-emerald-500 leading-none">-{discountPercent}%</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => onRequest(book.id)}
              disabled={isRequested}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xl transform active:scale-90 relative z-20 ${
                isRequested 
                  ? 'bg-emerald-500 text-white cursor-default scale-110' 
                  : 'bg-pink-600 hover:bg-slate-900 text-white shadow-pink-200 dark:shadow-none'
              }`}
            >
              <i className={`fas ${getActionIcon()} text-base ${isRequested ? 'animate-in zoom-in duration-300' : ''}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
