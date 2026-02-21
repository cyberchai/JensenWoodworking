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
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Testimonials</h2>
          <span className="text-sm text-site-gray-light">
            {testimonials.length} {testimonials.length === 1 ? 'testimonial' : 'testimonials'} displayed
          </span>
        </div>
        
        {testimonials.length === 0 ? (
          <p className="text-site-gray-light text-sm">No testimonials currently displayed.</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((item) => (
              <div key={item.id} className="bg-stone-50 rounded-sm p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {item.clientName && (
                        <span className="text-sm font-normal text-site-gray">
                          {item.clientName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-site-gray-light leading-relaxed mb-2">
                      "{item.comment}"
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => toggleTestimonial(item.id, true)}
                    className="px-4 py-2 bg-site-gold text-black hover:bg-black hover:text-white transition-colors text-sm font-normal uppercase"
                  >
                    Remove from Testimonials
                  </button>
                  <button
                    onClick={() => deleteFeedback(item.id)}
                    className="px-4 py-2 bg-gray-200 text-site-gray hover:bg-red-100 hover:text-red-700 transition-colors text-sm font-normal uppercase"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-stone-100 pt-4">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">All Feedback</h2>
        
        {feedback.length === 0 ? (
          <p className="text-site-gray-light text-sm">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="bg-stone-50 rounded-sm p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {item.clientName && (
                        <span className="text-sm font-normal text-site-gray">
                          {item.clientName}
                        </span>
                      )}
                      {item.isTestimonial && (
                        <span className="px-2 py-1 bg-site-gold text-black text-xs font-normal uppercase">
                          Testimonial
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-site-gray-light leading-relaxed mb-2">
                      "{item.comment}"
                    </p>
                    <div className="flex items-center gap-4 text-xs text-site-gray-light">
                      {item.allowTestimonial && (
                        <span className="text-site-gold">✓ OK to use as testimonial</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {!item.isTestimonial && item.allowTestimonial && (
                    <button
                      onClick={() => {
                        toggleTestimonial(item.id, false);
                      }}
                      className="px-4 py-2 bg-site-gold text-black hover:bg-black hover:text-white transition-colors text-sm font-normal uppercase"
                    >
                      Add to Testimonials
                    </button>
                  )}
                  {item.isTestimonial && (
                    <button
                      onClick={() => toggleTestimonial(item.id, true)}
                      className="px-4 py-2 bg-gray-200 text-site-gray hover:bg-black hover:text-white transition-colors text-sm font-normal uppercase"
                    >
                      Remove from Testimonials
                    </button>
                  )}
                  <button
                    onClick={() => deleteFeedback(item.id)}
                    className="px-4 py-2 bg-gray-200 text-site-gray hover:bg-red-100 hover:text-red-700 transition-colors text-sm font-normal uppercase"
                  >
                    Delete
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

