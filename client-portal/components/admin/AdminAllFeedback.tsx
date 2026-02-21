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
    <div className="space-y-3 border-t border-stone-100 pt-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">All Feedback</h2>
        <span className="text-[10px] text-stone-400">{feedback.length}</span>
      </div>

      {feedback.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-stone-300 font-serif italic text-sm">No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-1 min-w-0">
          {feedback.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-sm group min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-ebony">{item.clientName || 'Anonymous'}</span>
                  {item.allowTestimonial && (
                    <span className="text-[8px] text-brass font-bold uppercase tracking-wider">OK to feature</span>
                  )}
                </div>
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
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
                <button
                  onClick={() => setDeleteConfirm({ id: item.id, clientName: item.clientName })}
                  className="text-[8px] font-black uppercase tracking-wider text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
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
