'use client';

import { useState, useEffect } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';
import { isValidImageFile, isValidFileSize } from '@/lib/imagekit';

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

export default function AdminMedia() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; fileId: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFromImageKit = async () => {
    const response = await fetch('/api/imagekit/list?path=/media/&limit=1000', {
      method: 'GET',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to load media library from ImageKit');
    }

    const payload = await response.json();
    const files = Array.isArray(payload?.files) ? payload.files : [];

    const normalized: MediaItem[] = files
      .filter((f: any) => f && f.fileId && f.url)
      .map((f: any) => ({
        id: `ik_${f.fileId}`,
        fileId: f.fileId,
        name: f.name || f.filePath || 'Image',
        url: f.url,
        uploadedAt: f.createdAt ? new Date(f.createdAt).getTime() : Date.now(),
        size: f.size,
        width: f.width,
        height: f.height,
      }));

    setMediaItems(normalized);
    // Keep localStorage in sync as a fallback cache
    localStorage.setItem('imagekit_media', JSON.stringify(normalized));
  };

  // Load existing media items
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadFromImageKit();
      } catch (e: any) {
        // Fallback to localStorage if ImageKit listing isn't available
        const stored = localStorage.getItem('imagekit_media');
        if (!cancelled && stored) {
          try {
            setMediaItems(JSON.parse(stored));
          } catch (err) {
            console.error('Error loading stored media:', err);
          }
        }
        if (!cancelled) {
          setError(e?.message || 'Failed to load media library');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveMediaItems = (items: MediaItem[]) => {
    setMediaItems(items);
    localStorage.setItem('imagekit_media', JSON.stringify(items));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    const fileArray = Array.from(files);
    const uploadPromises: Promise<MediaItem>[] = [];

    for (const file of fileArray) {
      // Validate file type
      if (!isValidImageFile(file)) {
        setError(`File "${file.name}" is not a valid image. Only images are allowed.`);
        continue;
      }

      // Validate file size (10MB max)
      if (!isValidFileSize(file, 10)) {
        setError(`File "${file.name}" exceeds 10MB size limit.`);
        continue;
      }

      const fileId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      const uploadPromise = uploadFile(file, fileId);
      uploadPromises.push(uploadPromise);
    }

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful: MediaItem[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          errors.push(`Failed to upload "${fileArray[index].name}": ${result.reason}`);
        }
      });

      if (successful.length > 0) {
        saveMediaItems([...successful, ...mediaItems]);
      }

      if (errors.length > 0) {
        setError(errors.join('\n'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress({});
      // Reset file input
      e.target.value = '';
    }
  };

  const uploadFile = async (file: File, fileId: string): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/imagekit/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();

    return {
      id: fileId,
      fileId: result.fileId,
      name: result.name || file.name,
      url: result.url,
      uploadedAt: Date.now(),
      size: result.size,
      width: result.width,
      height: result.height,
    };
  };

  const deleteMedia = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/imagekit/delete?fileId=${deleteConfirm.fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      const updated = mediaItems.filter(item => item.id !== deleteConfirm.id);
      saveMediaItems(updated);
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
      setDeleteConfirm(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filter media items based on search query
  const filteredMediaItems = mediaItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="py-6">
        <p className="text-site-gray-light text-sm">Loading media library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 min-w-0">
      <div className="space-y-3 min-w-0">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Upload Media</h2>
        <div>
          <label className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Select Images (Max 10MB each)
          </label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
          />
          <p className="mt-2 text-xs text-site-gray-light">
            Supported formats: JPEG, PNG, GIF, WebP, SVG
          </p>
          {uploading && (
            <div className="mt-4">
              <p className="text-sm text-site-gray-light mb-2">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brass h-2 rounded-full animate-pulse" style={{ width: '50%' }}></div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 min-w-0 border-t border-stone-100 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
          <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Media Library</h2>
          <span className="text-sm text-site-gray-light">
            {filteredMediaItems.length} {filteredMediaItems.length === 1 ? 'item' : 'items'}
            {searchQuery && filteredMediaItems.length !== mediaItems.length && (
              <span className="ml-2">of {mediaItems.length}</span>
            )}
          </span>
        </div>

        {mediaItems.length > 0 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search media by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors placeholder:text-site-gray-light"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-site-gray-light hover:text-black transition-colors text-sm"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {mediaItems.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-sm">
            <p className="text-stone-300 font-serif italic">No media uploaded yet.</p>
          </div>
        ) : filteredMediaItems.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-sm">
            <p className="text-stone-300 font-serif italic">
              No media found matching "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0 max-w-full">
            {filteredMediaItems.map((item) => (
              <div key={item.id} className="bg-stone-50 rounded-sm p-2 space-y-2 relative group min-w-0">
                <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden rounded-sm">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-normal text-black truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-site-gray-light">
                    <span>{formatDate(item.uploadedAt)}</span>
                    {item.size && (
                      <span>{formatFileSize(item.size)}</span>
                    )}
                  </div>
                  {item.width && item.height && (
                    <p className="text-xs text-site-gray-light">
                      {item.width} × {item.height}px
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      navigator.clipboard.writeText(item.url);
                      // Show brief feedback
                      const button = e.currentTarget;
                      const originalText = button.textContent;
                      if (originalText) {
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                          button.textContent = originalText;
                        }, 2000);
                      }
                    }}
                    className="flex-1 px-3 py-3 min-h-[44px] bg-gray-200 text-site-gray hover:bg-site-gold hover:text-black transition-colors text-xs font-normal uppercase"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: item.id, fileId: item.fileId, name: item.name })}
                    className="flex-1 px-3 py-3 min-h-[44px] bg-gray-200 text-site-gray hover:bg-red-100 hover:text-red-700 transition-colors text-xs font-normal uppercase"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteMedia}
        title="Delete Media"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

