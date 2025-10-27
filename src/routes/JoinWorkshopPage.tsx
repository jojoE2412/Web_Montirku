import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshops, useJoinWorkshop } from '../hooks/useWorkshops';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Search, MapPin } from 'lucide-react';

const JoinWorkshopPage: React.FC = () => {
  const { workshops, isLoading } = useWorkshops();
  const joinWorkshopMutation = useJoinWorkshop();
  const { refreshUser } = useAuth(); // Get refreshUser function
  const navigate = useNavigate(); // Get navigate function

  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkshops = useMemo(() => {
    if (!workshops) return [];
    return workshops.filter(workshop =>
      workshop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workshops, searchTerm]);

  const handleJoinRequest = (workshopId: string) => {
    joinWorkshopMutation.mutate(workshopId, {
      onSuccess: async () => {
        // When request is successful, refresh user data and navigate
        await refreshUser();
        navigate('/montir/waiting-confirmation');
      },
      // onError is already handled by the hook, which shows a toast
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Gabung dengan Bengkel</h1>
      <p className="text-gray-600 mb-8">Cari bengkel yang terdaftar dan kirim permintaan untuk bergabung.</p>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Ketik nama bengkel..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={20} />
        </div>
      </div>

      {/* Workshops List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Memuat daftar bengkel...</div>
        ) : filteredWorkshops.length > 0 ? (
          filteredWorkshops.map(workshop => {
            const isLoadingRequest = joinWorkshopMutation.isPending && joinWorkshopMutation.variables === workshop.id;

            return (
              <div key={workshop.id} className="bg-white p-5 rounded-xl shadow-md flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{workshop.name}</h2>
                  <div className="flex items-center text-gray-500 mt-1">
                    <MapPin size={14} className="mr-2" />
                    <span className="text-sm">{workshop.address}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleJoinRequest(workshop.id)}
                  disabled={isLoadingRequest}
                  className={'bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70'}
                >
                  {isLoadingRequest ? 'Mengirim...' : 'Kirim Permintaan'}
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500">Tidak ada bengkel yang cocok dengan pencarian Anda.</div>
        )}
      </div>
    </div>
  );
};

export default JoinWorkshopPage;
