
import React, { useState, useRef } from 'react';
import { Book, BookCondition, User } from '../types';

interface AddBookFormProps {
  user: User;
  onAdd: (book: Omit<Book, 'id'>) => void;
  onCancel: () => void;
}

const AddBookForm: React.FC<AddBookFormProps> = ({ user, onAdd, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    branch: '',
    condition: BookCondition.GOOD,
    location: '',
    pickupDate: '',
    pickupTime: '',
    isUrgent: false,
    marketPrice: 0,
    currentPrice: 0,
    contactNumber: user.phoneNumber || '',
    altContactNumber: user.altPhoneNumber || ''
  });

  // A high-quality generic blank book placeholder instead of random picsum generation
  const BLANK_BOOK_PLACEHOLDER = "https://images.unsplash.com/photo-1543004629-ff569f872783?q=80&w=400&h=300&auto=format&fit=crop";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.branch || !formData.location) {
      alert("Please fill in all required fields.");
      return;
    }

    onAdd({
      ...formData,
      donorId: user.id,
      college: user.college,
      isInstitutionDonated: false,
      // Use uploaded image or the standard blank book placeholder
      imageUrl: imagePreview || BLANK_BOOK_PLACEHOLDER
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 p-8 animate-in fade-in zoom-in-95 duration-700 fill-mode-both max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">List Your Book</h2>
        <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-all">
          <i className="fas fa-times text-lg"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1 tracking-widest">Book Cover Photo</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-[16/9] w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 ${
              imagePreview ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/10 shadow-inner' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover animate-in fade-in duration-500" />
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                  <i className="fas fa-camera text-2xl"></i>
                </div>
                <p className="text-xs font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Upload or use default blank cover</p>
              </>
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="space-y-5">
          <div className="animate-in slide-in-from-bottom-4 duration-500 stagger-1 fill-mode-both">
            <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Book Title *</label>
            <input 
              type="text" required
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-black dark:text-white focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all uppercase placeholder:text-slate-300 shadow-inner"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500 stagger-2 fill-mode-both">
             <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Branch / Subject</label>
              <input 
                type="text" required
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-black dark:text-white focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all uppercase placeholder:text-slate-300 shadow-inner"
                value={formData.branch}
                onChange={e => setFormData({...formData, branch: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Condition</label>
              <select 
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-black dark:text-white focus:outline-none focus:ring-4 focus:ring-pink-500/10 appearance-none cursor-pointer uppercase shadow-inner"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value as BookCondition})}
              >
                {Object.values(BookCondition).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-6 flex gap-4 animate-in slide-in-from-bottom-4 duration-500 stagger-3 fill-mode-both">
            <button type="button" onClick={onCancel} className="flex-1 py-5 px-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95">Cancel</button>
            <button type="submit" className="flex-[2] py-5 px-4 bg-pink-600 text-white rounded-2xl text-xs font-black shadow-xl hover:bg-pink-700 hover:shadow-pink-200 dark:hover:shadow-none active:scale-95 transition-all uppercase tracking-[0.2em]">Post Listing</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;
