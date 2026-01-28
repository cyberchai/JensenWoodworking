'use client';

import { useState } from 'react';
import { Feedback } from '@/lib/mockStore';
import { store } from '@/lib/store';
import AdminAddFeedbackForm from './AdminAddFeedbackForm';

interface AdminTestimonialsProps {
  feedback: Feedback[];
  onUpdate: () => void;
}

export default function AdminTestimonials({ feedback, onUpdate }: AdminTestimonialsProps) {
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState('');

  const toggleTestimonial = async (id: string, currentValue: boolean) => {
    await store.updateFeedback(id, { isTestimonial: !currentValue });
    onUpdate();
  };

  const startEditingTitle = (item: Feedback) => {
    setEditingTitle(item.id);
    setTitleValue(item.title || '');
  };

  const saveTitle = async (id: string) => {
    await store.updateFeedback(id, { title: titleValue.trim() || undefined });
    setEditingTitle(null);
    setTitleValue('');
    onUpdate();
  };

  const cancelEditing = () => {
    setEditingTitle(null);
    setTitleValue('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-brass">Client Testimonials</h2>
      </div>
      
      <AdminAddFeedbackForm onFeedbackAdded={onUpdate} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {feedback.length === 0 ? (
          <div className="col-span-2 py-12 text-center border-2 border-dashed border-stone-200 rounded-sm bg-stone-50">
            <p className="text-stone-300 font-serif italic">No feedback submitted yet.</p>
          </div>
        ) : (
          feedback.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-8 border border-stone-200 shadow-sm relative italic font-serif text-stone-700"
            >
              {/* Title Section */}
              <div className="mb-4 not-italic">
                {editingTitle === item.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
                      placeholder="Enter testimonial title..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveTitle(item.id)}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-brass text-ebony hover:bg-ebony hover:text-white transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {item.title ? (
                        <div className="text-sm font-semibold text-ebony not-italic mb-1">{item.title}</div>
                      ) : (
                        <div className="text-xs text-stone-400 italic">No title set</div>
                      )}
                    </div>
                    <button
                      onClick={() => startEditingTitle(item)}
                      className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors ml-4"
                    >
                      {item.title ? 'Edit' : 'Add'} Title
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xl mb-8 leading-relaxed">"{item.comment}"</p>
              <div className="not-italic flex items-center justify-between border-t border-stone-200 pt-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-ebony">
                    {item.clientName || 'Anonymous'}
                  </div>
                </div>
                <button 
                  onClick={() => toggleTestimonial(item.id, item.isTestimonial)}
                  className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 border rounded-full transition-all ${
                    item.isTestimonial 
                      ? 'border-brass text-brass bg-brass/10 hover:bg-brass/20' 
                      : 'border-stone-200 text-stone-300 hover:border-stone-300 hover:text-stone-400'
                  }`}
                >
                  {item.isTestimonial ? 'Featured' : 'Hidden'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

