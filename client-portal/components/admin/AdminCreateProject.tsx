'use client';

import { useState, FormEvent } from 'react';
import { store } from '@/lib/store';
import type { Project } from '@/lib/mockStore';

interface AdminCreateProjectProps {
  onProjectCreated: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminCreateProject({ onProjectCreated, isOpen: externalIsOpen, onClose }: AdminCreateProjectProps) {
  const [clientLabel, setClientLabel] = useState('');
  const [description, setDescription] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [projectType, setProjectType] = useState<string[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [paymentPinError, setPaymentPinError] = useState<string | null>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleOpen = () => {
    if (externalIsOpen === undefined) setInternalIsOpen(true);
  };

  const handleClose = () => {
    if (externalIsOpen === undefined) setInternalIsOpen(false);
    else if (onClose) onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setPaymentPinError(null);
    setIsSubmitting(true);

    try {
      if (!clientLabel || !clientLabel.trim()) {
        setNameError('Project name is required.');
        setIsSubmitting(false);
        return;
      }

      try {
        const allProjects = (await store.getAllProjects()) as Project[];
        const normalizedName = clientLabel.trim().toLowerCase();
        const duplicate = allProjects.find(
          (p: Project) => p.clientLabel.trim().toLowerCase() === normalizedName
        );
        if (duplicate) {
          setNameError(`A project named "${clientLabel}" already exists.`);
          setIsSubmitting(false);
          return;
        }
      } catch {
        // Continue if uniqueness check fails
      }

      const pin = paymentCode.trim();
      if (!/^\d{4}$/.test(pin)) {
        setPaymentPinError('Must be exactly 4 digits.');
        setIsSubmitting(false);
        return;
      }

      const project = await store.createProject({
        clientLabel: clientLabel.trim(),
        description: description.trim() || undefined,
        projectType: projectType.length > 0 ? projectType : undefined,
        paymentCode: pin,
        depositPaid: false,
        finalPaid: false,
      });

      const link = `${window.location.origin}/client/p/${project.token}`;
      setGeneratedLink(link);
      onProjectCreated();
      setClientLabel('');
      setDescription('');
      setPaymentCode('');
      setProjectType([]);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create project.';
      if (errorMessage.includes('already exists') || errorMessage.includes('similar name')) {
        setNameError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setClientLabel('');
    setDescription('');
    setPaymentCode('');
    setProjectType([]);
    setGeneratedLink(null);
    setError(null);
    setNameError(null);
    setPaymentPinError(null);
    setIsSubmitting(false);
    handleClose();
  };

  const copyToClipboard = async () => {
    if (generatedLink) await navigator.clipboard.writeText(generatedLink);
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors"
      >
        + New Project
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brass">Create Project</h3>
        <button onClick={handleCancel} className="text-stone-400 hover:text-ebony transition-colors text-xs">✕</button>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="clientLabel" className="block text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">
              Project Name *
            </label>
            <input
              id="clientLabel"
              type="text"
              value={clientLabel}
              onChange={(e) => { setClientLabel(e.target.value); setNameError(null); }}
              required
              className={`w-full px-3 py-1.5 text-sm border-0 border-b bg-white focus:outline-none transition-colors ${
                nameError ? 'border-red-300 focus:border-red-500' : 'border-stone-300 focus:border-brass'
              }`}
              placeholder="e.g., Custom Walnut Dining Table"
            />
            {nameError && <p className="text-[10px] text-red-600 mt-0.5">{nameError}</p>}
          </div>
          <div>
            <label htmlFor="paymentCode" className="block text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">
              Payment PIN *
            </label>
            <input
              id="paymentCode"
              type="text"
              value={paymentCode}
              onChange={(e) => {
                setPaymentCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                setPaymentPinError(null);
              }}
              className={`w-full px-3 py-1.5 text-sm border-0 border-b bg-white focus:outline-none transition-colors ${
                paymentPinError ? 'border-red-300 focus:border-red-500' : 'border-stone-300 focus:border-brass'
              }`}
              placeholder="1234"
              inputMode="numeric"
              pattern="\d{4}"
              minLength={4}
              maxLength={4}
              required
            />
            {paymentPinError && <p className="text-[10px] text-red-600 mt-0.5">{paymentPinError}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-1.5 text-sm border-0 border-b border-stone-300 bg-white focus:outline-none focus:border-brass transition-colors resize-none"
            placeholder="Optional project description..."
          />
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">Type</label>
          <div className="flex flex-wrap gap-1.5">
            {['Island Top', 'Bar Top', 'Counter Top', 'Mantel', 'Table', 'Charcuterie Board', 'Other'].map((t) => {
              const active = projectType.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setProjectType(active ? projectType.filter(v => v !== t) : [...projectType, t])}
                  className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                    active
                      ? 'border-brass bg-brass/15 text-brass'
                      : 'border-stone-200 text-stone-400 hover:border-stone-300'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1 bg-brass text-white hover:bg-ebony transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create'}
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

      {generatedLink && (
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 shrink-0">Share Link:</span>
          <input
            type="text"
            value={generatedLink}
            readOnly
            className="flex-1 px-2 py-1 text-xs border-0 border-b border-stone-200 bg-transparent text-stone-600 truncate"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony shrink-0"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
