'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/mockStore';

interface FeedbackFormProps {
  projectToken?: string;
  projectName?: string;
}

export default function FeedbackForm({ projectToken, projectName }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [allowTestimonial, setAllowTestimonial] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (projectToken && projectName) {
      store.createFeedback({
        projectToken,
        projectName,
        rating,
        comment,
        allowTestimonial,
        isTestimonial: false, // Admin must approve for testimonials
      });
    }
    
    router.push('/feedback/success');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-normal text-black mb-6">Feedback</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`w-10 h-10 border-2 transition-colors ${
                    rating >= num
                      ? 'bg-site-gold text-black border-site-gold'
                      : 'bg-white text-site-gray-light border-gray-300 hover:border-site-gold'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
              Comments
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors resize-none"
              placeholder="Share your experience..."
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="testimonial"
              type="checkbox"
              checked={allowTestimonial}
              onChange={(e) => setAllowTestimonial(e.target.checked)}
              className="mt-1 w-4 h-4 text-site-gold border-gray-300 focus:ring-site-gold"
            />
            <label htmlFor="testimonial" className="text-sm text-site-gray">
              OK to use as testimonial
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="relative w-full bg-site-gold text-black py-3 px-8 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group"
      >
        <span className="relative z-10">Submit Feedback</span>
        <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </button>
    </form>
  );
}

