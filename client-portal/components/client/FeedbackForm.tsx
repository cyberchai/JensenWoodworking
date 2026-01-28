'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/store';
import { Feedback } from '@/lib/mockStore';
import { Star, CheckCircle2 } from '@/components/icons';

interface FeedbackFormProps {
  projectToken?: string;
  projectName?: string;
}

export default function FeedbackForm({ projectToken, projectName }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [clientName, setClientName] = useState('');
  const [allowTestimonial, setAllowTestimonial] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);
  const router = useRouter();

  // Check if feedback already exists for this project
  useEffect(() => {
    const checkExistingFeedback = async () => {
      if (projectToken) {
        const allFeedback = await store.getAllFeedback();
        const existing = allFeedback.find((f: Feedback) => f.projectToken === projectToken);
        if (existing) {
          setHasExistingFeedback(true);
          if (existing.clientName) {
            setClientName(existing.clientName);
          }
        }
      }
    };
    checkExistingFeedback();
  }, [projectToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (projectToken && projectName && comment.trim()) {
      await store.createFeedback({
        projectToken,
        projectName,
        rating,
        comment: comment.trim(),
        clientName: clientName.trim() || undefined,
        allowTestimonial,
        isTestimonial: false, // Admin must approve for testimonials
      });
      setFeedbackSubmitted(true);
      setHasExistingFeedback(true);
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="text-center py-10 space-y-6">
        <CheckCircle2 size={32} className="text-brass mx-auto mb-4" />
        <p className="font-serif italic text-ebony text-xl">Thank you for your feedback!</p>
        {hasExistingFeedback && (
          <button
            onClick={() => {
              setFeedbackSubmitted(false);
              setComment('');
            }}
            className="text-[10px] font-black uppercase tracking-widest text-brass hover:text-ebony transition-colors"
          >
            Send a new one?
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasExistingFeedback && (
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-sm shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-600 mb-2">
            Your feedback has been sent.
          </p>
          <button
            onClick={() => {
              setFeedbackSubmitted(false);
              setComment('');
            }}
            className="text-[10px] font-black uppercase tracking-widest text-brass hover:text-ebony transition-colors"
          >
            Send a new one?
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="clientName" className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
            Your Name (Optional)
          </label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-stone-50 p-3 font-serif text-stone-600 focus:outline-none border-b border-stone-200"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">
            Rating
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button 
                key={s} 
                type="button" 
                onClick={() => setRating(s)} 
                className={`transition-colors ${s <= rating ? 'text-brass' : 'text-stone-100'}`}
              >
                <Star size={20} fill={s <= rating} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
            Your Feedback
          </label>
          <textarea 
            id="comment"
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            placeholder="Share your experience with this project..." 
            className="w-full bg-stone-50 p-4 font-serif italic text-stone-600 focus:outline-none border-b border-stone-200 h-32" 
            required 
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            id="testimonial"
            type="checkbox"
            checked={allowTestimonial}
            onChange={(e) => setAllowTestimonial(e.target.checked)}
            className="mt-1 w-4 h-4 text-brass border-stone-200 focus:ring-brass"
          />
          <label htmlFor="testimonial" className="text-[10px] text-stone-400 uppercase tracking-widest">
            OK to use as testimonial on our website
          </label>
        </div>
        <button 
          type="submit" 
          className="w-full py-5 bg-ebony text-white text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-brass transition-all"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

