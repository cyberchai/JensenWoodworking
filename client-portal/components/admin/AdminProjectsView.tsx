'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { Project, StatusUpdate, StatusUpdatePhoto } from '@/lib/mockStore';
import { store } from '@/lib/store';
import { useRouter } from 'next/navigation';
import AdminStatusUpdateForm from './AdminStatusUpdateForm';
import AdminStatusUpdateEditForm from './AdminStatusUpdateEditForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import AdminCreateProject from './AdminCreateProject';
import { Copy } from '@/components/icons';

interface AdminProjectsViewProps {
  projects: Project[];
  onUpdate: () => void;
}

export default function AdminProjectsView({ projects, onUpdate }: AdminProjectsViewProps) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingUpdate, setEditingUpdate] = useState<{ token: string; update: StatusUpdate } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ token: string; updateId: string; title: string } | null>(null);
  const [paymentPIN, setPaymentPIN] = useState('');
  const [isEditingPIN, setIsEditingPIN] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  
  // Use refs to preserve unsaved changes when saving other fields
  const preservedTitleRef = useRef<string | null>(null);
  const preservedDescriptionRef = useRef<string | null>(null);

  // Update payment PIN and edit fields when project changes
  // Only update edit fields if they're not currently being edited (to preserve unsaved changes)
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.token === selectedProject.token);
      if (project) {
        setSelectedProject(project);
        setPaymentPIN(project.paymentCode || '');
        // Only update edit fields if not currently editing them (preserve unsaved changes)
        // Also check if we have preserved values from a recent save
        if (!isEditingTitle) {
          if (preservedTitleRef.current !== null) {
            setEditTitle(preservedTitleRef.current);
            preservedTitleRef.current = null;
          } else {
            setEditTitle(project.clientLabel);
          }
        }
        if (!isEditingDescription) {
          if (preservedDescriptionRef.current !== null) {
            setEditDescription(preservedDescriptionRef.current);
            preservedDescriptionRef.current = null;
          } else {
            setEditDescription(project.description || '');
          }
        }
      }
    }
  }, [projects, selectedProject?.token, isEditingTitle, isEditingDescription]);

  const handlePaymentToggle = async (token: string, field: 'depositPaid' | 'finalPaid') => {
    const project = await store.getProject(token);
    if (project) {
      await store.updateProject(token, { [field]: !project[field] });
      onUpdate();
      if (selectedProject?.token === token) {
        const updated = await store.getProject(token);
        if (updated) setSelectedProject(updated);
      }
    }
  };

  const handleCompletionToggle = async (token: string) => {
    const project = await store.getProject(token);
    if (!project) return;

    const newCompletionStatus = !project.isCompleted;

    if (newCompletionStatus) {
      // Moving to past projects - create past project entry
      const existingPastProject = await store.getPastProjectByToken(token);
      
      if (!existingPastProject) {
        // Collect all photos from status updates
        const allPhotos: { url: string; name: string; isFeatured: boolean }[] = [];
        project.statusUpdates.forEach((update: StatusUpdate) => {
          update.photos.forEach(photo => {
            if (typeof photo === 'string') {
              allPhotos.push({ url: photo, name: 'Project Photo', isFeatured: false });
            } else {
              allPhotos.push({ url: photo.url, name: 'Project Photo', isFeatured: photo.isFeatured || false });
            }
          });
        });

        await store.createPastProject({
          projectToken: token,
          title: project.clientLabel,
          description: project.description,
          selectedImages: allPhotos.map(photo => ({
            url: photo.url,
            name: photo.name,
            isFeatured: photo.isFeatured,
          })),
        });
      }
    } else {
      // Moving back to active projects - delete past project entry
      const existingPastProject = await store.getPastProjectByToken(token);
      if (existingPastProject) {
        await store.deletePastProject(existingPastProject.id);
      }
    }

    // Update project completion status
    await store.updateProject(token, { isCompleted: newCompletionStatus });
    onUpdate();
    
    if (selectedProject?.token === token) {
      const updated = await store.getProject(token);
      if (updated) setSelectedProject(updated);
    }
  };

  const handleSavePIN = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    // Save paymentCode: if empty string, pass empty string to clear it; otherwise save trimmed value
    const pinValue = paymentPIN.trim();
    await store.updateProject(selectedProject.token, { 
      paymentCode: pinValue === '' ? '' : pinValue
    } as Partial<Project>);
    
    setIsEditingPIN(false);
    onUpdate();
    const updated = await store.getProject(selectedProject.token);
    if (updated) setSelectedProject(updated);
  };

  const handleSaveTitle = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !editTitle.trim()) return;
    
    // Preserve description edit state if it's being edited
    const wasEditingDescription = isEditingDescription;
    const preservedDescription = editDescription;
    
    await store.updateProject(selectedProject.token, { 
      clientLabel: editTitle.trim()
    });
    
    setIsEditingTitle(false);
    
    // Store preserved values in refs before updating (so useEffect can use them)
    if (wasEditingDescription) {
      preservedDescriptionRef.current = preservedDescription;
    }
    
    onUpdate();
    const updated = await store.getProject(selectedProject.token);
    if (updated) {
      setSelectedProject(updated);
      // Restore description edit state if it was being edited
      if (wasEditingDescription) {
        setIsEditingDescription(true);
      }
    }
  };

  const handleSaveDescription = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    // Preserve title edit state if it's being edited
    const wasEditingTitle = isEditingTitle;
    const preservedTitle = editTitle;
    
    await store.updateProject(selectedProject.token, { 
      description: editDescription.trim() || undefined
    });
    
    setIsEditingDescription(false);
    
    // Store preserved values in refs before updating (so useEffect can use them)
    if (wasEditingTitle) {
      preservedTitleRef.current = preservedTitle;
    }
    
    onUpdate();
    const updated = await store.getProject(selectedProject.token);
    if (updated) {
      setSelectedProject(updated);
      // Restore title edit state if it was being edited
      if (wasEditingTitle) {
        setIsEditingTitle(true);
      }
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
      if (selectedProject?.token === deleteConfirm.token) {
        const updated = await store.getProject(deleteConfirm.token);
        if (updated) setSelectedProject(updated);
      }
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
    if (selectedProject) {
      store.getProject(selectedProject.token).then((updated: Project | undefined) => {
        if (updated) setSelectedProject(updated);
      });
    }
  };

  const handleTogglePhotoFeatured = async (token: string, updateId: string, photoIndex: number) => {
    const project = await store.getProject(token);
    if (!project) return;

    const update = project.statusUpdates.find((u: StatusUpdate) => u.id === updateId);
    if (!update || !update.photos || photoIndex >= update.photos.length) return;

    const updatedPhotos = [...update.photos];
    const photo = updatedPhotos[photoIndex];
    
    if (typeof photo === 'string') {
      // Convert legacy string to StatusUpdatePhoto object with featured = true
      updatedPhotos[photoIndex] = {
        url: photo,
        isFeatured: true,
      };
    } else {
      // Toggle featured status
      updatedPhotos[photoIndex] = {
        ...photo,
        isFeatured: !photo.isFeatured,
      };
    }

    const updatedStatusUpdates = project.statusUpdates.map((u: StatusUpdate) =>
      u.id === updateId ? { ...u, photos: updatedPhotos } : u
    );

    await store.updateProject(token, { statusUpdates: updatedStatusUpdates });
    onUpdate();
    
    if (selectedProject?.token === token) {
      const updated = await store.getProject(token);
      if (updated) setSelectedProject(updated);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/client/p/${token}`;
    navigator.clipboard.writeText(link);
  };

  const copyToken = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token);
  };

  const copyProjectToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Sidebar - Project List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="mb-6 bg-white p-6 rounded-sm border border-stone-200 shadow-sm">
          <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase text-brass mb-4">Create New Project</h2>
          <AdminCreateProject 
            onProjectCreated={() => {
              onUpdate();
            }} 
          />
        </div>
        
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm">
          <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase text-brass mb-6">Active Projects</h2>

          {projects.filter(p => !p.isCompleted).length === 0 ? (
            <div className="p-8 border border-stone-200 text-center rounded-sm bg-stone-50">
              <p className="text-stone-400 text-sm font-serif italic">No current projects.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.filter(p => !p.isCompleted).map(project => (
                <div
                  key={project.token}
                  onClick={() => {
                    setSelectedProject(project);
                    setPaymentPIN(project.paymentCode || '');
                    setEditTitle(project.clientLabel);
                    setEditDescription(project.description || '');
                    setIsEditingPIN(false);
                    setIsEditingTitle(false);
                    setIsEditingDescription(false);
                    // Clear preserved refs when switching projects
                    preservedTitleRef.current = null;
                    preservedDescriptionRef.current = null;
                  }}
                  className={`p-6 border-l-4 transition-all cursor-pointer rounded-sm ${
                    selectedProject?.token === project.token 
                      ? 'border-brass bg-stone-50 shadow-sm border border-stone-200' 
                      : 'border-transparent bg-stone-50 hover:bg-white hover:border-stone-200 border'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-serif text-xl text-ebony">{project.clientLabel}</h3>
                    <button 
                      onClick={(e) => copyToken(project.token, e)} 
                      className="text-stone-300 hover:text-brass transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Token: {project.token}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Project Details */}
      <div className="lg:col-span-2 space-y-10">
        {selectedProject ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            {/* Project Header */}
            <div className="bg-white p-10 border border-stone-200 shadow-sm rounded-sm">
              <div className="flex justify-between items-end mb-10 pb-6 border-b border-stone-200">
                <div className="flex-1">
                  {isEditingTitle ? (
                    <form onSubmit={handleSaveTitle} className="space-y-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-3xl font-serif text-ebony mb-2 w-full border-b-2 border-stone-300 focus:border-brass focus:outline-none bg-transparent pb-2"
                        placeholder="Project Title"
                        required
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-brass text-ebony hover:bg-ebony hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
                        >
                          Save Title
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingTitle(false);
                            setEditTitle(selectedProject.clientLabel);
                          }}
                          className="px-6 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all text-[11px] font-black uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start gap-2">
                      <h2 className="text-3xl font-serif text-ebony mb-2">{selectedProject.clientLabel}</h2>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="text-[9px] font-black uppercase tracking-widest text-brass hover:text-ebony mt-2"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => copyProjectToken(selectedProject.token)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-bold tracking-widest text-brass uppercase hover:text-ebony hover:bg-brass/10 border border-transparent hover:border-brass/30 transition-all cursor-pointer relative group"
                    title="Click to copy token"
                  >
                    <span>Project Token: {selectedProject.token}</span>
                    <Copy 
                      size={12} 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-brass" 
                    />
                    {tokenCopied && (
                      <span className="absolute left-0 top-full mt-2 px-2 py-1 bg-brass text-ebony text-[9px] font-black uppercase tracking-widest whitespace-nowrap rounded-sm shadow-sm z-10">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
                <div className="text-right">
                  {isEditingPIN ? (
                    <form onSubmit={handleSavePIN} className="flex items-end gap-2">
                      <div>
                        <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1 block">Payment PIN</label>
                        <input
                          type="text"
                          value={paymentPIN}
                          onChange={(e) => setPaymentPIN(e.target.value)}
                          placeholder="1234"
                          className="text-xl font-serif tracking-[0.2em] border-b border-stone-200 focus:border-brass focus:outline-none w-24 text-center"
                          maxLength={10}
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          className="text-[10px] font-black uppercase tracking-widest text-brass hover:text-ebony"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPIN(false);
                            setPaymentPIN(selectedProject.paymentCode || '');
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">Payment PIN</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-serif tracking-[0.2em]">
                          {selectedProject.paymentCode || 'Not set'}
                        </div>
                        <button
                          onClick={() => setIsEditingPIN(true)}
                          className="text-[9px] font-black uppercase tracking-widest text-brass hover:text-ebony"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Deposit Status</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProject.depositPaid}
                      onChange={() => handlePaymentToggle(selectedProject.token, 'depositPaid')}
                      className="w-5 h-5 text-brass border-stone-300 focus:ring-brass rounded"
                    />
                    <span className="text-sm font-serif text-ebony">
                      {selectedProject.depositPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Final Payment Status</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProject.finalPaid}
                      onChange={() => handlePaymentToggle(selectedProject.token, 'finalPaid')}
                      className="w-5 h-5 text-brass border-stone-300 focus:ring-brass rounded"
                    />
                    <span className="text-sm font-serif text-ebony">
                      {selectedProject.finalPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Project Completion */}
              <div className="mb-10 pb-10 border-b border-stone-200">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 block">Project Completion</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProject.isCompleted || false}
                    onChange={() => handleCompletionToggle(selectedProject.token)}
                    className="w-5 h-5 text-brass border-stone-300 focus:ring-brass rounded"
                  />
                  <span className="text-sm font-serif text-ebony">
                    {selectedProject.isCompleted ? 'Project Completed' : 'Mark as Completed'}
                  </span>
                </label>
                {selectedProject.isCompleted && (
                  <p className="text-xs text-stone-400 mt-2 ml-8">
                    This project has been moved to Past Projects. You can manage it from the Past Projects tab.
                  </p>
                )}
              </div>

              {/* Project Description */}
              <div className="mb-10 pb-10 border-b border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Project Description</label>
                  {!isEditingDescription && (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="text-[9px] font-black uppercase tracking-widest text-brass hover:text-ebony"
                    >
                      {selectedProject.description ? 'Edit' : 'Add'}
                    </button>
                  )}
                </div>
                {isEditingDescription ? (
                  <form onSubmit={handleSaveDescription} className="space-y-4">
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full text-stone-600 font-serif italic text-lg border-2 border-stone-300 focus:border-brass focus:outline-none p-4 bg-stone-50 min-h-[120px] resize-y rounded-sm"
                      placeholder="Add a project description..."
                    />
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-brass text-ebony hover:bg-ebony hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
                      >
                        Save Description
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingDescription(false);
                          setEditDescription(selectedProject.description || '');
                        }}
                        className="px-6 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all text-[11px] font-black uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-stone-600 font-serif italic text-lg">
                    {selectedProject.description || <span className="text-stone-400">No description added yet.</span>}
                  </p>
                )}
              </div>

              {/* Add Status Update Form */}
              <div className="mb-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-brass mb-6">Add Status Update</h3>
                <AdminStatusUpdateForm 
                  projectToken={selectedProject.token} 
                  onUpdateAdded={() => {
                    onUpdate();
                    store.getProject(selectedProject.token).then((updated: Project | undefined) => {
                      if (updated) setSelectedProject(updated);
                    });
                  }} 
                />
              </div>

              {/* Status Updates List */}
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-brass mb-6">
                  Status Updates ({selectedProject.statusUpdates.length})
                </h3>
                
                {selectedProject.statusUpdates.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-sm bg-stone-50">
                    <p className="text-stone-300 font-serif italic">No status updates yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProject.statusUpdates
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((update) => {
                        const isEditing = editingUpdate?.token === selectedProject.token && editingUpdate?.update.id === update.id;
                        
                        if (isEditing) {
                          return (
                            <AdminStatusUpdateEditForm
                              key={update.id}
                              projectToken={selectedProject.token}
                              update={update}
                              onUpdateSaved={handleEditSave}
                              onCancel={handleEditCancel}
                            />
                          );
                        }

                        return (
                          <div key={update.id} className="border border-stone-200 p-6 bg-stone-50 rounded-sm shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-xl font-serif text-ebony mb-2">{update.title}</h4>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">
                                  {formatDate(update.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleEditClick(selectedProject.token, update)}
                                  className="text-[10px] font-black uppercase tracking-widest text-brass hover:text-ebony transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(selectedProject.token, update.id, update.title)}
                                  className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <p className="text-stone-600 font-serif italic text-lg leading-relaxed mb-4">
                              "{update.message}"
                            </p>
                            {update.photos && update.photos.length > 0 && (
                              <div className="mt-4 space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                  {update.photos.map((photo, photoIndex) => {
                                    const photoUrl = typeof photo === 'string' ? photo : photo.url;
                                    const isFeatured = typeof photo === 'object' ? (photo.isFeatured || false) : false;
                                    return (
                                      <div key={photoIndex} className="relative group">
                                        <div className="aspect-square bg-stone-100 rounded-sm overflow-hidden">
                                          <img
                                            src={photoUrl}
                                            alt={`${update.title} - Photo ${photoIndex + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <button
                                          onClick={() => handleTogglePhotoFeatured(selectedProject.token, update.id, photoIndex)}
                                          className={`absolute top-2 right-2 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 border rounded-full transition-all ${
                                            isFeatured
                                              ? 'border-brass text-brass bg-brass/90 hover:bg-brass'
                                              : 'border-white/80 text-white bg-black/50 hover:bg-black/70'
                                          }`}
                                        >
                                          {isFeatured ? 'Featured' : 'Hidden'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-stone-200 mt-10">
                <button
                  onClick={() => copyLink(selectedProject.token)}
                  className="flex-1 px-6 py-3 bg-stone-100 text-ebony text-[11px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all"
                >
                  Copy Project Link
                </button>
                <button
                  onClick={() => router.push(`/client/p/${selectedProject.token}`)}
                  className="flex-1 px-6 py-3 bg-ebony text-white text-[11px] font-black uppercase tracking-widest hover:bg-brass transition-all shadow-xl"
                >
                  View Client View
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-sm p-20 text-center bg-white">
            <h3 className="text-2xl font-serif text-stone-300">Select a Project to Manage</h3>
            <p className="text-stone-400 font-serif italic mt-4">Choose a project from the list to view and edit details.</p>
          </div>
        )}
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
