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
    <div className="space-y-4 min-w-0">
      <div className="space-y-2 min-w-0">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Upload Media</h2>
        <div className="flex items-center gap-3">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-xs file:mr-2 file:py-1 file:px-3 file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-wider file:bg-stone-100 file:text-ebony file:cursor-pointer hover:file:bg-brass hover:file:text-white file:transition-all"
          />
          <span className="text-[9px] text-stone-400 shrink-0">Max 10MB · JPEG, PNG, GIF, WebP, SVG</span>
        </div>
          {uploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 h-1 rounded-full">
                <div className="bg-brass h-1 rounded-full animate-pulse" style={{ width: '50%' }}></div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-2 p-2 bg-red-50 rounded-sm flex items-start gap-2">
              <p className="text-xs text-red-700 whitespace-pre-wrap flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-[9px] text-red-500 hover:text-red-700 shrink-0">✕</button>
            </div>
          )}
      </div>

      <div className="space-y-3 min-w-0 border-t border-stone-100 pt-3">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Media Library</h2>
          <span className="text-[10px] text-stone-400">
            {filteredMediaItems.length}
            {searchQuery && filteredMediaItems.length !== mediaItems.length && ` of ${mediaItems.length}`}
          </span>
          {mediaItems.length > 0 && (
            <div className="flex-1 max-w-xs ml-auto relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1 text-xs border-0 border-b border-stone-200 bg-transparent focus:outline-none focus:border-brass placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-ebony text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {mediaItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-stone-300 font-serif italic text-sm">No media uploaded yet.</p>
          </div>
        ) : filteredMediaItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-stone-300 font-serif italic text-sm">
              No media found matching &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 min-w-0 max-w-full">
            {filteredMediaItems.map((item) => (
              <div key={item.id} className="bg-stone-50 rounded-sm overflow-hidden relative group min-w-0">
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-[10px] text-stone-700 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-stone-400">
                    <span>{formatDate(item.uploadedAt)}</span>
                    {item.size && <span>· {formatFileSize(item.size)}</span>}
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(item.url);
                      const btn = e.currentTarget;
                      btn.textContent = '✓';
                      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
                    }}
                    className="px-2.5 py-1 bg-white text-ebony text-[9px] font-black uppercase tracking-wider hover:bg-brass hover:text-white transition-all rounded-sm"
                  >
                    Copy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ id: item.id, fileId: item.fileId, name: item.name });
                    }}
                    className="px-2.5 py-1 bg-white text-red-600 text-[9px] font-black uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all rounded-sm"
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

