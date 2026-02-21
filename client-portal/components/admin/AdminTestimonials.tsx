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
    <div className="space-y-3 min-w-0">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Client Testimonials</h2>
          <span className="text-[10px] text-stone-400">{feedback.length}</span>
        </div>
        <AdminAddFeedbackForm onFeedbackAdded={onUpdate} />
      </div>

      {feedback.length === 0 ? (
        <div className="py-6 text-center min-w-0">
          <p className="text-stone-300 font-serif italic text-sm">No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-1.5 min-w-0">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="bg-stone-50 rounded-sm overflow-hidden min-w-0"
            >
              {editingTestimonial === item.id ? (
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass"
                      placeholder="Client name"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={titleValue || item.title || ''}
                      onChange={(e) => { setEditingTitle(item.id); setTitleValue(e.target.value); }}
                      className="w-full px-3 py-1.5 text-sm border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass"
                      placeholder="Testimonial title (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Message</label>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-1.5 text-sm border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass resize-y"
                      placeholder="Testimonial message..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (editingTitle === item.id && titleValue !== (item.title || '')) {
                          await saveTitle(item.id);
                        }
                        await saveTestimonial(item.id);
                      }}
                      className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-brass text-white hover:bg-ebony transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { cancelEditingTestimonial(); cancelEditing(); }}
                      className="text-[9px] font-black uppercase tracking-widest px-3 py-1 text-stone-400 hover:text-ebony transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-ebony">{item.clientName || 'Anonymous'}</span>
                      {item.title && (
                        <>
                          <span className="text-stone-300">·</span>
                          <span className="text-[10px] text-stone-500 truncate">{item.title}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 font-serif italic leading-relaxed line-clamp-2">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      onClick={() => {
                        startEditingTestimonial(item);
                        setEditingTitle(item.id);
                        setTitleValue(item.title || '');
                      }}
                      className="text-[8px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleTestimonial(item.id, item.isTestimonial)}
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full transition-all ${
                        item.isTestimonial
                          ? 'bg-brass/15 text-brass'
                          : 'bg-stone-200/60 text-stone-400'
                      }`}
                    >
                      {item.isTestimonial ? 'Shown' : 'Hidden'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
