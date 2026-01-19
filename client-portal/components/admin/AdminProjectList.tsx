'use client';

import { useState } from 'react';
import { Project, StatusUpdate, StatusUpdatePhoto } from '@/lib/mockStore';
import { store } from '@/lib/store';
import { useRouter } from 'next/navigation';
import AdminStatusUpdateForm from './AdminStatusUpdateForm';
import AdminStatusUpdateEditForm from './AdminStatusUpdateEditForm';
import DeleteConfirmModal from './DeleteConfirmModal';

interface AdminProjectListProps {
  projects: Project[];
  onUpdate: () => void;
}

export default function AdminProjectList({ projects, onUpdate }: AdminProjectListProps) {
  const router = useRouter();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [editingUpdate, setEditingUpdate] = useState<{ token: string; update: StatusUpdate } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ token: string; updateId: string; title: string } | null>(null);

  const toggleExpanded = (token: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(token)) {
      newExpanded.delete(token);
    } else {
      newExpanded.add(token);
    }
    setExpandedProjects(newExpanded);
  };

  const handlePaymentToggle = async (token: string, field: 'depositPaid' | 'finalPaid') => {
    const project = await store.getProject(token);
    if (project) {
      await store.updateProject(token, { [field]: !project[field] });
      onUpdate();
    }
  };

  const handleDeleteClick = (token: string, updateId: string, title: string) => {
    setDeleteConfirm({ token, updateId, title });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      await store.deleteStatusUpdate(deleteConfirm.token, deleteConfirm.updateId);
      setDeleteConfirm(null);
      onUpdate();
    }
  };

  const handleEditClick = (token: string, update: StatusUpdate) => {
    setEditingUpdate({ token, update });
  };

  const handleEditCancel = () => {
    setEditingUpdate(null);
  };

  const handleEditSave = () => {
    setEditingUpdate(null);
    onUpdate();
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/client/p/${token}`;
    navigator.clipboard.writeText(link);
  };

  const openProject = (token: string) => {
    router.push(`/client/p/${token}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-normal text-black uppercase tracking-wide">
                  Status Updates ({project.statusUpdates.length})
                </h4>
                <button
                  onClick={() => toggleExpanded(project.token)}
                  className="text-xs text-site-gray hover:text-black transition-colors uppercase"
                >
                  {expandedProjects.has(project.token) ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {expandedProjects.has(project.token) && (
                <div className="space-y-4">
                  <AdminStatusUpdateForm projectToken={project.token} onUpdateAdded={onUpdate} />
                  
                  {project.statusUpdates.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {project.statusUpdates
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((update) => {
                          const isEditing = editingUpdate?.token === project.token && editingUpdate?.update.id === update.id;
                          
                          if (isEditing) {
                            return (
                              <AdminStatusUpdateEditForm
                                key={update.id}
                                projectToken={project.token}
                                update={update}
                                onUpdateSaved={handleEditSave}
                                onCancel={handleEditCancel}
                              />
                            );
                          }

                          return (
                            <div key={update.id} className="border border-gray-200 p-3 space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-normal text-black">{update.title}</p>
                                  <p className="text-xs text-site-gray-light mt-1">
                                    {formatDate(update.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleEditClick(project.token, update)}
                                    className="text-xs text-brass hover:text-ebony transition-colors font-black uppercase tracking-widest"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(project.token, update.id, update.title)}
                                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-site-gray-light leading-relaxed">
                                {update.message}
                              </p>
                              {update.photos && update.photos.length > 0 && (
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  {update.photos.map((photo, photoIndex) => {
                                    const photoUrl = typeof photo === 'string' ? photo : photo.url;
                                    return (
                                      <div key={photoIndex} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                        <img
                                          src={photoUrl}
                                          alt={`${update.title} - Photo ${photoIndex + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-200">
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

      <DeleteConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Status Update"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

