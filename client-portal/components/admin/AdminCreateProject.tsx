'use client';

import { useState, FormEvent } from 'react';
import { store } from '@/lib/store';
import type { Project } from '@/lib/mockStore';

interface AdminCreateProjectProps {
  onProjectCreated: () => void;
  isOpen?: boolean; // External control for open state
  onClose?: () => void; // Callback when form should close
}

export default function AdminCreateProject({ onProjectCreated, isOpen: externalIsOpen, onClose }: AdminCreateProjectProps) {
  const [clientLabel, setClientLabel] = useState('');
  const [description, setDescription] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [paymentPinError, setPaymentPinError] = useState<string | null>(null);
  
  // Use external isOpen if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const handleOpen = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(true);
    }
  };
  
  const handleClose = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(false);
    } else if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setPaymentPinError(null);
    setIsSubmitting(true);
    
    try {
      // Validate project name is provided
      if (!clientLabel || !clientLabel.trim()) {
        setNameError('Project name is required.');
        setIsSubmitting(false);
        return;
      }
      
      // Check for uniqueness before submitting
      try {
        const allProjects = (await store.getAllProjects()) as Project[];
        const normalizedName = clientLabel.trim().toLowerCase();
        const duplicate = allProjects.find(
          (p: Project) => p.clientLabel.trim().toLowerCase() === normalizedName
        );
        
        if (duplicate) {
          setNameError(`A project with the name "${clientLabel}" already exists. Please use a different project name.`);
          setIsSubmitting(false);
          return;
        }
      } catch (checkError) {
        // If uniqueness check fails, continue - the store layer will catch it
        console.warn('Could not check project name uniqueness:', checkError);
      }

      // Validate Payment PIN: required and exactly 4 digits
      const pin = paymentCode.trim();
      if (!/^\d{4}$/.test(pin)) {
        setPaymentPinError('Payment PIN must be exactly 4 digits.');
        setIsSubmitting(false);
        return;
      }
      
      // Payment handles are securely set in the store layer - not passed from UI
      const project = await store.createProject({
        clientLabel: clientLabel.trim(),
        description: description.trim() || undefined,
        paymentCode: pin,
        depositPaid: false,
        finalPaid: false,
      });

      const link = `${window.location.origin}/client/p/${project.token}`;
      setGeneratedLink(link);
      onProjectCreated();
      
      // Reset form but keep it open to show the generated link
      setClientLabel('');
      setDescription('');
      setPaymentCode('');
      
      // If externally controlled, don't close automatically - let parent decide
      // If internally controlled, keep it open to show the link
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create project. Please try again.';
      // Check if error is about duplicate name
      if (errorMessage.includes('already exists') || errorMessage.includes('similar name')) {
        setNameError(errorMessage);
      } else {
        setError(errorMessage);
      }
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setClientLabel('');
    setDescription('');
    setPaymentCode('');
    setGeneratedLink(null);
    setError(null);
    setNameError(null);
    setPaymentPinError(null);
    setIsSubmitting(false);
    handleClose();
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors border-b border-transparent hover:border-stone-300 pb-1"
      >
        + Create New Project
      </button>
    );
  }

  return (
    <div className="space-y-5">
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
            onChange={(e) => {
              setClientLabel(e.target.value);
              setNameError(null);
            }}
            required
            className={`w-full px-4 py-2 border-0 border-b bg-white focus:outline-none transition-colors ${
              nameError 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-stone-300 focus:border-brass'
            }`}
            placeholder="e.g., Custom Walnut Dining Table"
          />
          {nameError && (
            <p className="text-xs text-red-600 mt-1">{nameError}</p>
          )}
          <p className="text-xs text-stone-400 mt-1">
            The project name will be used to generate a unique URL token automatically.
          </p>
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
          <label htmlFor="paymentCode" className="block text-[11px] font-black uppercase tracking-widest text-ebony mb-2">
            Payment PIN *
          </label>
          <input
            id="paymentCode"
            type="text"
            value={paymentCode}
            onChange={(e) => {
              // digits only, max 4 chars
              const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPaymentCode(digitsOnly);
              setPaymentPinError(null);
            }}
            className={`w-full px-4 py-2 border-0 border-b bg-white focus:outline-none transition-colors ${
              paymentPinError ? 'border-red-300 focus:border-red-500' : 'border-stone-300 focus:border-brass'
            }`}
            placeholder="1234"
            inputMode="numeric"
            pattern="\d{4}"
            minLength={4}
            maxLength={4}
            required
          />
          {paymentPinError && <p className="text-xs text-red-600 mt-1">{paymentPinError}</p>}
          <p className="text-xs text-stone-400 mt-1">4-digit PIN clients will use to access payment information.</p>
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

