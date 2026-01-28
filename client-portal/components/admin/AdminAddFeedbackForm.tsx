'use client';

import { useState, FormEvent } from 'react';
import { store } from '@/lib/store';
import { X } from '@/components/icons';

interface AdminAddFeedbackFormProps {
  onFeedbackAdded: () => void;
}

export default function AdminAddFeedbackForm({ onFeedbackAdded }: AdminAddFeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [comment, setComment] = useState('');
  const [allowTestimonial, setAllowTestimonial] = useState(true);
  const [isTestimonial, setIsTestimonial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!clientName.trim()) {
        setError('Client name is required');
        setIsSubmitting(false);
        return;
      }

      if (!comment.trim()) {
        setError('Comment is required');
        setIsSubmitting(false);
        return;
      }

      await store.createFeedback({
        // Keep required backend fields, but do not ask admin to fill them in.
        projectToken: 'manual',
        projectName: 'Manual',
        rating: 5,
        comment: comment.trim(),
        allowTestimonial,
        isTestimonial,
        clientName: clientName.trim(),
      });

      // Reset form
      setClientName('');
      setComment('');
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
    setComment('');
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
          Client Name *
        </label>
        <input
          id="clientName"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
          className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
          placeholder="e.g., John & Jane Smith"
        />
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
