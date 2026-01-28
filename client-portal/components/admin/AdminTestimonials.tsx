'use client';

import { Feedback } from '@/lib/mockStore';
import { store } from '@/lib/store';
import { Star } from '@/components/icons';
import AdminAddFeedbackForm from './AdminAddFeedbackForm';

interface AdminTestimonialsProps {
  feedback: Feedback[];
  onUpdate: () => void;
}

export default function AdminTestimonials({ feedback, onUpdate }: AdminTestimonialsProps) {
  const toggleTestimonial = async (id: string, currentValue: boolean) => {
    await store.updateFeedback(id, { isTestimonial: !currentValue });
    onUpdate();
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
              <div className="flex items-center text-brass mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < item.rating ? 'text-brass' : 'text-stone-200'} 
                    fill={i < item.rating} 
                  />
                ))}
              </div>
              <p className="text-xl mb-8 leading-relaxed">"{item.comment}"</p>
              <div className="not-italic flex items-center justify-between border-t border-stone-200 pt-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-ebony">
                    {item.clientName || 'Anonymous'}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-stone-300">
                    {item.projectName}
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

