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
      <div className="bg-white border border-gray-200 p-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-2 bg-site-gold text-black hover:bg-black hover:text-white transition-colors text-sm font-normal uppercase"
        >
          + Create New Project
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-normal text-black">Create Project</h2>
        <button
          onClick={handleCancel}
          className="text-sm text-site-gray hover:text-black transition-colors"
        >
          Close
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientLabel" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Project Name *
          </label>
          <input
            id="clientLabel"
            type="text"
            value={clientLabel}
            onChange={(e) => setClientLabel(e.target.value)}
            required
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
            placeholder="e.g., Custom Walnut Dining Table"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Project Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors resize-none"
            placeholder="Optional description of the project..."
          />
        </div>

        <div>
          <label htmlFor="projectStartDate" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Project Start Date
          </label>
          <input
            id="projectStartDate"
            type="date"
            value={projectStartDate}
            onChange={(e) => setProjectStartDate(e.target.value)}
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
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
                className="w-4 h-4 text-site-gold border-gray-300 focus:ring-site-gold"
              />
              <label htmlFor="autoGenerateToken" className="text-sm text-site-gray">
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
                      : 'border-gray-300 focus:border-site-gold'
                  }`}
                  placeholder="JW-XXXX-XXXX-XXXX"
                  pattern="JW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
                />
                {tokenError && (
                  <p className="text-xs text-red-600">{tokenError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateToken}
                    className="px-4 py-2 bg-gray-200 text-site-gray hover:bg-site-gold hover:text-black transition-colors text-sm font-normal uppercase"
                  >
                    Generate Token
                  </button>
                  <p className="text-xs text-site-gray-light self-center">
                    Format: JW-XXXX-XXXX-XXXX
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="paymentCode" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Payment PIN (Optional)
          </label>
          <input
            id="paymentCode"
            type="text"
            value={paymentCode}
            onChange={(e) => setPaymentCode(e.target.value)}
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
            placeholder="e.g., 1234"
            maxLength={10}
          />
          <p className="text-xs text-site-gray-light mt-1">
            PIN code clients will use to access payment information. Leave blank if not needed.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 relative bg-site-gold text-black py-3 px-8 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">{isSubmitting ? 'Creating...' : 'Create Project'}</span>
            <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-site-gray hover:bg-gray-300 transition-colors text-sm font-normal uppercase"
          >
            Cancel
          </button>
        </div>
      </form>

      {generatedLink && (
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <p className="text-sm font-normal text-site-gray uppercase tracking-wide">Share Link:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 px-4 py-2 border-0 border-b border-gray-300 bg-white text-sm"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gray-200 text-site-gray hover:bg-site-gold hover:text-black transition-colors text-sm font-normal uppercase"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

