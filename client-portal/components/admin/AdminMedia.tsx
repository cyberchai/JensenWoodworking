'use client';

import { useState } from 'react';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  uploadedAt: number;
  projectToken?: string;
}

export default function AdminMedia() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newItems: MediaItem[] = Array.from(files).map((file) => ({
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      uploadedAt: Date.now(),
    }));

    setMediaItems([...newItems, ...mediaItems]);
    setUploading(false);
  };

  const deleteMedia = (id: string) => {
    if (confirm('Are you sure you want to delete this media item?')) {
      setMediaItems(mediaItems.filter(item => item.id !== id));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-normal text-black">Upload Media</h2>
        <div>
          <label className="block text-sm font-normal text-site-gray mb-2 uppercase tracking-wide">
            Select Files
          </label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full px-4 py-2 border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
          />
          {uploading && (
            <p className="mt-2 text-sm text-site-gray-light">Uploading...</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-normal text-black">Media Library</h2>
          <span className="text-sm text-site-gray-light">
            {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {mediaItems.length === 0 ? (
          <p className="text-site-gray-light text-sm">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaItems.map((item) => (
              <div key={item.id} className="border border-gray-200 p-4 space-y-3">
                {item.type === 'image' ? (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-site-gray-light text-sm">Video</span>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-normal text-black truncate">{item.name}</p>
                  <p className="text-xs text-site-gray-light">{formatDate(item.uploadedAt)}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.url);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-200 text-site-gray hover:bg-site-gold hover:text-black transition-colors text-xs font-normal uppercase"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => deleteMedia(item.id)}
                    className="flex-1 px-3 py-2 bg-gray-200 text-site-gray hover:bg-red-100 hover:text-red-700 transition-colors text-xs font-normal uppercase"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

