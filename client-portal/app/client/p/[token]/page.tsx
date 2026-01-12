'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/lib/mockStore';
import { store } from '@/lib/store';
import ProjectStatusTimeline from '@/components/client/ProjectStatusTimeline';
import PaymentPanel from '@/components/client/PaymentPanel';
import FeedbackForm from '@/components/client/FeedbackForm';
import { Calendar, ChevronRight } from '@/components/icons';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentArea, setShowPaymentArea] = useState(false);
  const [payCode, setPayCode] = useState('');
  const [payError, setPayError] = useState(false);
  const [payAuthorized, setPayAuthorized] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      const found = await store.getProject(token);
      setProject(found ?? null);
      setLoading(false);
    };
    loadProject();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-stone-400 font-serif italic">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-serif text-ebony">Project not found</h1>
          <p className="text-stone-400 font-serif italic text-xl">The project code you entered does not exist.</p>
          <Link
            href="/client/project"
            className="inline-block bg-ebony text-white font-black text-xs tracking-[0.3em] uppercase py-5 px-8 hover:bg-brass transition-all shadow-xl"
          >
            Back to Project Lookup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto space-y-16 px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-stone-100">
          <div className="space-y-4">
            <button onClick={() => router.push('/client/project')} className="text-[10px] font-black uppercase tracking-widest text-stone-300 hover:text-brass transition-colors">
              ← Back to Project Lookup
            </button>
            <h2 className="text-5xl font-serif text-ebony tracking-tighter leading-none">{project.clientLabel}</h2>
            <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brass">
              <span>Started {project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'Recently'}</span>
              <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
              <span>Project Code: {project.token}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowPaymentArea(!showPaymentArea)} 
            className="px-8 py-4 bg-ebony text-white text-[11px] font-black uppercase tracking-widest hover:bg-brass transition-all shadow-lg"
          >
            {showPaymentArea ? 'Return to Timeline' : 'Payment Information'}
          </button>
        </div>

        {showPaymentArea && (
          <div className="bg-white p-12 lg:p-20 shadow-2xl border border-stone-50 rounded-sm">
            {!payAuthorized ? (
              <div className="text-center space-y-8">
                <h3 className="text-3xl font-serif text-ebony">Payment Access</h3>
                <p className="text-stone-400 font-serif italic text-lg max-w-sm mx-auto">Access to payment information requires your project PIN code.</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  // For now, accept any code - in production this would check against project.paymentCode
                  if (payCode.length >= 4) { 
                    setPayAuthorized(true); 
                    setPayError(false); 
                  } else { 
                    setPayError(true); 
                  }
                }} className="max-w-xs mx-auto space-y-8">
                  <input 
                    type="password" 
                    placeholder="••••" 
                    value={payCode} 
                    onChange={e => setPayCode(e.target.value)} 
                    className="w-full text-center py-4 bg-stone-50 border-b-2 border-stone-200 text-3xl tracking-[1em] focus:outline-none focus:border-brass" 
                  />
                  {payError && <p className="text-red-500 text-[10px] font-black tracking-widest uppercase">Invalid Code</p>}
                  <button type="submit" className="w-full bg-ebony text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-brass transition-all">Verify & Enter</button>
                </form>
              </div>
            ) : (
              <div className="space-y-12">
                <h3 className="text-3xl font-serif text-ebony">Payment Options</h3>
                <PaymentPanel
                  depositPaid={project.depositPaid}
                  finalPaid={project.finalPaid}
                  venmoHandle={project.venmoHandle}
                  paypalHandle={project.paypalHandle}
                  projectName={project.clientLabel}
                />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-20">
            <div className="space-y-12">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-brass">Project Updates</h3>
              
              {project.statusUpdates.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-stone-100 rounded-sm">
                  <p className="font-serif italic text-stone-300 text-2xl">No updates yet. Check back soon!</p>
                </div>
              ) : (
                <ProjectStatusTimeline statusUpdates={project.statusUpdates} />
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="bg-ebony p-10 text-white shadow-2xl rounded-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brass mb-10">Project Details</h3>
              {project.description ? (
                <p className="font-serif italic text-stone-300 text-xl leading-relaxed mb-10">"{project.description}"</p>
              ) : (
                <p className="font-serif italic text-stone-300 text-xl leading-relaxed mb-10">Custom woodworking project by Jensen Woodworking</p>
              )}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-white/30">Craftsman</span>
                  <span>Klaus Jensen</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-white/30">Location</span>
                  <span className="text-brass">Duxbury, MA</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 border border-stone-100 shadow-sm rounded-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-ebony mb-8">Share Your Feedback</h3>
              <FeedbackForm projectToken={project.token} projectName={project.clientLabel} />
            </div>

            <div className="p-10 bg-stone-50 border border-stone-100 text-center rounded-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-ebony mb-4">Questions?</h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest leading-loose mb-8">Contact us directly for any questions about your project.</p>
              <a href="mailto:kpnjensen@gmail.com" className="text-brass text-[10px] font-black uppercase tracking-widest border-b border-brass transition-all hover:text-ebony hover:border-ebony pb-1">
                kpnjensen@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

