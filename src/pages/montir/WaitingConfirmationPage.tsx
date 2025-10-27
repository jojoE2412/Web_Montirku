import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePendingRequestDetail, useCancelRequest } from '../../hooks/useWorkshops';
import { Phone, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const WaitingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // Fetch details of the pending request
  const { data: requestDetail, isLoading, error } = usePendingRequestDetail();

  // Mutation for cancelling the request
  const cancelRequestMutation = useCancelRequest();

  const handleCancelRequest = () => {
    cancelRequestMutation.mutate(undefined, {
      onSuccess: async () => {
        // Refresh user data. This will set hasPendingRequest to false.
        await refreshUser();
        // The redirect logic in App.tsx will then move the user to /workshop-setup
        navigate('/workshop-setup');
      },
      onError: () => {
        // The hook already shows a toast, but we can add more logic here if needed
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error || !requestDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center text-red-600 bg-red-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Gagal Memuat Data</h2>
          <p>Tidak dapat menemukan detail permintaan Anda. Mungkin sudah dibatalkan atau ditolak.</p>
          <button 
            onClick={() => navigate('/workshop-setup')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Kembali ke Halaman Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        
        <div className="flex justify-center">
          <Clock className="text-yellow-500" size={48} />
        </div>

        <h1 className="text-2xl font-bold text-gray-800">Menunggu Konfirmasi</h1>
        
        <p className="text-gray-600">
          Permintaan Anda untuk bergabung dengan bengkel <span className="font-bold text-gray-900">{requestDetail.workshopName}</span> telah terkirim dan sedang menunggu persetujuan dari pemilik.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-left">
          <h3 className="font-semibold text-gray-700 border-b pb-2">Informasi Pemilik Bengkel</h3>
          <div>
            <p className="text-sm text-gray-500">Nama</p>
            <p className="font-medium text-gray-800">{requestDetail.ownerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">No. Telepon</p>
            <p className="font-medium text-gray-800">{requestDetail.ownerPhone || 'Tidak tersedia'}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <a 
            href={requestDetail.ownerPhone ? `https://wa.me/${requestDetail.ownerPhone.replace('+', '')}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center px-4 py-3 font-semibold rounded-lg transition-colors ${requestDetail.ownerPhone ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            aria-disabled={!requestDetail.ownerPhone}
            onClick={(e) => !requestDetail.ownerPhone && e.preventDefault()}
          >
            <Phone size={18} className="mr-2" />
            Hubungi via WhatsApp
          </a>

          <button 
            onClick={handleCancelRequest}
            disabled={cancelRequestMutation.isPending}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            <XCircle size={18} className="mr-2" />
            {cancelRequestMutation.isPending ? 'Membatalkan...' : 'Batalkan Permintaan'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default WaitingConfirmationPage;
