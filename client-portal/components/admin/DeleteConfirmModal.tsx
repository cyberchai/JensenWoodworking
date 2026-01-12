'use client';

import { X } from '@/components/icons';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ebony/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-sm w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-10 py-8 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
          <h3 className="text-2xl font-serif text-ebony">{title}</h3>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-ebony transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-10 space-y-8">
          <p className="text-stone-600 font-serif italic text-lg">{message}</p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 text-[11px] font-black uppercase tracking-widest text-stone-400 py-4 border border-stone-200 hover:border-stone-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-600 text-white font-black text-[11px] tracking-widest uppercase py-4 shadow-xl hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
