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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="relative mb-8">
        <input
          id="projectCode"
          type="text"
          value={projectCode}
          onChange={(e) => {
            setProjectCode(e.target.value);
            setError('');
          }}
          placeholder="PROJECT CODE"
          className={`w-full py-6 bg-stone-50 border-b-2 text-center text-2xl font-serif tracking-[0.2em] uppercase focus:outline-none transition-all ${
            error ? 'border-red-200' : 'border-stone-100 focus:border-brass'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-6">{error}</p>}
      <button
        type="submit"
        className="w-full bg-ebony text-white font-black text-xs tracking-[0.3em] uppercase py-6 hover:bg-brass transition-all shadow-xl"
      >
        View Project
      </button>
    </form>
  );
}

