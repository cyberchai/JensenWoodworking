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
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12 bg-white p-6 sm:p-8 rounded-sm border border-stone-200 shadow-sm min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl font-serif font-light text-ebony mb-2">Admin Dashboard</h1>
              <div className="h-0.5 w-12 bg-brass mt-4"></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
              <span className="text-[11px] md:text-[13px] font-black uppercase tracking-widest text-stone-400 min-w-0 truncate max-w-full sm:max-w-none">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-[12px] md:text-[13px] font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto py-2 min-h-[44px] items-center"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors inline-flex items-center gap-2 min-h-[44px]"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-stone-200 shadow-sm">
          <AdminTabs activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'projects' && (
              <div className="p-4 sm:p-6 lg:p-8">
                <AdminProjectsView projects={projects} onUpdate={refreshProjects} />
              </div>
            )}

            {activeTab === 'past-projects' && (
              <div className="p-4 sm:p-6 lg:p-8">
                <AdminPastProjects />
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <AdminTestimonials feedback={feedback} onUpdate={refreshFeedback} />
                <AdminAllFeedback feedback={feedback} onUpdate={refreshFeedback} />
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="p-4 sm:p-6 lg:p-8">
                <AdminContactRequests contactRequests={contactRequests} onUpdate={refreshContactRequests} />
              </div>
            )}

            {activeTab === 'media' && (
              <div className="p-4 sm:p-6 lg:p-8">
                <AdminMedia />
              </div>
            )}
          </AdminTabs>
        </div>
      </div>
    </div>
  );
}

