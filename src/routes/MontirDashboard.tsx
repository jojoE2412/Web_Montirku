import React, { useState } from 'react';
import { Clock, MapPin, Car, Phone, CheckCircle, XCircle, Navigation } from 'lucide-react';
import { useBookings, useUpdateBooking } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MontirDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: allBookings, isLoading } = useBookings();
  const updateBooking = useUpdateBooking();
  const [activeTab, setActiveTab] = useState('incoming');

  // Filter bookings for montir
  const incomingBookings = allBookings?.filter(booking => 
    booking.status === 'pending' && !booking.montirId
  ) || [];

  const myBookings = allBookings?.filter(booking => 
    booking.montirId === user?.id
  ) || [];

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        updates: { 
          montirId: user?.id,
          status: 'accepted',
          price: Math.floor(Math.random() * 200000) + 100000 // Random price for demo
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'on_the_way': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Dikonfirmasi';
      case 'on_the_way': return 'Dalam Perjalanan';
      case 'in_progress': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Montir</h1>
              <p className="text-blue-100">Selamat datang, {user?.fullName}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{myBookings.length}</div>
              <div className="text-blue-100 text-sm">Total Booking</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-gray-800">{incomingBookings.length}</div>
            <div className="text-gray-600 text-sm">Booking Masuk</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-blue-600">
              {myBookings.filter(b => b.status === 'accepted').length}
            </div>
            <div className="text-gray-600 text-sm">Dikonfirmasi</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-orange-600">
              {myBookings.filter(b => ['on_the_way', 'in_progress'].includes(b.status)).length}
            </div>
            <div className="text-gray-600 text-sm">Sedang Berjalan</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-green-600">
              {myBookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-gray-600 text-sm">Selesai</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'incoming'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Booking Masuk ({incomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'my-bookings'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Booking Saya ({myBookings.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'incoming' && (
              <div className="space-y-4">
                {incomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Tidak ada booking masuk</p>
                  </div>
                ) : (
                  incomingBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Car size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {booking.serviceType === 'mechanic' ? 'Panggil Montir' : 'Derek/Towing'}
                            </h3>
                            <p className="text-gray-600">
                              {booking.vehicle.make} {booking.vehicle.model} - {booking.vehicle.plate}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAcceptBooking(booking.id)}
                          disabled={updateBooking.isPending}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                        >
                          <CheckCircle size={20} />
                          <span>Terima</span>
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking.id)}
                          disabled={updateBooking.isPending}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                        >
                          <XCircle size={20} />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'my-bookings' && (
              <div className="space-y-4">
                {myBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Car size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada booking yang diterima</p>
                  </div>
                ) : (
                  myBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Car size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {booking.serviceType === 'mechanic' ? 'Panggil Montir' : 'Derek/Towing'}
                            </h3>
                            <p className="text-gray-600">
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
                        <div className="flex items-start space-x-2 text-gray-600">
                          <MapPin size={16} className="mt-0.5" />
                          <span className="text-sm">
                            {booking.location.address}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="font-bold text-lg">
                          Rp {booking.price.toLocaleString('id-ID')}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`https://maps.google.com/?q=${booking.location.lat},${booking.location.lng}`, '_blank')}
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                          >
                            <Navigation size={16} />
                            <span>Navigasi</span>
                          </button>
                          <button
                            onClick={() => window.location.href = `/booking/${booking.id}`}
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium text-sm transition-colors"
                          >
                            Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MontirDashboard;