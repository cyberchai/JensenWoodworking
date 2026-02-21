'use client';

import { Feedback } from '@/lib/mockStore';
import { store } from '@/lib/store';

interface AdminFeedbackListProps {
  feedback: Feedback[];
  onUpdate: () => void;
}

export default function AdminFeedbackList({ feedback, onUpdate }: AdminFeedbackListProps) {
  const toggleTestimonial = (id: string, currentValue: boolean) => {
    store.updateFeedback(id, { isTestimonial: !currentValue });
    onUpdate();
  };

  const deleteFeedback = (id: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      store.deleteFeedback(id);
      onUpdate();
    }
  };

  const testimonials = feedback.filter(f => f.isTestimonial);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Testimonials</h2>
          <span className="text-[10px] text-stone-400">{testimonials.length}</span>
        </div>

        {testimonials.length === 0 ? (
          <p className="text-stone-400 text-xs py-4">No testimonials currently displayed.</p>
        ) : (
          <div className="space-y-1 min-w-0">
            {testimonials.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-sm group min-w-0">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-ebony">{item.clientName || 'Anonymous'}</span>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mt-0.5">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <button
                    onClick={() => toggleTestimonial(item.id, true)}
                    className="text-[8px] font-black uppercase tracking-wider text-stone-400 hover:text-ebony transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => deleteFeedback(item.id)}
                    className="text-[8px] font-black uppercase tracking-wider text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-stone-100 pt-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">All Feedback</h2>
          <span className="text-[10px] text-stone-400">{feedback.length}</span>
        </div>

        {feedback.length === 0 ? (
          <p className="text-stone-400 text-xs py-4">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-1 min-w-0">
            {feedback.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-sm group min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-ebony">{item.clientName || 'Anonymous'}</span>
                    {item.isTestimonial && (
                      <span className="text-[8px] font-black uppercase tracking-wider text-brass bg-brass/10 px-1.5 py-0.5 rounded-full">Shown</span>
                    )}
                    {item.allowTestimonial && !item.isTestimonial && (
                      <span className="text-[8px] text-brass">OK to feature</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  {!item.isTestimonial && item.allowTestimonial && (
                    <button
                      onClick={() => toggleTestimonial(item.id, false)}
                      className="text-[8px] font-black uppercase tracking-wider text-stone-400 hover:text-brass transition-colors"
                    >
                      Feature
                    </button>
                  )}
                  {item.isTestimonial && (
                    <button
                      onClick={() => toggleTestimonial(item.id, true)}
                      className="text-[8px] font-black uppercase tracking-wider text-stone-400 hover:text-ebony transition-colors"
                    >
                      Hide
                    </button>
                  )}
                  <button
                    onClick={() => deleteFeedback(item.id)}
                    className="text-[8px] font-black uppercase tracking-wider text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
