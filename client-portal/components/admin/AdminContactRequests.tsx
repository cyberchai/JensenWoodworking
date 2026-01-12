'use client';

import { ContactRequest } from '@/lib/mockStore';
import { store } from '@/lib/store';

interface AdminContactRequestsProps {
  contactRequests: ContactRequest[];
  onUpdate: () => void;
}

export default function AdminContactRequests({ contactRequests, onUpdate }: AdminContactRequestsProps) {
  const updateStatus = async (id: string, status: ContactRequest['status']) => {
    await store.updateContactRequest(id, { status });
    onUpdate();
  };

  const deleteRequest = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact request?')) {
      await store.deleteContactRequest(id);
      onUpdate();
    }
  };

  const getStatusColor = (status: ContactRequest['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'read':
        return 'bg-gray-100 text-gray-700';
      case 'replied':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: ContactRequest['status']) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'read':
        return 'Read';
      case 'replied':
        return 'Replied';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const newRequests = contactRequests.filter(r => r.status === 'new').length;

  return (
    <div className="space-y-6">
      {newRequests > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-700">
            You have {newRequests} new {newRequests === 1 ? 'request' : 'requests'}
          </p>
        </div>
      )}

      {contactRequests.length === 0 ? (
        <div className="bg-white border border-gray-200 p-6">
          <p className="text-site-gray-light text-sm">No contact requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contactRequests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-normal text-black">{request.name}</h3>
                    <span className={`px-2 py-1 text-xs font-normal uppercase ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-site-gray-light">
                    <p>
                      <span className="font-medium">Email:</span>{' '}
                      <a href={`mailto:${request.email}`} className="text-site-gold hover:text-black transition-colors">
                        {request.email}
                      </a>
                    </p>
                    {request.phone && (
                      <p>
                        <span className="font-medium">Phone:</span>{' '}
                        <a href={`tel:${request.phone}`} className="text-site-gold hover:text-black transition-colors">
                          {request.phone}
                        </a>
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Date:</span> {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-site-gray-light leading-relaxed whitespace-pre-wrap">
                  {request.message}
                </p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <select
                  value={request.status}
                  onChange={(e) => updateStatus(request.id, e.target.value as ContactRequest['status'])}
                  className="px-4 py-2 text-sm border-0 border-b border-gray-300 bg-white focus:outline-none focus:border-site-gold transition-colors"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
                <a
                  href={`mailto:${request.email}?subject=Re: Your Inquiry`}
                  className="px-4 py-2 bg-site-gold text-black hover:bg-black hover:text-white transition-colors text-sm font-normal uppercase"
                >
                  Reply
                </a>
                <button
                  onClick={() => deleteRequest(request.id)}
                  className="px-4 py-2 bg-gray-200 text-site-gray hover:bg-red-100 hover:text-red-700 transition-colors text-sm font-normal uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

