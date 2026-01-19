'use client';

import { useState, useEffect } from 'react';
import { Project, Feedback, ContactRequest } from '@/lib/mockStore';
import { store } from '@/lib/store';
import AdminTabs from '@/components/admin/AdminTabs';
import AdminProjectsView from '@/components/admin/AdminProjectsView';
import AdminTestimonials from '@/components/admin/AdminTestimonials';
import AdminAllFeedback from '@/components/admin/AdminAllFeedback';
import AdminContactRequests from '@/components/admin/AdminContactRequests';
import AdminMedia from '@/components/admin/AdminMedia';
import AdminPastProjects from '@/components/admin/AdminPastProjects';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import AdminLogin from '@/components/auth/AdminLogin';
import { LogOut } from '@/components/icons';

export default function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);

  const refreshProjects = async () => {
    const projects = await store.getAllProjects();
    setProjects(projects);
  };

  const refreshFeedback = async () => {
    const feedback = await store.getAllFeedback();
    setFeedback(feedback);
  };

  const refreshContactRequests = async () => {
    const requests = await store.getAllContactRequests();
    setContactRequests(requests);
  };

  useEffect(() => {
    if (isAdmin) {
      refreshProjects();
      refreshFeedback();
      refreshContactRequests();
    }
  }, [isAdmin]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brass mx-auto mb-4"></div>
          <p className="text-stone-400 font-serif italic">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated or not admin
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-serif font-light text-ebony mb-2">Admin Dashboard</h1>
              <div className="h-0.5 w-12 bg-brass mt-4"></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors inline-flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors inline-flex items-center gap-2"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'projects' && (
            <AdminProjectsView projects={projects} onUpdate={refreshProjects} />
          )}

          {activeTab === 'past-projects' && (
            <AdminPastProjects />
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

