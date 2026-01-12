'use client';

import { useState, FormEvent, useRef } from 'react';
import { store } from '@/lib/store';

interface AdminStatusUpdateFormProps {
  projectToken: string;
  onUpdateAdded: () => void;
}

export default function AdminStatusUpdateForm({ projectToken, onUpdateAdded }: AdminStatusUpdateFormProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    URL.revokeObjectURL(photoToRemove);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      return;
    }

    await store.addStatusUpdate(projectToken, {
      title: title.trim(),
      message: message.trim(),
      photos: photos,
    });

    // Clean up object URLs
    photos.forEach(photo => URL.revokeObjectURL(photo));

    setTitle('');
    setMessage('');
    setPhotos([]);
    setIsOpen(false);
    onUpdateAdded();
  };

  const handleCancel = () => {
    // Clean up object URLs
    photos.forEach(photo => URL.revokeObjectURL(photo));
    setTitle('');
    setMessage('');
    setPhotos([]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 bg-site-gold text-black hover:bg-black hover:text-white transition-colors text-sm font-normal uppercase"
      >
        + Add Status Update
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-200 bg-gray-50">
      <div>
        <label htmlFor="title" className="block text-xs font-normal text-site-gray mb-1 uppercase tracking-wide">
          Update Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
          placeholder="e.g., Progress Update, Quality Check, Completed"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-normal text-site-gray mb-1 uppercase tracking-wide">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={3}
          className="w-full px-3 py-2 text-sm border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors resize-none"
          placeholder="Describe the update for the client..."
        />
      </div>

      <div>
        <label htmlFor="photos" className="block text-xs font-normal text-site-gray mb-1 uppercase tracking-wide">
          Photos (up to 3)
        </label>
        <input
          ref={fileInputRef}
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          disabled={photos.length >= 3}
          className="w-full px-3 py-2 text-sm border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
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
          className="flex-1 px-4 py-2 bg-site-gold text-black hover:bg-black hover:text-white transition-colors text-sm font-normal uppercase"
        >
          Add Update
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

