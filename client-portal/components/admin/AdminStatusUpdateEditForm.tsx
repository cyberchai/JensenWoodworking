'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { store } from '@/lib/store';
import { StatusUpdate, StatusUpdatePhoto } from '@/lib/mockStore';
import { X } from '@/components/icons';

interface AdminStatusUpdateEditFormProps {
  projectToken: string;
  update: StatusUpdate;
  onUpdateSaved: () => void;
  onCancel: () => void;
}

export default function AdminStatusUpdateEditForm({
  projectToken,
  update,
  onUpdateSaved,
  onCancel,
}: AdminStatusUpdateEditFormProps) {
  // Helper to convert photos to string array (extract URLs)
  const photosToStringArray = (photos: (string | StatusUpdatePhoto)[] | undefined): string[] => {
    if (!photos) return [];
    return photos.map(photo => typeof photo === 'string' ? photo : photo.url);
  };

  const [title, setTitle] = useState(update.title);
  const [message, setMessage] = useState(update.message);
  const [photos, setPhotos] = useState<string[]>(photosToStringArray(update.photos));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(update.title);
    setMessage(update.message);
    setPhotos(photosToStringArray(update.photos));
  }, [update]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    const maxPhotos = 3;
    const remainingSlots = maxPhotos - photos.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newPhotos.push(url);
      }
    }

    setPhotos([...photos, ...newPhotos].slice(0, maxPhotos));
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const photoToRemove = photos[index];
    // Only revoke if it's a blob URL (starts with blob:)
    if (photoToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove);
    }
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      return;
    }

    // Get current project to update the specific status update
    const project = await store.getProject(projectToken);
    if (!project) return;

    // Find and update the specific status update
    const updatedStatusUpdates = project.statusUpdates.map((u: StatusUpdate) => {
      if (u.id === update.id) {
        return {
          ...u,
          title: title.trim(),
          message: message.trim(),
          photos: photos,
        };
      }
      return u;
    });

    await store.updateProject(projectToken, { statusUpdates: updatedStatusUpdates });

    // Clean up any new blob URLs
    const originalPhotoUrls = photosToStringArray(update.photos);
    photos.forEach(photo => {
      if (photo.startsWith('blob:') && !originalPhotoUrls.includes(photo)) {
        URL.revokeObjectURL(photo);
      }
    });

    onUpdateSaved();
  };

  const handleCancel = () => {
    // Clean up any new blob URLs that weren't in the original
    const originalPhotoUrls = photosToStringArray(update.photos);
    photos.forEach(photo => {
      if (photo.startsWith('blob:') && !originalPhotoUrls.includes(photo)) {
        URL.revokeObjectURL(photo);
      }
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-brass bg-stone-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-black uppercase tracking-widest text-ebony">Edit Status Update</h4>
        <button
          type="button"
          onClick={handleCancel}
          className="text-stone-400 hover:text-ebony transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <label htmlFor="edit-title" className="block text-xs font-normal text-site-gray mb-1 uppercase tracking-wide">
          Update Title
        </label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-brass transition-colors"
          placeholder="e.g., Progress Update, Quality Check, Completed"
        />
      </div>

      <div>
        <label htmlFor="edit-message" className="block text-xs font-normal text-site-gray mb-1 uppercase tracking-wide">
          Message
        </label>
        <textarea
          id="edit-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={3}
          className="w-full px-3 py-2 text-sm border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-brass transition-colors resize-none"
          placeholder="Describe the update for the client..."
        />
      </div>

      <div>
        <label htmlFor="edit-photos" className="block text-xs font-normal text-site-gray mb-1 uppercase tracking-wide">
          Photos (up to 3)
        </label>
        <input
          ref={fileInputRef}
          id="edit-photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          disabled={photos.length >= 3}
          className="w-full px-3 py-2 text-sm border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-brass transition-colors"
        />
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded overflow-hidden group">
                <img
                  src={photo}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length >= 3 && (
          <p className="mt-1 text-xs text-site-gray-light">Maximum 3 photos reached</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-brass text-ebony hover:bg-ebony hover:text-white transition-colors text-sm font-black uppercase tracking-widest"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-site-gray hover:bg-gray-300 transition-colors text-sm font-normal uppercase"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
