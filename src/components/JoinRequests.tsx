import React from 'react';
import { useJoinRequests, useRespondToRequest } from '../hooks/useWorkshopMembers';
import { Check, X, Loader2, User, Mail, Phone } from 'lucide-react';

const JoinRequests: React.FC = () => {
  const { data: requests, isLoading, error } = useJoinRequests();
  const respondMutation = useRespondToRequest();

  const handleResponse = (requestId: string, status: 'approved' | 'rejected') => {
    respondMutation.mutate({ requestId, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-600">Memuat permintaan...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">Gagal memuat permintaan bergabung.</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
        <p>Tidak ada permintaan bergabung yang tertunda saat ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Permintaan Bergabung Tertunda</h3>
      {requests.map((req) => (
        <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <div className="font-bold text-lg text-gray-900 flex items-center">
              <User size={18} className="mr-2 text-gray-600" />
              {req.fullName}
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <Mail size={14} className="mr-2" />
              {req.email}
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <Phone size={14} className="mr-2" />
              {req.phone || '-'}
            </div>
          </div>
          <div className="flex space-x-3 flex-shrink-0">
            <button
              onClick={() => handleResponse(req.id, 'approved')}
              disabled={respondMutation.isPending}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              <Check size={16} className="mr-2" />
              Setujui
            </button>
            <button
              onClick={() => handleResponse(req.id, 'rejected')}
              disabled={respondMutation.isPending}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              <X size={16} className="mr-2" />
              Tolak
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JoinRequests;
