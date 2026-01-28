'use client';

import { Feedback } from '@/lib/mockStore';
import { store } from '@/lib/store';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useState } from 'react';

interface AdminAllFeedbackProps {
  feedback: Feedback[];
  onUpdate: () => void;
}

export default function AdminAllFeedback({ feedback, onUpdate }: AdminAllFeedbackProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; clientName?: string } | null>(null);

  const toggleTestimonial = async (id: string, currentValue: boolean) => {
    await store.updateFeedback(id, { isTestimonial: !currentValue });
    onUpdate();
  };

  const deleteFeedback = async () => {
    if (deleteConfirm) {
      await store.deleteFeedback(deleteConfirm.id);
      setDeleteConfirm(null);
      onUpdate();
    }
  };

  return (
    <div className="bg-white border border-stone-200 p-6 space-y-6 shadow-sm rounded-sm">
      <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-brass">All Feedback</h2>
      
      {feedback.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-sm bg-stone-50">
          <p className="text-stone-300 font-serif italic">No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="border border-stone-200 p-4 space-y-3 relative bg-stone-50 rounded-sm shadow-sm">
              {/* Delete button in top right corner */}
              <button
                onClick={() => setDeleteConfirm({ id: item.id, clientName: item.clientName })}
                className="absolute top-4 right-4 text-stone-300 hover:text-red-600 transition-colors text-xs"
                title="Delete feedback"
              >
                ×
              </button>

              <div className="flex items-start justify-between pr-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span
                          key={num}
                          className={`text-sm ${
                            num <= item.rating ? 'text-site-gold' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {item.clientName && (
                      <span className="text-sm font-normal text-site-gray">
                        {item.clientName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-site-gray-light leading-relaxed mb-2">
                    "{item.comment}"
                  </p>
                  <div className="flex items-center gap-4 text-xs text-site-gray-light">
                    <span>Project: {item.projectName}</span>
                    {item.allowTestimonial && (
                      <span className="text-site-gold">✓ OK to use as testimonial</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Featured/Hidden toggle */}
              <div className="flex items-center justify-end pt-2 border-t border-stone-200">
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
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteFeedback}
        title="Delete Feedback"
        message={`Are you sure you want to delete this feedback${deleteConfirm?.clientName ? ` from ${deleteConfirm.clientName}` : ''}? This action cannot be undone.`}
      />
    </div>
  );
}

