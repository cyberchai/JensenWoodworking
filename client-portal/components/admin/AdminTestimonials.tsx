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
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [editClientName, setEditClientName] = useState('');

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

  const startEditingTestimonial = (item: Feedback) => {
    setEditingTestimonial(item.id);
    setEditMessage(item.comment || '');
    setEditClientName(item.clientName || '');
  };

  const saveTestimonial = async (id: string) => {
    await store.updateFeedback(id, {
      comment: editMessage.trim(),
      clientName: editClientName.trim() || undefined,
    });
    setEditingTestimonial(null);
    setEditMessage('');
    setEditClientName('');
    onUpdate();
  };

  const cancelEditingTestimonial = () => {
    setEditingTestimonial(null);
    setEditMessage('');
    setEditClientName('');
  };

  const cancelEditing = () => {
    setEditingTitle(null);
    setTitleValue('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 min-w-0">
      <div className="flex items-center justify-between min-w-0">
        <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-brass">Client Testimonials</h2>
      </div>
      
      <AdminAddFeedbackForm onFeedbackAdded={onUpdate} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 min-w-0">
        {feedback.length === 0 ? (
          <div className="col-span-2 py-12 text-center border-2 border-dashed border-stone-200 rounded-sm bg-stone-50 min-w-0">
            <p className="text-stone-300 font-serif italic">No feedback submitted yet.</p>
          </div>
        ) : (
          feedback.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-6 sm:p-8 border border-stone-200 shadow-sm relative italic font-serif text-stone-700 min-w-0 overflow-hidden"
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

              {/* Message and client name: view or edit */}
              {editingTestimonial === item.id ? (
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">Message</label>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors not-italic"
                      placeholder="Testimonial message..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">Client name</label>
                    <input
                      type="text"
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors not-italic"
                      placeholder="Client name (e.g. Sarah & Michael T.)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveTestimonial(item.id)}
                      className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-brass text-ebony hover:bg-ebony hover:text-white transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditingTestimonial}
                      className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xl mb-8 leading-relaxed">"{item.comment}"</p>
                  <div className="not-italic flex items-center justify-between border-t border-stone-200 pt-6 flex-wrap gap-2">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-ebony">
                        {item.clientName || 'Anonymous'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditingTestimonial(item)}
                        className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors"
                        aria-label="Edit message and client name"
                      >
                        Edit
                      </button>
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
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

