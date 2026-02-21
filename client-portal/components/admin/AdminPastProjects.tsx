'use client';

import { useState, useEffect, FormEvent } from 'react';
import { PastProject, PastProjectImage } from '@/lib/mockStore';
import { store } from '@/lib/store';
import DeleteConfirmModal from './DeleteConfirmModal';

interface MediaItem {
  id: string;
  fileId: string;
  name: string;
  url: string;
  uploadedAt: number;
  size?: number;
  width?: number;
  height?: number;
}

export default function AdminPastProjects() {
  const [pastProjects, setPastProjects] = useState<PastProject[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<PastProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editProjectType, setEditProjectType] = useState('');
  const [selectedImages, setSelectedImages] = useState<PastProjectImage[]>([]);
  const [isFeaturedOnHomePage, setIsFeaturedOnHomePage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projects, media] = await Promise.all([
        store.getAllPastProjects(),
        loadMediaItems(),
      ]);
      setPastProjects(projects);
      setMediaItems(media);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMediaItems = (): Promise<MediaItem[]> => {
    return new Promise((resolve) => {
      const stored = localStorage.getItem('imagekit_media');
      if (stored) {
        try {
          resolve(JSON.parse(stored));
        } catch (e) {
          console.error('Error loading stored media:', e);
          resolve([]);
        }
      } else {
        resolve([]);
      }
    });
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingProject(null);
    setEditTitle('');
    setEditDescription('');
    setEditProjectType('');
    setSelectedImages([]);
    setIsFeaturedOnHomePage(false);
    setShowImageSelector(false);
  };

  const handleEdit = (project: PastProject) => {
    setEditingProject(project);
    setIsCreating(false);
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    setEditProjectType(project.projectType || '');
    setSelectedImages([...project.selectedImages]);
    setIsFeaturedOnHomePage(project.isFeaturedOnHomePage || false);
    setShowImageSelector(false);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setIsCreating(false);
    setEditTitle('');
    setEditDescription('');
    setEditProjectType('');
    setSelectedImages([]);
    setIsFeaturedOnHomePage(false);
    setShowImageSelector(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    if (isCreating) {
      await store.createPastProject({
        projectToken: `manual_${Date.now()}`,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        projectType: editProjectType || undefined,
        selectedImages,
        isFeaturedOnHomePage,
      });
    } else if (editingProject) {
      await store.updatePastProject(editingProject.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        projectType: editProjectType || undefined,
        selectedImages,
        isFeaturedOnHomePage,
      });
    }

    await loadData();
    handleCancelEdit();
  };

  const handleMoveToActiveProjects = async () => {
    if (!editingProject) return;
    // Only supported for past projects that correspond to a real project
    if (editingProject.projectToken.startsWith('manual_')) return;

    // Move back to active projects:
    // 1) Mark the underlying project as active (isCompleted=false)
    // 2) Remove the past project record
    await store.updateProject(editingProject.projectToken, { isCompleted: false });
    await store.deletePastProject(editingProject.id);
    await loadData();
    handleCancelEdit();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    await store.deletePastProject(deleteConfirm.id);
    await loadData();
    setDeleteConfirm(null);
  };

  const toggleImageFeatured = (index: number) => {
    const updated = [...selectedImages];
    updated[index] = { ...updated[index], isFeatured: !updated[index].isFeatured };
    setSelectedImages(updated);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const addImageFromGallery = (mediaItem: MediaItem) => {
    const image: PastProjectImage = {
      url: mediaItem.url,
      fileId: mediaItem.fileId,
      name: mediaItem.name,
      isFeatured: true,
    };
    setSelectedImages([...selectedImages, image]);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-6">
        <p className="text-site-gray-light text-sm">Loading past projects...</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {(editingProject || isCreating) ? (
        <div className="space-y-5 min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-ebony">
              {isCreating ? 'New Past Project' : 'Edit Past Project'}
            </h2>
            <div className="flex items-center gap-4">
              {!isCreating && editingProject && !editingProject.projectToken.startsWith('manual_') && (
                <button
                  type="button"
                  onClick={handleMoveToActiveProjects}
                  className="text-[10px] font-black uppercase tracking-widest text-brass hover:text-ebony"
                >
                  Move to Active Projects
                </button>
              )}
              <button
                onClick={handleCancelEdit}
                className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-ebony"
              >
                Cancel
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
                placeholder="Project Title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
                Project Type
              </label>
              <select
                value={editProjectType}
                onChange={(e) => setEditProjectType(e.target.value)}
                className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
              >
                <option value="">— Select Type —</option>
                <option value="Island">Island</option>
                <option value="Counter Top">Counter Top</option>
                <option value="Mantel">Mantel</option>
                <option value="Table">Table</option>
                <option value="Charcuterie Board">Charcuterie Board</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors min-h-[80px] resize-y"
                placeholder="Project description..."
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeaturedOnHomePage}
                  onChange={(e) => setIsFeaturedOnHomePage(e.target.checked)}
                  className="w-4 h-4 text-brass border-gray-300 rounded focus:ring-brass"
                />
                <span className="text-sm font-normal text-site-gray uppercase tracking-wide">
                  Featured on Home Page
                </span>
              </label>
              <p className="text-xs text-stone-400 mt-1 ml-7">
                When enabled, this project will appear in the home page gallery
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-normal text-site-gray uppercase tracking-wide">
                  Project Images ({selectedImages.length})
                </label>
                <button
                  type="button"
                  onClick={() => setShowImageSelector(!showImageSelector)}
                  className="text-[10px] font-black uppercase tracking-widest text-brass hover:text-ebony"
                >
                  {showImageSelector ? 'Hide' : 'Add from Gallery'}
                </button>
              </div>
              <p className="text-xs text-stone-400 mb-4">
                Toggle each image to <strong>Visible</strong> or <strong>Hidden</strong>. Only visible images appear on the public website.
              </p>

              {showImageSelector && (
                <div className="mb-4 p-3 bg-stone-50 rounded-sm max-h-80 overflow-y-auto min-w-0">
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 min-w-0">
                    {mediaItems.map((item) => {
                      const isSelected = selectedImages.some(img => img.url === item.url);
                      return (
                        <div
                          key={item.id}
                          className={`relative border-2 rounded-sm overflow-hidden cursor-pointer transition-all ${
                            isSelected ? 'border-brass' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => !isSelected && addImageFromGallery(item)}
                        >
                          <div className="aspect-video bg-gray-100">
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Tiny filename strip */}
                          <div className="px-2 py-1 bg-white border-t border-gray-200">
                            <div className="text-[9px] leading-tight text-stone-500 truncate" title={item.name}>
                              {item.name}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute inset-0 bg-brass/20 flex items-center justify-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-brass bg-white px-2 py-1 rounded-sm">
                                Selected
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedImages.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="aspect-video bg-gray-100 rounded-sm overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-stone-600 truncate" title={image.name}>
                        {image.name}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleImageFeatured(index)}
                          className={`flex-1 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 border rounded-full transition-all ${
                            image.isFeatured
                              ? 'border-emerald-400 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-stone-200 text-stone-300 hover:border-stone-300 hover:text-stone-400'
                          }`}
                        >
                          {image.isFeatured ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-full transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-stone-200 rounded-sm">
                  <p className="text-stone-300 font-serif italic text-sm">No images selected</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-brass text-ebony hover:bg-ebony hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
              >
                {isCreating ? 'Create Project' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all text-[11px] font-black uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-ebony">Past Projects</h2>
              <span className="text-[10px] text-stone-400">
                {pastProjects.length}
              </span>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-brass text-white hover:bg-ebony transition-all text-[9px] font-black uppercase tracking-widest"
            >
              + Add Project
            </button>
          </div>

          {pastProjects.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-stone-300 font-serif italic text-sm">No past projects yet.</p>
              <p className="text-stone-400 text-xs mt-1">Complete a project to add it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pastProjects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-stone-50 hover:bg-stone-100/80 rounded-sm transition-colors cursor-pointer overflow-hidden"
                  onClick={() => handleEdit(project)}
                >
                  {project.selectedImages.length > 0 && (
                    <div className="aspect-[16/10] bg-stone-200 overflow-hidden relative">
                      <img
                        src={project.selectedImages[0].url}
                        alt={project.selectedImages[0].name}
                        className="w-full h-full object-cover"
                      />
                      {project.selectedImages.length > 1 && (
                        <span className="absolute bottom-1.5 right-1.5 text-[8px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded-sm">
                          +{project.selectedImages.length - 1}
                        </span>
                      )}
                      {project.isFeaturedOnHomePage && (
                        <span className="absolute top-1.5 left-1.5 text-[7px] font-black uppercase tracking-wider text-white bg-brass/90 px-1.5 py-0.5 rounded-sm">
                          Home
                        </span>
                      )}
                    </div>
                  )}
                  <div className="px-3 py-2.5">
                    <h3 className="text-sm font-serif text-ebony leading-snug mb-0.5 group-hover:text-brass transition-colors">{project.title}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-stone-400">
                      {project.projectType && <span className="text-brass">{project.projectType}</span>}
                      {project.projectType && <span>·</span>}
                      <span>{formatDate(project.completedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Past Project"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
