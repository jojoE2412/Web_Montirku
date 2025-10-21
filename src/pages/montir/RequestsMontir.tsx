import React from 'react';
import { Clock, MapPin, Car, CheckCircle, XCircle } from 'lucide-react';
import { useBookings, useUpdateBooking } from '../../hooks/useBookings';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RequestsMontir: React.FC = () => {
  const { user } = useAuth();
  const { data: allBookingsResponse, isLoading } = useBookings();
  const updateBooking = useUpdateBooking();

  const incomingBookings = (allBookingsResponse?.data || []).filter(booking =>
    booking.status === 'pending' && !booking.montirId
  );

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        updates: {
          montirId: user?.id,
          status: 'accepted',
          price: Math.floor(Math.random() * 200000) + 100000
        }
      });
      toast.success('Booking berhasil diterima!');
    } catch (error) {
      toast.error('Gagal menerima booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        updates: { status: 'cancelled' }
      });
      toast.success('Booking ditolak');
    } catch (error) {
      toast.error('Gagal menolak booking');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Permintaan Layanan Masuk</h1>
          <p className="text-gray-600">Total {incomingBookings.length} permintaan menunggu konfirmasi</p>
        </div>

        <div className="space-y-4">
          {incomingBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <Clock size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada permintaan baru</h3>
              <p className="text-gray-600">Permintaan layanan akan muncul di sini</p>
            </div>
          ) : (
            incomingBookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Car size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">
                        {booking.serviceType === 'panggil_montir' ? 'Panggil Montir' : 'Bawa ke Bengkel'}
                      </h3>
                      <p className="text-gray-600">
                        {booking.vehicle.make} {booking.vehicle.model} - {booking.vehicle.plate}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {booking.vehicle.year} | {booking.vehicle.color}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {Math.round((Date.now() - new Date(booking.createdAt).getTime()) / 60000)} menit lalu
                    </div>
                  </div>
                </div>

                {booking.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Deskripsi Masalah:</p>
                    <p className="text-gray-600">{booking.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Waktu Layanan</p>
                      <p className="text-sm font-medium">
                        {new Date(booking.scheduledAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 text-gray-600">
                    <MapPin size={18} className="mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Lokasi</p>
                      <p className="text-sm font-medium">
                        {booking.location.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleAcceptBooking(booking.id)}
                    disabled={updateBooking.isPending}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    <CheckCircle size={20} />
                    <span>Terima Pesanan</span>
                  </button>
                  <button
                    onClick={() => handleRejectBooking(booking.id)}
                    disabled={updateBooking.isPending}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    <XCircle size={20} />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${booking.location.lat},${booking.location.lng}`, '_blank')}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <MapPin size={20} />
                    <span>Navigasi</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsMontir;
