import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Car, Star } from 'lucide-react';
import { useBookings } from '../hooks/useBookings';
import type { Booking } from '../types';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: bookings, isLoading } = useBookings();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'on_the_way': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'accepted': return 'Dikonfirmasi';
      case 'on_the_way': return 'Dalam Perjalanan';
      case 'in_progress': return 'Dikerjakan';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Booking</h1>
          <p className="text-gray-600">Lihat semua booking dan transaksi Anda</p>
        </div>

        {!bookings || !bookings.data || bookings.data.length === 0 ? (
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
            {bookings.data.map((booking: Booking) => (
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
                        {booking.serviceType === 'panggil_montir' ? 'Panggil Montir' : 'Bawa ke Bengkel'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {booking.vehicle.make} {booking.vehicle.model} - {booking.vehicle.plate}
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
                      {new Date(booking.scheduledAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm truncate">
                      {booking.location.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg">
                      Rp {booking.price.toLocaleString('id-ID')}
                    </span>
                    <span className={`text-sm ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {booking.paymentStatus === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                    </span>
                  </div>

                  {(booking.montir?.review || booking.workshop?.review) && (
                    <div className="flex items-center space-x-2">
                      <Star size={16} className="text-yellow-400" />
                      <span className="text-sm text-gray-600">Sudah Direview</span>
                    </div>
                  )}
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