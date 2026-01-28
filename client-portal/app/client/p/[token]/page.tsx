'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/lib/mockStore';
import { store } from '@/lib/store';
import PaymentPanel from '@/components/client/PaymentPanel';
import FeedbackForm from '@/components/client/FeedbackForm';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [payCode, setPayCode] = useState('');
  const [payError, setPayError] = useState(false);
  const [payAuthorized, setPayAuthorized] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      const found = await store.getProject(token);
      setProject(found ?? null);
      // If no payment PIN is set, automatically authorize payment access
      if (found && !found.paymentCode) {
        setPayAuthorized(true);
      }
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
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto space-y-16 px-6 lg:px-12 py-12">
        <div className="bg-white p-8 lg:p-10 rounded-sm border border-stone-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-stone-200">
            <div className="space-y-4">
              <button
                onClick={() => router.push('/client/project')}
                className="text-[10px] font-black uppercase tracking-widest text-stone-300 hover:text-brass transition-colors"
              >
                ← Back to Project Lookup
              </button>
              <h2 className="text-5xl font-serif text-ebony tracking-tighter leading-none">{project.clientLabel}</h2>
              <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brass">
                <span>Project Code: {project.token}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 1) Payment information (keep logic as-is) */}
          <div className="bg-white p-10 lg:p-12 shadow-lg border border-stone-200 rounded-sm">
            {!payAuthorized && project.paymentCode ? (
              <div className="text-center space-y-8">
                <h3 className="text-3xl font-serif text-ebony">Payment Access</h3>
                <p className="text-stone-400 font-serif italic text-lg max-w-sm mx-auto">
                  Access to payment information requires your project PIN code.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const projectPaymentCode = project.paymentCode || '';
                    // If no PIN is set, allow access; otherwise require matching PIN
                    if (!projectPaymentCode || payCode === projectPaymentCode) {
                      setPayAuthorized(true);
                      setPayError(false);
                    } else {
                      setPayError(true);
                    }
                  }}
                  className="max-w-xs mx-auto space-y-8"
                >
                  <input
                    type="password"
                    placeholder="••••"
                    value={payCode}
                    onChange={(e) => setPayCode(e.target.value)}
                    className="w-full text-center py-4 bg-stone-50 border-b-2 border-stone-200 text-3xl tracking-[1em] focus:outline-none focus:border-brass"
                  />
                  {payError && (
                    <p className="text-red-500 text-[10px] font-black tracking-widest uppercase">Invalid Code</p>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-ebony text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-brass transition-all"
                  >
                    Verify & Enter
                  </button>
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

          {/* 2) Share your feedback */}
          <div className="bg-white p-10 lg:p-12 border border-stone-200 shadow-sm rounded-sm">
            <h3 className="text-3xl font-serif text-ebony mb-8">Share Your Feedback</h3>
            <FeedbackForm projectToken={project.token} projectName={project.clientLabel} />
          </div>
        </div>
      </div>
    </div>
  );
}

