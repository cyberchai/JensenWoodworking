'use client';

import { useState, useEffect } from 'react';
import { Project, Feedback, ContactRequest, store } from '@/lib/mockStore';
import AdminTabs from '@/components/admin/AdminTabs';
import AdminCreateProject from '@/components/admin/AdminCreateProject';
import AdminProjectList from '@/components/admin/AdminProjectList';
import AdminTestimonials from '@/components/admin/AdminTestimonials';
import AdminAllFeedback from '@/components/admin/AdminAllFeedback';
import AdminContactRequests from '@/components/admin/AdminContactRequests';
import AdminMedia from '@/components/admin/AdminMedia';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);

  const refreshProjects = () => {
    setProjects(store.getAllProjects());
  };

  const refreshFeedback = () => {
    setFeedback(store.getAllFeedback());
  };

  const refreshContactRequests = () => {
    setContactRequests(store.getAllContactRequests());
  };

  useEffect(() => {
    refreshProjects();
    refreshFeedback();
    refreshContactRequests();
  }, []);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-normal text-black">Admin Dashboard</h1>
          <Link
            href="/client/project"
            className="text-sm text-site-gray hover:text-black transition-colors"
          >
            ← Back to Project Lookup
          </Link>
        </div>

        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <AdminCreateProject onProjectCreated={refreshProjects} />
              <AdminProjectList projects={projects} onUpdate={refreshProjects} />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <AdminTestimonials feedback={feedback} onUpdate={refreshFeedback} />
              <AdminAllFeedback feedback={feedback} onUpdate={refreshFeedback} />
            </div>
          )}

          {activeTab === 'contact' && (
            <AdminContactRequests contactRequests={contactRequests} onUpdate={refreshContactRequests} />
          )}

          {activeTab === 'media' && (
            <AdminMedia />
          )}
        </AdminTabs>
      </div>
    </div>
  );
}

