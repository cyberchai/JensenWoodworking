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
  const [title, setTitle] = useState('');
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
        title: title.trim() || undefined,
      });

      // Reset form
      setClientName('');
      setTitle('');
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
    setTitle('');
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
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-stone-50 rounded-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ebony">Add Feedback</h3>
        <button type="button" onClick={handleCancel} className="text-stone-400 hover:text-ebony transition-colors">
          <X size={14} />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-sm">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="clientName" className="block text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">
            Client Name *
          </label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="w-full px-3 py-1.5 text-sm border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass"
            placeholder="John & Jane Smith"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass"
            placeholder="Optional title"
          />
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">
          Comment *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={3}
          className="w-full px-3 py-1.5 text-sm border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass resize-none"
          placeholder="Feedback comment..."
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={allowTestimonial} onChange={(e) => setAllowTestimonial(e.target.checked)} className="w-3 h-3 text-brass border-stone-300 rounded focus:ring-brass" />
          <span className="text-[9px] font-black uppercase tracking-wider text-stone-600">Allow testimonial</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isTestimonial} onChange={(e) => setIsTestimonial(e.target.checked)} className="w-3 h-3 text-brass border-stone-300 rounded focus:ring-brass" />
          <span className="text-[9px] font-black uppercase tracking-wider text-stone-600">Feature on site</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-1 bg-brass text-white hover:bg-ebony transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 py-1 text-stone-400 hover:text-ebony transition-colors text-[9px] font-black uppercase tracking-widest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
