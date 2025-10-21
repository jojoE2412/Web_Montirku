import React from 'react';
import { Clock, MapPin, CheckCircle } from 'lucide-react';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../context/AuthContext';

const HistoryMontir: React.FC = () => {
  const { user } = useAuth();
  const { data: allBookingsResponse, isLoading } = useBookings();

  const completedBookings = (allBookingsResponse?.data || []).filter(booking =>
    booking.montirId === user?.id && booking.status === 'completed'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalEarnings = completedBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

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
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Order</h1>
          <p className="text-gray-600">Total {completedBookings.length} order selesai</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Total Order</div>
            <div className="text-3xl font-bold text-blue-600">{completedBookings.length}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Total Pendapatan</div>
            <div className="text-3xl font-bold text-green-600">
              Rp {totalEarnings.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Rating Rata-rata</div>
            <div className="text-3xl font-bold text-yellow-500">4.8 / 5</div>
          </div>
        </div>

        {completedBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <CheckCircle size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada riwayat</h3>
            <p className="text-gray-600">Order yang selesai akan muncul di sini</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {completedBookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {booking.serviceType === 'panggil_montir' ? 'Panggil Montir' : 'Bawa ke Bengkel'}
                        </h3>
                        <p className="text-gray-600">
                          {booking.vehicle.make} {booking.vehicle.model} - {booking.vehicle.plate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-600">
                        Rp {(booking.price || 0).toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock size={16} />
                      <span className="text-sm">
                        {new Date(booking.scheduledAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-start space-x-2 text-gray-600">
                      <MapPin size={16} className="mt-0.5" />
                      <span className="text-sm">
                        {booking.location.address}
                      </span>
                    </div>
                  </div>

                  {booking.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{booking.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryMontir;
