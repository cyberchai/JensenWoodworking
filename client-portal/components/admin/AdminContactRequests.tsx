'use client';

import { ContactRequest } from '@/lib/mockStore';
import { store } from '@/lib/store';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useState } from 'react';

interface AdminContactRequestsProps {
  contactRequests: ContactRequest[];
  onUpdate: () => void;
}

export default function AdminContactRequests({ contactRequests, onUpdate }: AdminContactRequestsProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleteStep, setDeleteStep] = useState<'first' | 'second'>('first');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const updateStatus = async (id: string, status: 'new' | 'read') => {
    await store.updateContactRequest(id, { status });
    onUpdate();
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
    setDeleteStep('first');
  };

  const handleDeleteConfirm = () => {
    if (deleteStep === 'first') {
      setDeleteStep('second');
    } else {
      deleteRequest();
    }
  };

  const deleteRequest = async () => {
    if (deleteConfirm) {
      await store.deleteContactRequest(deleteConfirm.id);
      setDeleteConfirm(null);
      setDeleteStep('first');
      onUpdate();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const pill = (label: string, value?: boolean) => {
    const isYes = value === true;
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold tracking-wide rounded-sm ${
        isYes ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
      }`}>
        {label}: {isYes ? 'Yes' : 'No'}
      </span>
    );
  };

  return (
    <div className="space-y-3 min-w-0">
      <div className="flex items-center gap-3">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Commission Inquiries</h2>
        <span className="text-[10px] text-stone-400">{contactRequests.length}</span>
      </div>

      {contactRequests.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-stone-300 italic font-serif text-sm">No recent inquiries.</p>
        </div>
      ) : (
        <div className="space-y-1.5 min-w-0">
          {contactRequests.map((request) => {
            const isExpanded = expandedRequest === request.id;
            return (
              <div
                key={request.id}
                className="bg-stone-50 rounded-sm overflow-hidden min-w-0"
              >
                {/* Compact row */}
                <div
                  className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-stone-100/80 transition-colors"
                  onClick={async () => {
                    const next = isExpanded ? null : request.id;
                    setExpandedRequest(next);
                    if (next && request.status === 'new') {
                      await updateStatus(request.id, 'read');
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-ebony">{request.name}</span>
                      {request.status === 'new' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brass shrink-0"></span>
                      )}
                      <span className="text-[9px] text-stone-400 ml-auto shrink-0">{formatDate(request.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug line-clamp-1">{request.message}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <a href={`mailto:${request.email}`} className="text-[10px] text-stone-400 hover:text-brass transition-colors" onClick={(e) => e.stopPropagation()}>
                        {request.email}
                      </a>
                      {request.phone && (
                        <>
                          <span className="text-stone-300">·</span>
                          <a href={`tel:${request.phone}`} className="text-[10px] text-stone-400 hover:text-brass transition-colors" onClick={(e) => e.stopPropagation()}>
                            {request.phone}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-400 shrink-0 pt-0.5">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 space-y-2 border-t border-stone-200/50">
                    <p className="text-xs text-stone-600 font-serif italic whitespace-pre-wrap leading-relaxed">
                      {request.message}
                    </p>

                    {(request.budget || request.contractorInvolved !== undefined || request.designerInvolved !== undefined) && (
                      <div className="flex flex-wrap gap-1.5">
                        {request.budget && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-stone-100 text-stone-600 rounded-sm">
                            Budget: {request.budget}
                          </span>
                        )}
                        {request.contractorInvolved !== undefined && pill('Contractor', request.contractorInvolved)}
                        {request.designerInvolved !== undefined && pill('Designer', request.designerInvolved)}
                      </div>
                    )}

                    {request.additionalDetails && (
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-wider text-stone-400 mb-1">Additional Details</div>
                        <p className="text-xs text-stone-600 font-serif italic whitespace-pre-wrap leading-relaxed">
                          {request.additionalDetails}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDeleteClick(request.id, request.name)}
                        className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => {
          setDeleteConfirm(null);
          setDeleteStep('first');
        }}
        onConfirm={handleDeleteConfirm}
        title={deleteStep === 'first' ? 'Confirm Deletion' : 'Final Confirmation Required'}
        message={
          deleteStep === 'first'
            ? `Are you sure you want to delete the contact request from "${deleteConfirm?.name}"?`
            : `This action cannot be undone. Click "Delete Permanently" to confirm deletion of "${deleteConfirm?.name}"'s request.`
        }
        confirmButtonText={deleteStep === 'first' ? 'Continue' : 'Delete Permanently'}
      />
    </div>
  );
}
