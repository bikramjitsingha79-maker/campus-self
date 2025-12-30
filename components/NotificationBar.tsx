
import React, { useEffect } from 'react';

interface NotificationBarProps {
  message: string | null;
  onClose: () => void;
  type?: 'success' | 'info' | 'warning';
  theme?: string;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ message, onClose, type = 'success', theme = 'pink' }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgClass = type === 'success' 
    ? 'bg-emerald-600 shadow-emerald-200 dark:shadow-none' 
    : type === 'warning' 
    ? 'bg-orange-500 shadow-orange-200 dark:shadow-none' 
    : `bg-${theme}-600 shadow-${theme}-200 dark:shadow-none`;

  const iconClass = type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

  return (
    <div className={`fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top-12 fade-in duration-500 ease-out fill-mode-both`}>
      <div className={`${bgClass} text-white px-5 py-4 rounded-3xl flex items-center justify-between shadow-2xl ring-4 ring-white/10 backdrop-blur-sm`}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <i className={`fas ${iconClass} text-lg`}></i>
          </div>
          <p className="text-sm font-black leading-tight uppercase tracking-tight">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors active:scale-90"
          aria-label="Dismiss notification"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default NotificationBar;
