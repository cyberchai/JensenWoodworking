'use client';

import { useState } from 'react';
import { Project, ProjectStatus, store } from '@/lib/mockStore';
import { useRouter } from 'next/navigation';

interface AdminProjectListProps {
  projects: Project[];
  onUpdate: () => void;
}

export default function AdminProjectList({ projects, onUpdate }: AdminProjectListProps) {
  const router = useRouter();

  const handleStatusChange = (token: string, newStatus: ProjectStatus) => {
    store.updateProject(token, { status: newStatus });
    onUpdate();
  };

  const handlePaymentToggle = (token: string, field: 'depositPaid' | 'finalPaid') => {
    const project = store.getProject(token);
    if (project) {
      store.updateProject(token, { [field]: !project[field] });
      onUpdate();
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/client/p/${token}`;
    navigator.clipboard.writeText(link);
  };

  const openProject = (token: string) => {
    router.push(`/client/p/${token}`);
  };

  return (
    <div className="bg-white border border-gray-200 p-6 space-y-6">
      <h2 className="text-xl font-normal text-black">Projects</h2>
      
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.token}
            className="border border-gray-200 p-4 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-normal text-black">{project.clientLabel}</h3>
                <p className="text-sm text-site-gray-light mt-1">Token: {project.token}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-site-gray mb-1 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project.token, e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 text-sm border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
                >
                  {store.getStatusOrder().map((s) => (
                    <option key={s} value={s}>
                      {store.getStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-normal text-site-gray mb-1 uppercase tracking-wide">
                  Payments
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={project.depositPaid}
                      onChange={() => handlePaymentToggle(project.token, 'depositPaid')}
                      className="w-4 h-4 text-site-gold border-gray-300 focus:ring-site-gold"
                    />
                    <span className="text-site-gray">Deposit</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={project.finalPaid}
                      onChange={() => handlePaymentToggle(project.token, 'finalPaid')}
                      className="w-4 h-4 text-site-gold border-gray-300 focus:ring-site-gold"
                    />
                    <span className="text-site-gray">Final</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => copyLink(project.token)}
                className="flex-1 px-4 py-2 bg-gray-200 text-site-gray hover:bg-site-gold hover:text-black transition-colors text-sm font-normal uppercase"
              >
                Copy Link
              </button>
              <button
                onClick={() => openProject(project.token)}
                className="relative flex-1 bg-site-gold text-black py-2 px-4 font-normal uppercase overflow-hidden transition-all duration-300 hover:text-white group text-sm"
              >
                <span className="relative z-10">Open</span>
                <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

