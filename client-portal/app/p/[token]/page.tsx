'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, store } from '@/lib/mockStore';
import ProjectStatusTimeline from '@/components/ProjectStatusTimeline';
import PaymentPanel from '@/components/PaymentPanel';
import FeedbackForm from '@/components/FeedbackForm';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = store.getProject(token);
    setProject(found);
    setLoading(false);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-site-gray-light">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-normal text-black">Project not found</h1>
          <p className="text-site-gray-light">The project code you entered does not exist.</p>
          <Link
            href="/project"
            className="relative inline-block bg-site-gold text-black py-3 px-8 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group"
          >
            <span className="relative z-10">Back to Project Lookup</span>
            <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal text-black">{project.clientLabel}</h1>
            <p className="text-sm text-site-gray-light mt-1">Project Code: {project.token}</p>
          </div>
          <Link
            href="/project"
            className="text-sm text-site-gray hover:text-black transition-colors"
          >
            ← Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 p-6">
            <ProjectStatusTimeline currentStatus={project.status} />
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <PaymentPanel
              depositPaid={project.depositPaid}
              finalPaid={project.finalPaid}
              venmoHandle={project.venmoHandle}
              paypalHandle={project.paypalHandle}
              projectName={project.clientLabel}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <FeedbackForm projectToken={project.token} projectName={project.clientLabel} />
        </div>
      </div>
    </div>
  );
}

