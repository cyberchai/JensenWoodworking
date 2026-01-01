'use client';

import { useState, FormEvent } from 'react';
import { ProjectStatus, store, generateToken } from '@/lib/mockStore';

interface AdminCreateProjectProps {
  onProjectCreated: (token: string) => void;
}

export default function AdminCreateProject({ onProjectCreated }: AdminCreateProjectProps) {
  const [clientLabel, setClientLabel] = useState('');
  const [venmoHandle, setVenmoHandle] = useState('jensenwoodworking');
  const [paypalHandle, setPaypalHandle] = useState('jensenwoodworking');
  const [status, setStatus] = useState<ProjectStatus>('quote');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const project = store.createProject({
      clientLabel,
      venmoHandle,
      paypalHandle,
      status,
      depositPaid: false,
      finalPaid: false,
    });

    const link = `${window.location.origin}/p/${project.token}`;
    setGeneratedLink(link);
    onProjectCreated(project.token);
    
    // Reset form
    setClientLabel('');
    setStatus('quote');
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 space-y-6">
      <h2 className="text-xl font-normal text-black">Create Project</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientLabel" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Project Name
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
          <label htmlFor="venmoHandle" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Venmo Handle
          </label>
          <input
            id="venmoHandle"
            type="text"
            value={venmoHandle}
            onChange={(e) => setVenmoHandle(e.target.value)}
            required
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
          />
        </div>

        <div>
          <label htmlFor="paypalHandle" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            PayPal Handle
          </label>
          <input
            id="paypalHandle"
            type="text"
            value={paypalHandle}
            onChange={(e) => setPaypalHandle(e.target.value)}
            required
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
          >
            {store.getStatusOrder().map((s) => (
              <option key={s} value={s}>
                {store.getStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="relative w-full bg-site-gold text-black py-3 px-8 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group"
        >
          <span className="relative z-10">Create Project</span>
          <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </button>
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

