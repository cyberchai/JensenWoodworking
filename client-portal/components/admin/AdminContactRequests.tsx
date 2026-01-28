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

  const getStatusColor = (status: string) => {
    if (status === 'new') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  const getStatusText = (status: string) => {
    if (status === 'new') return 'New';
    return 'Read';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-brass">Commission Inquiries</h2>
        <div className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
          {contactRequests.length} {contactRequests.length === 1 ? 'Inquiry' : 'Inquiries'}
        </div>
      </div>

      <div className="space-y-3">
        {contactRequests.length === 0 ? (
          <div className="bg-white border border-stone-200 p-12 text-center shadow-sm rounded-sm">
            <p className="text-stone-300 italic font-serif normal-case tracking-normal text-sm">
              No recent inquiries found in the archives.
            </p>
          </div>
        ) : (
          contactRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-stone-200 overflow-hidden hover:border-stone-300 transition-colors shadow-sm rounded-sm"
            >
              {/* Compact Header Row */}
              <div className="px-6 py-4 flex items-start justify-between gap-4 border-b border-stone-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold text-ebony uppercase tracking-wider">{request.name}</h3>
                    <span
                      className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm ${getStatusColor(request.status)}`}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-stone-400">
                    <a href={`mailto:${request.email}`} className="hover:text-brass transition-colors">
                      {request.email}
                    </a>
                    {request.phone && (
                      <a href={`tel:${request.phone}`} className="hover:text-brass transition-colors">
                        {request.phone}
                      </a>
                    )}
                    <span className="text-stone-300">
                      {formatDate(request.createdAt)} at {formatTime(request.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <select
                    value={request.status === 'new' ? 'new' : 'read'}
                    onChange={(e) => updateStatus(request.id, e.target.value as 'new' | 'read')}
                    className="text-[9px] font-bold uppercase tracking-widest bg-transparent border border-stone-200 rounded-sm px-2 py-1 focus:border-brass focus:outline-none text-ebony hover:border-stone-300 transition-colors"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                  </select>
                  <button
                    onClick={() => handleDeleteClick(request.id, request.name)}
                    className="text-[9px] font-bold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Message Preview */}
              <div className="px-6 py-4">
                <p className="text-sm text-stone-600 italic font-serif normal-case line-clamp-2 mb-3">
                  {request.message}
                </p>
                
                {/* Additional Info Preview */}
                {(request.budget || request.contractorInvolved || request.designerInvolved) && (
                  <div className="flex flex-wrap gap-3 text-[10px] text-stone-500 mb-3">
                    {request.budget && (
                      <span className="px-2 py-1 bg-stone-50 rounded-sm">
                        <span className="font-bold text-ebony">Budget: </span>
                        {request.budget}
                      </span>
                    )}
                    {request.contractorInvolved && (
                      <span className="px-2 py-1 bg-stone-50 rounded-sm">Contractor Involved</span>
                    )}
                    {request.designerInvolved && (
                      <span className="px-2 py-1 bg-stone-50 rounded-sm">Designer Involved</span>
                    )}
                  </div>
                )}

                {/* View Details Toggle */}
                {(request.message.length > 150 || request.additionalDetails) && (
                  <button
                    onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                    className="text-[9px] text-brass hover:text-ebony uppercase tracking-widest font-bold transition-colors"
                  >
                    {expandedRequest === request.id ? '▲ Hide Details' : '▼ View Full Details'}
                  </button>
                )}
              </div>

              {/* Expanded Details */}
              {expandedRequest === request.id && (
                <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-ebony mb-2">Full Message</h4>
                    <p className="text-sm text-stone-700 italic font-serif normal-case whitespace-pre-wrap leading-relaxed">
                      {request.message}
                    </p>
                  </div>

                  {request.additionalDetails && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-ebony mb-2">Additional Details</h4>
                      <p className="text-sm text-stone-700 italic font-serif normal-case whitespace-pre-wrap leading-relaxed">
                        {request.additionalDetails}
                      </p>
                    </div>
                  )}

                  {(request.budget || request.contractorInvolved || request.designerInvolved) && (
                    <div className="pt-3 border-t border-stone-200">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-ebony mb-3">Project Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {request.budget && (
                          <div>
                            <span className="font-bold text-ebony">Budget: </span>
                            <span className="text-stone-700">{request.budget}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-ebony">Collaborators: </span>
                          <span className="text-stone-700">
                            {request.contractorInvolved && request.designerInvolved
                              ? 'Contractor, Designer'
                              : request.contractorInvolved
                              ? 'Contractor'
                              : request.designerInvolved
                              ? 'Designer'
                              : 'None'}
                          </span>
                        </div>
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

