import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Car, MapPin } from 'lucide-react';

import { useBookings } from '../hooks/useBookings';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: bookingsResponse, isLoading, error } = useBookings();

  // Debug logs
  console.log('Bookings Response:', bookingsResponse);
  console.log('Error:', error);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-gray-600">Gagal memuat riwayat booking</p>
        </div>
      </div>
    );
  }

  // Fix data structure - sesuaikan dengan response backend
  const bookings = bookingsResponse?.data || [];
  console.log('Processed bookings:', bookings);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'arrived_at_workshop': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'in_progress': return 'Dikerjakan';
      case 'arrived_at_workshop': return 'Tiba di Bengkel';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const formatServiceName = (subType: string) => {
    if (!subType) return 'Layanan Tidak Diketahui';
    
    const serviceNames: { [key: string]: string } = {
      'panggil_darurat': 'Panggil Darurat',
      'perawatan_rutin': 'Perawatan Rutin',
      'bawa_sendiri': 'Bawa Sendiri',
      'towing': 'Towing'
    };

    return serviceNames[subType] || subType.replace(/_/g, ' ').split(' ').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatVehicleInfo = (booking: any) => {
    // Cek struktur data yang sebenarnya dari backend
    if (booking.vehicle_make && booking.vehicle_model && booking.vehicle_plate) {
      return `${booking.vehicle_make} ${booking.vehicle_model} - ${booking.vehicle_plate}`;
    }
    return 'Informasi kendaraan tidak tersedia';
  };

  const formatLocation = (booking: any) => {
    return booking.location_address || booking.destination_location_address || 'Lokasi tidak tersedia';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Booking</h1>
          <p className="text-gray-600">Lihat semua booking dan transaksi Anda</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Riwayat</h3>
            <p className="text-gray-600 mb-6">Anda belum memiliki booking apapun</p>
            <button
              onClick={() => navigate('/booking')}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold transition-colors"
            >
              Buat Booking Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/booking/${booking.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Car size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {formatServiceName(booking.sub_type)}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {formatVehicleInfo(booking)}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">
                      {booking.scheduled_at ? format(new Date(booking.scheduled_at), 'dd MMMM yyyy, HH:mm') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm truncate">
                      {formatLocation(booking)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg">
                      Rp {booking.price ? booking.price.toLocaleString('id-ID') : '0'}
                    </span>
                    <span className={`text-sm ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {booking.payment_status === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                    </span>
                  </div>
                </div>

                {/* Debug info - bisa dihapus setelah fix */}
                <div className="mt-2 text-xs text-gray-500">
                  ID: {booking.id} | Service: {booking.service_type} | Sub: {booking.sub_type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;