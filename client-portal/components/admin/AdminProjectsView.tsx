'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { Project } from '@/lib/mockStore';
import { store } from '@/lib/store';
import { useRouter } from 'next/navigation';
import AdminCreateProject from './AdminCreateProject';
import { Copy } from '@/components/icons';

interface AdminProjectsViewProps {
  projects: Project[];
  onUpdate: () => void;
}

export default function AdminProjectsView({ projects, onUpdate }: AdminProjectsViewProps) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
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
        // No photos to collect since status updates are removed
        const allPhotos: { url: string; name: string; isFeatured: boolean }[] = [];

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
    
    // If completing a project, clear selection so it disappears from the Active Projects view cleanly.
    if (newCompletionStatus && selectedProject?.token === token) {
      setSelectedProject(null);
      return;
    }

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


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Sidebar - Project List */}
      <div className="lg:col-span-1 space-y-4">
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
                    setIsCreatingProject(false);
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
        {isCreatingProject ? (
          <div className="bg-white p-10 border border-stone-200 shadow-sm rounded-sm animate-in fade-in slide-in-from-right-4">
            <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase text-brass mb-6">Create New Project</h2>
            <AdminCreateProject 
              isOpen={true}
              onClose={() => setIsCreatingProject(false)}
              onProjectCreated={() => {
                setIsCreatingProject(false);
                onUpdate();
              }} 
            />
          </div>
        ) : selectedProject ? (
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
              <div className="mb-10 pb-10 border-b border-stone-200 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">Deposit</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProject.depositPaid}
                        onChange={() => handlePaymentToggle(selectedProject.token, 'depositPaid')}
                        className="w-4 h-4 text-brass border-stone-300 focus:ring-brass rounded"
                      />
                      <span className="text-sm font-serif text-ebony">
                        {selectedProject.depositPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">Final Payment</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProject.finalPaid}
                        onChange={() => handlePaymentToggle(selectedProject.token, 'finalPaid')}
                        className="w-4 h-4 text-brass border-stone-300 focus:ring-brass rounded"
                      />
                      <span className="text-sm font-serif text-ebony">
                        {selectedProject.finalPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Completion / Move to Past Projects */}
                <div className="rounded-sm border border-brass/25 bg-brass/5 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-black uppercase tracking-[0.28em] text-brass">Move to Past Projects</div>
                    <div className="text-[12px] text-stone-600">
                      Marks this project complete.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompletionToggle(selectedProject.token)}
                    disabled={!!selectedProject.isCompleted}
                    className="px-4 py-2 bg-ebony text-white hover:bg-brass transition-all text-[10px] font-black uppercase tracking-widest shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {selectedProject.isCompleted ? 'Moved' : 'Move'}
                  </button>
                </div>
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
            <p className="text-stone-400 font-serif italic mt-4 mb-8">Choose a project from the list to view and edit details.</p>
            <button
              onClick={() => setIsCreatingProject(true)}
              className="px-6 py-3 bg-brass text-ebony hover:bg-ebony hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
            >
              Create New Project
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
