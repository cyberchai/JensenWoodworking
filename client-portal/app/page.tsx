'use client';

import Link from 'next/link';
import { ShieldCheck, UserCircle, ArrowRight } from '@/components/icons';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Elegant Background Grain Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1622322062681-3f628549842c?auto=format&fit=crop&q=80&w=1600')] bg-cover"></div>
      
      <div className="max-w-5xl w-full text-center space-y-16 z-10 animate-in fade-in duration-1000">
        <div className="space-y-10">
          <div className="flex justify-center">
            <div className="p-6">
              <img 
                src="/images/logo.webp" 
                alt="Jensen Woodworking" 
                className="h-24 w-auto mx-auto"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-serif text-white tracking-tighter leading-none italic">
              Jensen Woodworking
            </h1>
            <p className="text-stone-400 text-[11px] font-black uppercase tracking-[0.5em] mt-2">
              Custom Woodworking in Duxbury, MA
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
          <Link
            href="/admin"
            className="group bg-white/5 backdrop-blur-md p-10 border border-white/10 hover:border-brass transition-all text-left flex flex-col"
          >
            <ShieldCheck size={28} className="text-brass mb-8" />
            <h3 className="text-2xl font-serif text-white mb-3 tracking-wide">Admin Dashboard</h3>
            <p className="text-stone-400 text-xs uppercase tracking-widest leading-loose mb-8 flex-1">
              Manage projects, view feedback, and update client timelines.
            </p>
            <div className="flex items-center text-brass font-black text-[10px] uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform">
              Enter Dashboard <ArrowRight size={16} className="ml-3" />
            </div>
          </Link>

          <Link
            href="/client/project"
            className="group bg-brass p-10 border border-transparent hover:bg-white transition-all text-left flex flex-col shadow-2xl"
          >
            <UserCircle size={28} className="text-ebony mb-8 group-hover:text-brass transition-colors" />
            <h3 className="text-2xl font-serif text-[#0a0a0a] mb-3 tracking-wide">Your Project</h3>
            <p className="text-[#0a0a0a]/60 text-xs uppercase tracking-widest leading-loose mb-8 flex-1">
              View your project status, timeline updates, and payment information.
            </p>
            <div className="flex items-center text-[#0a0a0a] font-black text-[10px] uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform">
              View Project <ArrowRight size={16} className="ml-3" />
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-12 pt-16 border-t border-white/5">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-600">Established 1994</span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-600">Duxbury, Massachusetts</span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-600">30+ Years Experience</span>
        </div>
      </div>
    </div>
  );
}

