'use client';

import { useState, useEffect } from 'react';
import { Project, Feedback, ContactRequest } from '@/lib/mockStore';
import { store } from '@/lib/store';
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

const tabs = [
  { id: 'projects', label: 'Projects' },
  { id: 'past-projects', label: 'Past Projects' },
  { id: 'feedback', label: 'Testimonials' },
  { id: 'contact', label: 'Contacts' },
  { id: 'media', label: 'Media' },
];

export default function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);

  useEffect(() => {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

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

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Unified admin header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 sm:h-14 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center group shrink-0">
              <img
                src="/images/JensenWoodworkingLogo.png"
                alt="Jensen Woodworking"
                className="h-8 sm:h-10 w-auto"
              />
            </Link>

            <div className="h-5 w-px bg-stone-200 shrink-0 hidden sm:block"></div>

            {/* Tab navigation */}
            <nav className="flex items-center gap-0 overflow-x-auto min-w-0 flex-1 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-2.5 sm:px-3 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] transition-colors shrink-0 whitespace-nowrap h-12 sm:h-14 flex items-center ${
                    activeTab === tab.id
                      ? 'text-ebony'
                      : 'text-stone-300 hover:text-stone-500'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass"></span>
                  )}
                </button>
              ))}
            </nav>

            {/* Auth area */}
            <div className="flex items-center gap-3 shrink-0 ml-auto">
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 truncate max-w-[120px] sm:max-w-[180px] hidden md:block">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors inline-flex items-center gap-1"
              >
                <LogOut size={11} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="bg-white rounded-sm border border-stone-200 shadow-sm">
          {activeTab === 'projects' && (
            <div className="p-3 sm:p-4 lg:p-5">
              <AdminProjectsView projects={projects} onUpdate={refreshProjects} />
            </div>
          )}

          {activeTab === 'past-projects' && (
            <div className="p-3 sm:p-4 lg:p-5">
              <AdminPastProjects />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="p-3 sm:p-4 lg:p-5 space-y-4">
              <AdminTestimonials feedback={feedback} onUpdate={refreshFeedback} />
              <AdminAllFeedback feedback={feedback} onUpdate={refreshFeedback} />
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="p-3 sm:p-4 lg:p-5">
              <AdminContactRequests contactRequests={contactRequests} onUpdate={refreshContactRequests} />
            </div>
          )}

          {activeTab === 'media' && (
            <div className="p-3 sm:p-4 lg:p-5">
              <AdminMedia />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
