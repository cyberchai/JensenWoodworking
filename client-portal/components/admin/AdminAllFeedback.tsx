'use client';

import { Feedback, store } from '@/lib/mockStore';

interface AdminAllFeedbackProps {
  feedback: Feedback[];
  onUpdate: () => void;
}

export default function AdminAllFeedback({ feedback, onUpdate }: AdminAllFeedbackProps) {
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

  return (
    <div className="bg-white border border-gray-200 p-6 space-y-6">
      <h2 className="text-xl font-normal text-black">All Feedback</h2>
      
      {feedback.length === 0 ? (
        <p className="text-site-gray-light text-sm">No feedback submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between">
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
                    <span>Project: {item.projectName}</span>
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
  );
}

