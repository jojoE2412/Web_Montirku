import React from 'react';
import { Calendar, Clock, MapPin, Car } from 'lucide-react';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../context/AuthContext';

const ScheduleMontir: React.FC = () => {
  const { user } = useAuth();
  const { data: allBookings, isLoading } = useBookings();

  const myScheduledBookings = allBookings?.filter(booking =>
    booking.montirId === user?.id &&
    booking.status !== 'completed' &&
    booking.status !== 'cancelled'
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()) || [];

  const groupByDate = (bookings: typeof myScheduledBookings) => {
    return bookings.reduce((acc, booking) => {
      const date = new Date(booking.scheduledAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    }, {} as Record<string, typeof myScheduledBookings>);
  };

  const groupedBookings = groupByDate(myScheduledBookings);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'on_the_way': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Dikonfirmasi';
      case 'on_the_way': return 'Dalam Perjalanan';
      case 'in_progress': return 'Sedang Dikerjakan';
      default: return status;
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
          <h1 className="text-3xl font-bold text-gray-800">Jadwal Perawatan</h1>
          <p className="text-gray-600">Total {myScheduledBookings.length} jadwal aktif</p>
        </div>

        {Object.keys(groupedBookings).length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <Calendar size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada jadwal</h3>
            <p className="text-gray-600">Jadwal perawatan akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBookings).map(([date, bookings]) => (
              <div key={date} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center space-x-2 text-white">
                    <Calendar size={20} />
                    <h2 className="text-lg font-bold">{date}</h2>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Car size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold">
                              {booking.serviceType === 'mechanic' ? 'Panggil Montir' : 'Derek/Towing'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.vehicle.make} {booking.vehicle.model} - {booking.vehicle.plate}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock size={16} />
                          <span className="text-sm">
                            {new Date(booking.scheduledAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          {booking.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleMontir;
