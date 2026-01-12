'use client';

import { Feedback } from '@/lib/mockStore';
import { store } from '@/lib/store';

interface AdminTestimonialsProps {
  feedback: Feedback[];
  onUpdate: () => void;
}

export default function AdminTestimonials({ feedback, onUpdate }: AdminTestimonialsProps) {
  const toggleTestimonial = async (id: string, currentValue: boolean) => {
    await store.updateFeedback(id, { isTestimonial: !currentValue });
    onUpdate();
  };

  const deleteFeedback = async (id: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      await store.deleteFeedback(id);
      onUpdate();
    }
  };

  const testimonials = feedback.filter(f => f.isTestimonial);

  return (
    <div className="bg-white border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-normal text-black">Testimonials</h2>
        <span className="text-sm text-site-gray-light">
          {testimonials.length} {testimonials.length === 1 ? 'testimonial' : 'testimonials'} displayed
        </span>
      </div>
      
      {testimonials.length === 0 ? (
        <p className="text-site-gray-light text-sm">No testimonials currently displayed.</p>
      ) : (
        <div className="space-y-4">
          {testimonials.map((item) => (
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
                  </div>
                  <p className="text-sm text-site-gray-light leading-relaxed mb-2">
                    "{item.comment}"
                  </p>
                  <p className="text-xs text-site-gray-light">
                    Project: {item.projectName}
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
  );
}

