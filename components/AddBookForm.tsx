
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
    area: '', 
    phoneNumber: user.phoneNumber || '', 
    contactNumber: user.phoneNumber || '', 
    altContactNumber: user.altPhoneNumber || '', 
    pickupDate: '',
    pickupTime: '',
    isUrgent: false,
    marketPrice: 0,
    currentPrice: 0,
  });

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
    if (
      !formData.title || 
      !formData.author || 
      !formData.branch || 
      !formData.area || 
      !formData.phoneNumber || 
      !formData.contactNumber ||
      !imagePreview
    ) {
      alert("Missing Requirements: Please provide a book picture, quality, area, and contact number.");
      return;
    }

    onAdd({
      ...formData,
      donorId: user.id,
      college: user.college,
      isInstitutionDonated: false,
      imageUrl: imagePreview || BLANK_BOOK_PLACEHOLDER
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border-4 border-yellow-500/10 p-12 animate-zoom-fade max-w-2xl mx-auto mb-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sell Your Book</h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">2026 Academic Listing Hub</p>
        </div>
        <button onClick={onCancel} className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-pink-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all click-satisfying">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Book Picture Requirement */}
        <div className="space-y-4">
          <label className="block text-[11px] font-black uppercase text-yellow-600 tracking-widest ml-2 animate-glitter">Step 1: Upload Book Picture *</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-[16/9] w-full rounded-[2.5rem] border-4 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 group ${
              imagePreview ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 shadow-2xl' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover animate-in fade-in duration-700" />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                   <i className="fas fa-sync text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-yellow-600 group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <i className="fas fa-camera-retro text-4xl"></i>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Select High-Quality Photo</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Show front cover and condition</p>
                </div>
              </>
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
          <FormInput 
             label="Book Title *" 
             placeholder="e.g. Quantum Physics" 
             value={formData.title} 
             onChange={v => setFormData({...formData, title: v})} 
          />
          <FormInput 
             label="Author *" 
             placeholder="e.g. Richard Feynman" 
             value={formData.author} 
             onChange={v => setFormData({...formData, author: v})} 
          />
        </div>

        {/* Quality/Condition Requirement */}
        <div className="space-y-4">
          <label className="block text-[11px] font-black uppercase text-yellow-600 tracking-widest ml-2">Step 2: Mention Book Quality *</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
             {Object.values(BookCondition).map(cond => (
               <button 
                  key={cond}
                  type="button"
                  onClick={() => setFormData({...formData, condition: cond})}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center justify-center gap-2 click-satisfying ${
                    formData.condition === cond 
                      ? 'bg-yellow-600 border-yellow-600 text-white shadow-xl scale-105 z-10' 
                      : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500'
                  }`}
               >
                  <i className={`fas ${cond === BookCondition.NEW ? 'fa-star' : cond === BookCondition.POOR ? 'fa-heart-crack' : 'fa-check-circle'} text-sm`}></i>
                  {cond}
               </button>
             ))}
          </div>
        </div>

        {/* Location/Area & Contact Requirement */}
        <div className="space-y-8 border-t border-slate-100 dark:border-slate-800 pt-10">
          <label className="block text-[11px] font-black uppercase text-yellow-600 tracking-widest ml-2">Step 3: Location & Contact *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <FormInput 
               label="Seller Area / Location *" 
               placeholder="e.g. North Hostel, Gate 2" 
               value={formData.area} 
               onChange={v => setFormData({...formData, area: v})} 
            />
            <FormInput 
               label="Primary Contact Number *" 
               placeholder="Enter your 10-digit mobile" 
               type="tel"
               value={formData.phoneNumber} 
               onChange={v => setFormData({...formData, phoneNumber: v, contactNumber: v})} 
            />
            <FormInput 
               label="Listing Price (₹) *" 
               placeholder="0 for Donation" 
               type="number"
               value={formData.currentPrice.toString()} 
               onChange={v => setFormData({...formData, currentPrice: parseInt(v) || 0})} 
            />
             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
               <input 
                 type="checkbox" 
                 id="isUrgent" 
                 className="w-6 h-6 rounded-lg border-2 border-yellow-500 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
                 checked={formData.isUrgent}
                 onChange={e => setFormData({...formData, isUrgent: e.target.checked})}
               />
               <label htmlFor="isUrgent" className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 cursor-pointer">Mark as Urgent (Faster Sync)</label>
             </div>
          </div>
        </div>

        <div className="pt-10 flex gap-6">
          <button type="button" onClick={onCancel} className="flex-1 py-6 bg-slate-100 dark:bg-slate-800 rounded-[2rem] text-xs font-black text-slate-500 uppercase tracking-widest active:scale-95 transition-all click-satisfying">Discard</button>
          <button type="submit" className="flex-[2] py-6 bg-yellow-600 text-white rounded-[2rem] text-xs font-black shadow-2xl hover:bg-yellow-700 active:scale-95 transition-all uppercase tracking-[0.3em] click-satisfying">Post to Academic Grid</button>
        </div>
      </form>
    </div>
  );
};

const FormInput: React.FC<{ label: string, placeholder: string, value: string, onChange: (v: string) => void, type?: string }> = ({ label, placeholder, value, onChange, type = 'text' }) => (
  <div className="space-y-3">
    <label className="block text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-3">{label}</label>
    <input 
      type={type}
      required
      placeholder={placeholder}
      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-yellow-500/40 rounded-[1.8rem] text-sm font-black text-slate-900 dark:text-white focus:outline-none transition-all uppercase placeholder:text-slate-300 shadow-inner"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default AddBookForm;
