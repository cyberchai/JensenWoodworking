'use client';

import { useState, FormEvent } from 'react';
import { store, generateSecureToken, validateTokenFormat, normalizeToken } from '@/lib/store';

interface AdminCreateProjectProps {
  onProjectCreated: () => void;
}

export default function AdminCreateProject({ onProjectCreated }: AdminCreateProjectProps) {
  const [clientLabel, setClientLabel] = useState('');
  const [description, setDescription] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectTokenCode, setProjectTokenCode] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [autoGenerateToken, setAutoGenerateToken] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setTokenError(null);
    setIsSubmitting(true);
    
    try {
      // Validate token format if manually provided
      if (!autoGenerateToken && projectTokenCode.trim()) {
        const normalized = normalizeToken(projectTokenCode.trim());
        if (!validateTokenFormat(normalized)) {
          setTokenError('Invalid token format. Must be: JW-XXXX-XXXX-XXXX');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Convert date string to timestamp if provided
      // Fix timezone issue: date picker gives YYYY-MM-DD which is treated as UTC midnight
      // Parse the date string and create a date at local midnight to avoid day shift
      const startDateTimestamp = projectStartDate 
        ? (() => {
            const [year, month, day] = projectStartDate.split('-').map(Number);
            // Create date at local midnight (month is 0-indexed in Date constructor)
            return new Date(year, month - 1, day).getTime();
          })()
        : undefined;
      
      // Payment handles are securely set in the store layer - not passed from UI
      const project = await store.createProject({
        clientLabel,
        description: description.trim() || undefined,
        projectStartDate: startDateTimestamp,
        projectTokenCode: autoGenerateToken ? undefined : normalizeToken(projectTokenCode.trim()) || undefined,
        paymentCode: paymentCode.trim() || undefined,
        statusUpdates: [],
        depositPaid: false,
        finalPaid: false,
      } as any);

      const link = `${window.location.origin}/client/p/${project.token}`;
      setGeneratedLink(link);
      onProjectCreated();
      
      // Reset form but keep it open to show the generated link
      setClientLabel('');
      setDescription('');
      setProjectStartDate('');
      setProjectTokenCode('');
      setPaymentCode('');
      setAutoGenerateToken(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create project. Please try again.');
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setClientLabel('');
    setDescription('');
    setProjectStartDate('');
    setProjectTokenCode('');
    setPaymentCode('');
    setAutoGenerateToken(true);
    setGeneratedLink(null);
    setError(null);
    setTokenError(null);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  const handleGenerateToken = () => {
    setProjectTokenCode(generateSecureToken());
    setAutoGenerateToken(false);
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors border-b border-transparent hover:border-stone-300 pb-1"
      >
        + Create New Project
      </button>
    );
  }

  return (
    <div className="bg-white border border-stone-100 p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ebony">Create Project</h3>
        <button
          onClick={handleCancel}
          className="text-stone-400 hover:text-ebony transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="clientLabel" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
            Project Name *
          </label>
          <input
            id="clientLabel"
            type="text"
            value={clientLabel}
            onChange={(e) => setClientLabel(e.target.value)}
            required
            className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
            placeholder="e.g., Custom Walnut Dining Table"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
            Project Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors resize-none"
            placeholder="Optional description of the project..."
          />
        </div>

        <div>
          <label htmlFor="projectStartDate" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
            Project Start Date
          </label>
          <input
            id="projectStartDate"
            type="date"
            value={projectStartDate}
            onChange={(e) => setProjectStartDate(e.target.value)}
            className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
            Project Token Code
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                id="autoGenerateToken"
                type="checkbox"
                checked={autoGenerateToken}
                onChange={(e) => {
                  setAutoGenerateToken(e.target.checked);
                  if (e.target.checked) {
                    setProjectTokenCode('');
                  }
                }}
                className="w-4 h-4 text-brass border-stone-300 rounded focus:ring-brass focus:ring-2"
              />
              <label htmlFor="autoGenerateToken" className="text-[11px] font-black uppercase tracking-widest text-ebony">
                Auto-generate secure token
              </label>
            </div>
            
            {!autoGenerateToken && (
              <div className="space-y-2">
                <input
                  id="projectTokenCode"
                  type="text"
                  value={projectTokenCode}
                  onChange={(e) => {
                    const normalized = normalizeToken(e.target.value);
                    setProjectTokenCode(normalized);
                    setTokenError(null);
                    
                    // Real-time validation
                    if (normalized && !validateTokenFormat(normalized)) {
                      setTokenError('Invalid format. Must be: JW-XXXX-XXXX-XXXX (where X is alphanumeric)');
                    } else {
                      setTokenError(null);
                    }
                  }}
                  className={`w-full px-4 py-2 border-0 border-b bg-white focus:outline-none transition-colors ${
                    tokenError 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-stone-300 focus:border-brass'
                  }`}
                  placeholder="JW-XXXX-XXXX-XXXX"
                  pattern="JW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
                />
                {tokenError && (
                  <p className="text-xs text-red-600">{tokenError}</p>
                )}
                <div className="flex gap-3 items-center">
                  <button
                    type="button"
                    onClick={handleGenerateToken}
                    className="px-4 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all text-[11px] font-black uppercase tracking-widest"
                  >
                    Generate Token
                  </button>
                  <p className="text-xs text-stone-400">
                    Format: JW-XXXX-XXXX-XXXX
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="paymentCode" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
            Payment PIN (Optional)
          </label>
          <input
            id="paymentCode"
            type="text"
            value={paymentCode}
            onChange={(e) => setPaymentCode(e.target.value)}
            className="w-full px-4 py-2 border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors"
            placeholder="e.g., 1234"
            maxLength={10}
          />
          <p className="text-xs text-stone-400 mt-1">
            PIN code clients will use to access payment information. Leave blank if not needed.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-brass text-ebony hover:bg-ebony hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
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

      {generatedLink && (
        <div className="pt-6 border-t border-stone-100 space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-ebony">Share Link:</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 px-4 py-2 border-0 border-b border-stone-300 bg-white text-sm"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-6 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all text-[11px] font-black uppercase tracking-widest"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

