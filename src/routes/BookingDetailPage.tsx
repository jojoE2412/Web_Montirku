import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Car, User, Star, CreditCard } from 'lucide-react';
import { useBooking, useUpdateBooking } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import toast from 'react-hot-toast';

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: booking, isLoading } = useBooking(id!);
  const updateBooking = useUpdateBooking();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking tidak ditemukan</h2>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold transition-colors"
          >
            Kembali ke Riwayat
          </button>
        </div>
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
      case 'pending': return 'Menunggu Konfirmasi';
      case 'accepted': return 'Dikonfirmasi';
      case 'on_the_way': return 'Montir Dalam Perjalanan';
      case 'in_progress': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        updates: { status: newStatus }
      });
      toast.success('Status berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handlePayment = async () => {
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        updates: { paymentStatus: 'paid' }
      });
      toast.success('Pembayaran berhasil!');
    } catch (error) {
      toast.error('Gagal memproses pembayaran');
    }
  };

  const handleSubmitReview = async () => {
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        updates: { review: { rating, comment } }
      });
      toast.success('Review berhasil dikirim!');
      setShowRatingModal(false);
    } catch (error) {
      toast.error('Gagal mengirim review');
    }
  };

  const canUpdateStatus = user?.role === 'montir' && booking.montirId === user.id;
  const canRate = booking.status === 'completed' && !booking.review && booking.userId === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black">Detail Booking</h1>
                <p className="text-black/80">#{booking.id.slice(0, 8)}</p>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Service Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {booking.serviceType === 'mechanic' ? (
                      <Car size={20} className="text-blue-600" />
                    ) : (
                      <Car size={20} className="text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Jenis Layanan</p>
                    <p className="text-gray-600">
                      {booking.serviceType === 'mechanic' ? 'Panggil Montir' : 'Derek/Towing'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Car size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Kendaraan</p>
                    <p className="text-gray-600">
                      {booking.vehicle.make} {booking.vehicle.model} - {booking.vehicle.plate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Waktu</p>
                    <p className="text-gray-600">
                      {new Date(booking.scheduledAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MapPin size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Lokasi</p>
                    <p className="text-gray-600 text-sm">{booking.location.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Harga</p>
                    <p className="text-gray-600">Rp {booking.price.toLocaleString('id-ID')}</p>
                    <p className={`text-sm ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {booking.paymentStatus === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-3">
                {booking.paymentStatus === 'unpaid' && booking.userId === user?.id && (
                  <button
                    onClick={handlePayment}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                  >
                    Bayar Sekarang
                  </button>
                )}

                {canUpdateStatus && (
                  <div className="flex space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate('accepted')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('cancelled')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusUpdate('on_the_way')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Dalam Perjalanan
                      </button>
                    )}
                    {booking.status === 'on_the_way' && (
                      <button
                        onClick={() => handleStatusUpdate('in_progress')}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Mulai Kerjakan
                      </button>
                    )}
                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate('completed')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                )}

                {canRate && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-bold transition-colors"
                  >
                    Beri Rating
                  </button>
                )}
              </div>
            </div>

            {/* Review */}
            {booking.review && (
              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-3">Review</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <RatingStars rating={booking.review.rating} readonly />
                    <span className="font-medium">{booking.review.rating}/5</span>
                  </div>
                  <p className="text-gray-700">{booking.review.comment}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Beri Rating</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex justify-center">
                  <RatingStars rating={rating} onRatingChange={setRating} size={32} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  rows={4}
                  placeholder="Bagikan pengalaman Anda..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold transition-colors"
              >
                Kirim Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailPage;