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
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const updateStatus = async (id: string, status: ContactRequest['status']) => {
    await store.updateContactRequest(id, { status });
    onUpdate();
  };

  const deleteRequest = async () => {
    if (deleteConfirm) {
      await store.deleteContactRequest(deleteConfirm.id);
      setDeleteConfirm(null);
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-brass">Commission Inquiries</h2>
      <div className="bg-white border border-stone-100 overflow-hidden shadow-sm">
        <table className="w-full text-left text-[11px] font-bold uppercase tracking-widest">
          <thead className="bg-stone-50 border-b border-stone-100 text-stone-400">
            <tr>
              <th className="px-8 py-6">Inquirer</th>
              <th className="px-8 py-6">Intent</th>
              <th className="px-8 py-6">Date</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {contactRequests.map((request) => (
              <tr key={request.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="text-ebony mb-1">{request.name}</div>
                  <div className="text-[9px] text-stone-300 normal-case tracking-normal font-normal">{request.email}</div>
                  {request.phone && (
                    <div className="text-[9px] text-stone-300 normal-case tracking-normal font-normal">{request.phone}</div>
                  )}
                </td>
                <td className="px-8 py-6 text-stone-600 italic font-serif normal-case tracking-normal max-w-xs">
                  <div className="line-clamp-2">{request.message}</div>
                  {request.message.length > 100 && (
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      className="text-[9px] text-brass hover:text-ebony mt-1 uppercase tracking-widest"
                    >
                      {expandedRequest === request.id ? 'Show Less' : 'View Full Message'}
                    </button>
                  )}
                  {expandedRequest === request.id && (
                    <div className="mt-2 p-3 bg-stone-50 border border-stone-100 text-stone-600 italic font-serif normal-case tracking-normal whitespace-pre-wrap text-sm">
                      {request.message}
                    </div>
                  )}
                </td>
                <td className="px-8 py-6 text-stone-300">{formatDate(request.createdAt)}</td>
                <td className="px-8 py-6">
                  <select
                    value={request.status}
                    onChange={(e) => updateStatus(request.id, e.target.value as ContactRequest['status'])}
                    className="text-[9px] font-bold uppercase tracking-widest bg-transparent border-b border-stone-200 focus:border-brass focus:outline-none text-ebony"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <a
                      href={`mailto:${request.email}?subject=Re: Your Inquiry`}
                      className="text-brass hover:text-ebony transition-colors text-[9px] font-bold uppercase tracking-widest"
                    >
                      Reply
                    </a>
                    <button
                      onClick={() => setDeleteConfirm({ id: request.id, name: request.name })}
                      className="text-red-600 hover:text-red-800 transition-colors text-[9px] font-bold uppercase tracking-widest"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {contactRequests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-stone-300 italic font-serif normal-case tracking-normal">
                  No recent inquiries found in the archives.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteRequest}
        title="Delete Contact Request"
        message={`Are you sure you want to delete the contact request from "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

