import React from 'react';
import { useWorkshopMembers, useRemoveWorkshopMember } from '../hooks/useWorkshopMembers';
import { User, Mail, Phone, Trash2, Loader2 } from 'lucide-react';

interface ActiveMembersProps {
  show: boolean;
}

const ActiveMembers: React.FC<ActiveMembersProps> = ({ show }) => {
  if (!show) return null;

  const { data: members, isLoading: isLoadingMembers } = useWorkshopMembers();
  const { mutate: removeMember, isPending: isRemovingMember } = useRemoveWorkshopMember();

  const handleRemove = (memberId: string) => {
    if (window.confirm('Apakah Anda yakin ingin memberhentikan karyawan ini?')) {
      removeMember(memberId);
    }
  };

  if (isLoadingMembers) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-600">Memuat daftar karyawan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Daftar Karyawan Aktif</h3>
      {members && members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.memberEntryId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <div className="font-bold text-lg text-gray-900 flex items-center">
                  <User size={18} className="mr-2 text-gray-600" />
                  {member.fullName}
                </div>
                <div className="text-sm text-gray-600 flex items-center mt-1">
                  <Mail size={14} className="mr-2" />
                  {member.email}
                </div>
                <div className="text-sm text-gray-600 flex items-center mt-1">
                  <Phone size={14} className="mr-2" />
                  {member.phone || '-'}
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleRemove(member.memberEntryId)} // <--- Changed to member.memberEntryId
                  disabled={isRemovingMember}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <Trash2 size={16} className="mr-2" />
                  Berhentikan
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
          <p>Anda belum memiliki karyawan aktif.</p>
        </div>
      )}
    </div>
  );
};

export default ActiveMembers;
