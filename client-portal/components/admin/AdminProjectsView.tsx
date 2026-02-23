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
  const [linkCopied, setLinkCopied] = useState(false);
  const [editProjectType, setEditProjectType] = useState<string[]>([]);

  const preservedTitleRef = useRef<string | null>(null);
  const preservedDescriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.token === selectedProject.token);
      if (project) {
        setSelectedProject(project);
        setPaymentPIN(project.paymentCode || '');
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
      const existingPastProject = await store.getPastProjectByToken(token);
      if (!existingPastProject) {
        await store.createPastProject({
          projectToken: token,
          title: project.clientLabel,
          description: project.description,
          projectType: project.projectType,
          selectedImages: [],
        });
      }
    } else {
      const existingPastProject = await store.getPastProjectByToken(token);
      if (existingPastProject) {
        await store.deletePastProject(existingPastProject.id);
      }
    }

    await store.updateProject(token, { isCompleted: newCompletionStatus });
    onUpdate();

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
    const wasEditingDescription = isEditingDescription;
    const preservedDescription = editDescription;
    await store.updateProject(selectedProject.token, { clientLabel: editTitle.trim() });
    setIsEditingTitle(false);
    if (wasEditingDescription) preservedDescriptionRef.current = preservedDescription;
    onUpdate();
    const updated = await store.getProject(selectedProject.token);
    if (updated) {
      setSelectedProject(updated);
      if (wasEditingDescription) setIsEditingDescription(true);
    }
  };

  const handleSaveDescription = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    const wasEditingTitle = isEditingTitle;
    const preservedTitle = editTitle;
    await store.updateProject(selectedProject.token, { description: editDescription.trim() || undefined });
    setIsEditingDescription(false);
    if (wasEditingTitle) preservedTitleRef.current = preservedTitle;
    onUpdate();
    const updated = await store.getProject(selectedProject.token);
    if (updated) {
      setSelectedProject(updated);
      if (wasEditingTitle) setIsEditingTitle(true);
    }
  };

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/client/p/${token}`;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const copyToken = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token);
  };

  const copyProjectToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    setIsCreatingProject(false);
    setPaymentPIN(project.paymentCode || '');
    setEditTitle(project.clientLabel);
    setEditDescription(project.description || '');
    setEditProjectType(project.projectType || []);
    setIsEditingPIN(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    preservedTitleRef.current = null;
    preservedDescriptionRef.current = null;
  };

  const handleSaveProjectType = async (types: string[]) => {
    if (!selectedProject) return;
    setEditProjectType(types);
    await store.updateProject(selectedProject.token, { projectType: types.length > 0 ? types : undefined });
    onUpdate();
    const updated = await store.getProject(selectedProject.token);
    if (updated) setSelectedProject(updated);
  };

  const activeProjects = projects.filter(p => !p.isCompleted);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-w-0">
      {/* Left Sidebar */}
      <div className="lg:col-span-1 min-w-0 lg:border-r border-stone-100">
        <div className="p-3 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Active Projects</h2>
              <span className="text-[10px] text-stone-400">{activeProjects.length}</span>
            </div>
            <button
              onClick={() => { setIsCreatingProject(true); setSelectedProject(null); }}
              className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors"
            >
              + New
            </button>
          </div>

          {activeProjects.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-stone-400 text-xs font-serif italic">No active projects.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {activeProjects.map(project => (
                <div
                  key={project.token}
                  onClick={() => selectProject(project)}
                  className={`px-2.5 py-2 transition-all cursor-pointer rounded-sm min-w-0 flex items-center justify-between gap-2 ${
                    selectedProject?.token === project.token
                      ? 'bg-stone-100 border-l-2 border-brass'
                      : 'hover:bg-stone-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-ebony truncate">{project.clientLabel}</div>
                    <div className="text-[9px] text-stone-400 tracking-wider">{project.token}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {project.depositPaid && project.finalPaid ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Fully paid"></span>
                    ) : project.depositPaid ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Deposit paid"></span>
                    ) : null}
                    <button
                      onClick={(e) => copyToken(project.token, e)}
                      className="text-stone-300 hover:text-brass transition-colors p-0.5"
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="lg:col-span-2 min-w-0">
        {isCreatingProject ? (
          <div className="p-3 min-w-0">
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
          <div className="min-w-0 overflow-hidden p-3">
            {/* Header: Title + Token + PIN */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <form onSubmit={handleSaveTitle} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-sm font-bold text-ebony flex-1 border-b border-stone-300 focus:border-brass focus:outline-none bg-transparent pb-0.5"
                      placeholder="Project Title"
                      required
                      autoFocus
                    />
                    <button type="submit" className="text-[8px] font-black uppercase tracking-widest text-brass hover:text-ebony">Save</button>
                    <button type="button" onClick={() => { setIsEditingTitle(false); setEditTitle(selectedProject.clientLabel); }} className="text-[8px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony">Cancel</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-ebony">{selectedProject.clientLabel}</h2>
                    <button onClick={() => setIsEditingTitle(true)} className="text-[8px] font-black uppercase tracking-widest text-stone-400 hover:text-brass">Edit</button>
                  </div>
                )}
                <button
                  onClick={() => copyProjectToken(selectedProject.token)}
                  className="inline-flex items-center gap-1 mt-0.5 text-[9px] tracking-wider text-stone-400 hover:text-brass transition-colors group"
                  title="Click to copy token"
                >
                  <span>{selectedProject.token}</span>
                  <Copy size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  {tokenCopied && <span className="text-brass font-bold">Copied!</span>}
                </button>
              </div>

              <div className="shrink-0">
                {isEditingPIN ? (
                  <form onSubmit={handleSavePIN} className="flex items-center gap-1.5">
                    <span className="text-[9px] text-stone-400 uppercase tracking-wider">PIN</span>
                    <input
                      type="text"
                      value={paymentPIN}
                      onChange={(e) => setPaymentPIN(e.target.value)}
                      placeholder="1234"
                      className="text-xs font-bold tracking-widest border-b border-stone-200 focus:border-brass focus:outline-none w-12 text-center"
                      maxLength={10}
                      autoFocus
                    />
                    <button type="submit" className="text-[8px] font-black uppercase tracking-widest text-brass hover:text-ebony">Save</button>
                    <button type="button" onClick={() => { setIsEditingPIN(false); setPaymentPIN(selectedProject.paymentCode || ''); }} className="text-[8px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony">Cancel</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-stone-400 uppercase tracking-wider">PIN</span>
                    <span className="text-xs font-bold tracking-widest">{selectedProject.paymentCode || '—'}</span>
                    <button onClick={() => setIsEditingPIN(true)} className="text-[8px] font-black uppercase tracking-widest text-stone-400 hover:text-brass">Edit</button>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Status + Actions */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 pb-3 border-b border-stone-100">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProject.depositPaid}
                  onChange={() => handlePaymentToggle(selectedProject.token, 'depositPaid')}
                  className="w-3 h-3 text-brass border-stone-300 focus:ring-brass rounded"
                />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedProject.depositPaid ? 'text-emerald-600' : 'text-stone-400'}`}>
                  Deposit {selectedProject.depositPaid ? 'Paid' : 'Unpaid'}
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProject.finalPaid}
                  onChange={() => handlePaymentToggle(selectedProject.token, 'finalPaid')}
                  className="w-3 h-3 text-brass border-stone-300 focus:ring-brass rounded"
                />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedProject.finalPaid ? 'text-emerald-600' : 'text-stone-400'}`}>
                  Final {selectedProject.finalPaid ? 'Paid' : 'Unpaid'}
                </span>
              </label>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => copyLink(selectedProject.token)}
                  className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors"
                >
                  {linkCopied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => router.push(`/client/p/${selectedProject.token}`)}
                  className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-ebony text-white hover:bg-brass transition-all rounded-sm"
                >
                  View Client Page
                </button>
              </div>
            </div>

            {/* Project Type */}
            <div className="mb-3 pb-3 border-b border-stone-100">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mr-3">Type</span>
              <div className="inline-flex flex-wrap gap-1 mt-1">
                {['Island Top', 'Bar Top', 'Counter Top', 'Mantel', 'Table', 'Charcuterie Board', 'Other'].map((t) => {
                  const active = editProjectType.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const next = active ? editProjectType.filter(v => v !== t) : [...editProjectType, t];
                        handleSaveProjectType(next);
                      }}
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                        active
                          ? 'border-brass bg-brass/15 text-brass'
                          : 'border-stone-200 text-stone-400 hover:border-stone-300'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="mb-3 pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Description</span>
                {!isEditingDescription && (
                  <button onClick={() => setIsEditingDescription(true)} className="text-[8px] font-black uppercase tracking-widest text-stone-400 hover:text-brass">
                    {selectedProject.description ? 'Edit' : 'Add'}
                  </button>
                )}
              </div>
              {isEditingDescription ? (
                <form onSubmit={handleSaveDescription} className="space-y-2">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full text-xs text-stone-600 border-0 border-b border-stone-200 focus:border-brass focus:outline-none bg-transparent min-h-[60px] resize-y"
                    placeholder="Add a project description..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-brass text-white hover:bg-ebony transition-all">Save</button>
                    <button type="button" onClick={() => { setIsEditingDescription(false); setEditDescription(selectedProject.description || ''); }} className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony">Cancel</button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-stone-500 font-serif italic leading-relaxed">
                  {selectedProject.description || <span className="text-stone-300">No description.</span>}
                </p>
              )}
            </div>

            {/* Move to Past Projects */}
            <div className="flex items-center justify-between gap-3 bg-stone-50 rounded-sm px-3 py-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">Move to Past Projects</span>
                <span className="text-[10px] text-stone-400 ml-2">Marks this project complete</span>
              </div>
              <button
                type="button"
                onClick={() => handleCompletionToggle(selectedProject.token)}
                disabled={!!selectedProject.isCompleted}
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-ebony text-white hover:bg-brass transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedProject.isCompleted ? 'Moved' : 'Complete'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center min-w-0">
            <p className="text-stone-300 font-serif italic text-sm mb-3">Select a project or create a new one.</p>
            <button
              onClick={() => setIsCreatingProject(true)}
              className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-brass text-white hover:bg-ebony transition-all rounded-sm"
            >
              Create New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
