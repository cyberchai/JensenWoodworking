'use client';

import { useState, useEffect } from 'react';
import { Project, Feedback, store } from '@/lib/mockStore';
import AdminCreateProject from '@/components/AdminCreateProject';
import AdminProjectList from '@/components/AdminProjectList';
import AdminFeedbackList from '@/components/AdminFeedbackList';
import Link from 'next/link';

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  const refreshProjects = () => {
    setProjects(store.getAllProjects());
  };

  const refreshFeedback = () => {
    setFeedback(store.getAllFeedback());
  };

  useEffect(() => {
    refreshProjects();
    refreshFeedback();
  }, []);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-normal text-black">Admin Dashboard</h1>
          <Link
            href="/project"
            className="text-sm text-site-gray hover:text-black transition-colors"
          >
            ← Back to Project Lookup
          </Link>
        </div>

        <AdminCreateProject onProjectCreated={refreshProjects} />

        <AdminProjectList projects={projects} onUpdate={refreshProjects} />

        <AdminFeedbackList feedback={feedback} onUpdate={refreshFeedback} />
      </div>
    </div>
  );
}

