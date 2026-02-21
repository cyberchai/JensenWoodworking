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
      // Don't close modal on first confirmation
    } else {
      deleteRequest();
      // Modal will close via onClose in DeleteConfirmModal
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const yesNoPill = (label: string, value?: boolean) => {
    const isYes = value === true;
    return (
      <span
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-none border text-xs md:text-sm font-semibold tracking-wide ${
          isYes
            ? 'bg-green-200 text-green-950 border-green-300'
            : 'bg-stone-50 text-stone-600 border-stone-200'
        }`}
      >
        <span className="text-ebony/80">{label}</span>
        <span className={`ml-0.5 ${isYes ? 'text-green-950' : 'text-stone-500'}`}>
          {isYes ? 'Yes' : 'No'}
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex items-center justify-between gap-4 min-w-0">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-brass">Commission Inquiries</h2>
        <span className="text-[10px] text-stone-400">{contactRequests.length}</span>
      </div>

      <div className="space-y-3">
        {contactRequests.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-stone-300 italic font-serif text-sm">
              No recent inquiries found.
            </p>
          </div>
        ) : (
          contactRequests.map((request) => (
            <div
              key={request.id}
              className="bg-stone-50 overflow-hidden hover:bg-stone-100/80 transition-colors rounded-sm"
            >
              {/* Compact Header Row */}
              <div className="px-4 sm:px-5 py-3 flex items-start justify-between gap-4 border-b border-stone-200/50 min-w-0">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-4 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-ebony uppercase tracking-wider break-words min-w-0">
                      {request.name}
                    </h3>
                    <button
                      onClick={() => handleDeleteClick(request.id, request.name)}
                      className="text-xs md:text-sm font-bold uppercase tracking-widest text-stone-400 hover:text-ebony transition-colors px-2 py-2 min-h-[44px] flex items-center shrink-0"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 min-w-0">
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-stone-300 mb-1">
                        Email
                      </div>
                      <a
                        href={`mailto:${request.email}`}
                        className="block text-sm md:text-base text-ebony hover:text-brass transition-colors break-all"
                      >
                        {request.email}
                      </a>
                    </div>

                    {request.phone ? (
                      <div className="min-w-0">
                        <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-stone-300 mb-1">
                          Phone
                        </div>
                        <a
                          href={`tel:${request.phone}`}
                          className="block text-sm md:text-base text-ebony hover:text-brass transition-colors break-all"
                        >
                          {request.phone}
                        </a>
                      </div>
                    ) : (
                      <div className="hidden sm:block" />
                    )}
                  </div>

                  <div className="text-xs md:text-sm text-stone-400">
                    <span className="text-stone-300 font-bold uppercase tracking-widest mr-2">Received</span>
                    <span className="text-stone-300">
                      {formatDate(request.createdAt)} at {formatTime(request.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Preview */}
              <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 min-w-0">
                <p className="text-sm md:text-base text-stone-600 italic font-serif normal-case line-clamp-2 mb-3 break-words">
                  {request.message}
                </p>
                
                {/* Additional Info Preview */}
                {(request.budget ||
                  request.contractorInvolved !== undefined ||
                  request.designerInvolved !== undefined) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {request.budget && (
                      <span className="px-2 py-1 bg-stone-50 rounded-sm text-[10px] text-stone-500">
                        <span className="font-bold text-ebony">Budget:</span>{' '}
                        {request.budget}
                      </span>
                    )}
                    {request.contractorInvolved !== undefined && yesNoPill('Contractor', request.contractorInvolved)}
                    {request.designerInvolved !== undefined && yesNoPill('Designer', request.designerInvolved)}
                  </div>
                )}

                {/* View Details Toggle */}
                {(request.message.length > 150 || request.additionalDetails) && (
                  <button
                    onClick={async () => {
                      const next = expandedRequest === request.id ? null : request.id;
                      setExpandedRequest(next);
                      // When opening details, auto-mark as read to reduce manual status management.
                      if (next && request.status === 'new') {
                        await updateStatus(request.id, 'read');
                      }
                    }}
                    className="text-xs md:text-sm text-brass hover:text-ebony uppercase tracking-widest font-bold transition-colors py-2 min-h-[44px] flex items-center"
                  >
                    {expandedRequest === request.id ? '▲ Hide Details' : '▼ View Full Details'}
                  </button>
                )}
              </div>

              {/* Expanded Details */}
              {expandedRequest === request.id && (
                <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 bg-stone-50 border-t border-stone-100 space-y-4 min-w-0 overflow-hidden">
                  <div className="min-w-0">
                    <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-ebony mb-2">Full Message</h4>
                    <p className="text-sm md:text-base text-stone-700 italic font-serif normal-case whitespace-pre-wrap leading-relaxed break-words">
                      {request.message}
                    </p>
                  </div>

                  {request.additionalDetails && (
                    <div className="min-w-0">
                      <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-ebony mb-2">Additional Details</h4>
                      <p className="text-sm md:text-base text-stone-700 italic font-serif normal-case whitespace-pre-wrap leading-relaxed break-words">
                        {request.additionalDetails}
                      </p>
                    </div>
                  )}

                  {(request.budget ||
                    request.contractorInvolved !== undefined ||
                    request.designerInvolved !== undefined) && (
                    <div className="pt-3 border-t border-stone-200 min-w-0">
                      <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-ebony mb-3">Project Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm md:text-base min-w-0">
                        {request.budget && (
                          <div>
                            <span className="font-bold text-ebony">Budget: </span>
                            <span className="text-stone-700">{request.budget}</span>
                          </div>
                        )}
                        {(request.contractorInvolved !== undefined || request.designerInvolved !== undefined) && (
                          <div className="sm:col-span-2">
                            <div className="font-bold text-ebony mb-2">Collaborators</div>
                            <div className="flex flex-wrap gap-2">
                              {request.contractorInvolved !== undefined && yesNoPill('Contractor', request.contractorInvolved)}
                              {request.designerInvolved !== undefined && yesNoPill('Designer', request.designerInvolved)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

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
            : `⚠️ This action cannot be undone. Click "Delete Permanently" to confirm deletion of "${deleteConfirm?.name}"'s contact request.`
        }
        confirmButtonText={deleteStep === 'first' ? 'Continue' : 'Delete Permanently'}
      />
    </div>
  );
}

