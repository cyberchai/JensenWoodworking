'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectLookupForm() {
  const [projectCode, setProjectCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = projectCode.trim();
    
    if (!trimmed) {
      setError('Project code is required');
      return;
    }

    setError('');
    router.push(`/client/p/${trimmed}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="projectCode" className="block text-sm font-medium text-site-gray mb-2 uppercase tracking-wide">
          Project Code
        </label>
        <input
          id="projectCode"
          type="text"
          value={projectCode}
          onChange={(e) => {
            setProjectCode(e.target.value);
            setError('');
          }}
          placeholder="Enter your project code"
          className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
      <button
        type="submit"
        className="relative w-full bg-site-gold text-black py-3 px-8 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group"
      >
        <span className="relative z-10">View Project</span>
        <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </button>
    </form>
  );
}

