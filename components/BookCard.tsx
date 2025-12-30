
import React from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onRequest: (bookId: string) => void;
  isRequested?: boolean;
  index?: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, onRequest, isRequested, index = 0 }) => {
  const discountPercent = book.marketPrice && book.marketPrice > 0 
    ? Math.round(((book.marketPrice - (book.currentPrice || 0)) / book.marketPrice) * 100) 
    : 0;

  return (
    <div 
      style={{ animationDelay: `${index * 80}ms` }}
      className={`group relative bg-white dark:bg-slate-900 rounded-[2.8rem] border ${book.isUrgent ? 'border-yellow-500 ring-2 ring-yellow-500/10' : 'border-slate-100 dark:border-slate-800'} overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2 active:scale-95 flex flex-col animate-slide-up`}
    >
      {book.isUrgent && (
        <div className="absolute top-5 left-5 z-20 bg-yellow-600 text-white text-[9px] font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-widest animate-pulse">
          New Year Hot Deal
        </div>
      )}

      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={book.imageUrl} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
      </div>

      <div className="p-8 flex flex-col flex-1 relative">
        <div className="mb-6">
          <p className="text-[10px] font-black gold-text uppercase tracking-widest mb-2 truncate">{book.branch}</p>
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-yellow-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 italic">by {book.author}</p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">2026 Price</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black tracking-tighter price-text`}>
                  {book.currentPrice === 0 ? 'FREE' : `₹${book.currentPrice}`}
                </span>
                {discountPercent > 0 && (
                  <span className="text-[9px] font-black discount-badge px-2 py-0.5 rounded-lg">-{discountPercent}%</span>
                )}
              </div>
            </div>

            <button 
              onClick={() => onRequest(book.id)}
              disabled={isRequested}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                isRequested 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-950 text-white hover:bg-yellow-600'
              }`}
            >
              <i className={`fas ${isRequested ? 'fa-check' : 'fa-hand-sparkles'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
