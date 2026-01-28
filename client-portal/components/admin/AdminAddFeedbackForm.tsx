'use client';

import { useState, FormEvent } from 'react';
import { store } from '@/lib/store';
import { Star, X } from '@/components/icons';

interface AdminAddFeedbackFormProps {
  onFeedbackAdded: () => void;
}

export default function AdminAddFeedbackForm({ onFeedbackAdded }: AdminAddFeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectToken, setProjectToken] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [allowTestimonial, setAllowTestimonial] = useState(true);
  const [isTestimonial, setIsTestimonial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!projectName.trim()) {
        setError('Project name is required');
        setIsSubmitting(false);
        return;
      }

      if (!comment.trim()) {
        setError('Comment is required');
        setIsSubmitting(false);
        return;
      }

      if (rating < 1 || rating > 5) {
        setError('Rating must be between 1 and 5');
        setIsSubmitting(false);
        return;
      }

      await store.createFeedback({
        projectToken: projectToken.trim() || 'MANUAL',
        projectName: projectName.trim(),
        rating,
        comment: comment.trim(),
        allowTestimonial,
        isTestimonial,
        clientName: clientName.trim() || undefined,
        title: title.trim() || undefined,
      });

      // Reset form
      setClientName('');
      setProjectName('');
      setProjectToken('');
      setRating(5);
      setComment('');
      setTitle('');
      setAllowTestimonial(true);
      setIsTestimonial(true);
      setIsOpen(false);
      onFeedbackAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setClientName('');
    setProjectName('');
    setProjectToken('');
    setRating(5);
    setComment('');
    setTitle('');
    setAllowTestimonial(true);
    setIsTestimonial(true);
    setError(null);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors border-b border-transparent hover:border-stone-300 pb-1"
      >
        + Add Feedback
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 border border-stone-100 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ebony">Add Feedback</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-stone-400 hover:text-ebony transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="clientName" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
          Client Name (Optional)
        </label>
        <input
          id="clientName"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
          placeholder="e.g., John & Jane Smith"
        />
      </div>

      <div>
        <label htmlFor="projectName" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
          Project Name *
        </label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
          placeholder="e.g., Custom Walnut Dining Table"
        />
      </div>

      <div>
        <label htmlFor="projectToken" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
          Project Token (Optional)
        </label>
        <input
          id="projectToken"
          type="text"
          value={projectToken}
          onChange={(e) => setProjectToken(e.target.value)}
          className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
          placeholder="Leave empty for manual entries"
        />
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-3">
          Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setRating(num)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={num <= rating ? 'text-brass' : 'text-stone-200'}
                fill={num <= rating}
              />
            </button>
          ))}
          <span className="ml-4 text-sm text-stone-600 font-serif italic">
            {rating} {rating === 1 ? 'star' : 'stars'}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
          Testimonial Title (Optional)
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
          placeholder="e.g., Stunning Kitchen Island Transformation"
        />
        <p className="text-[9px] text-stone-400 mt-1 italic">This title will appear on the home page as a clickable link</p>
      </div>

      <div>
        <label htmlFor="comment" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
          Comment *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors resize-none"
          placeholder="Enter the feedback comment..."
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowTestimonial}
            onChange={(e) => setAllowTestimonial(e.target.checked)}
            className="w-4 h-4 text-brass border-stone-300 rounded focus:ring-brass focus:ring-2"
          />
          <span className="text-[11px] font-black uppercase tracking-widest text-ebony">
            Allow use as testimonial
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isTestimonial}
            onChange={(e) => setIsTestimonial(e.target.checked)}
            className="w-4 h-4 text-brass border-stone-300 rounded focus:ring-brass focus:ring-2"
          />
          <span className="text-[11px] font-black uppercase tracking-widest text-ebony">
            Feature as testimonial (show in testimonials section)
          </span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-brass text-ebony hover:bg-ebony hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Feedback'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all text-[11px] font-black uppercase tracking-widest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
