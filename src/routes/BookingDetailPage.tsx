
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, MessageSquare } from 'lucide-react';
import { useBooking, useUpdateBooking } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import toast from 'react-hot-toast';
import ChatWindow from '../components/ChatWindow';
import { useCreateConversation, useConversationByBookingId } from '../hooks/useChat';
import { useWorkshops } from '../hooks/useWorkshops';

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: booking, isLoading } = useBooking(id!);
  const updateBooking = useUpdateBooking();
  const { data: conversation } = useConversationByBookingId(id!);
  const createConversation = useCreateConversation();
  const { workshops } = useWorkshops();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [montirRating, setMontirRating] = useState(0);
  const [montirComment, setMontirComment] = useState('');
  const [bengkelRating, setBengkelRating] = useState(0);
  const [bengkelComment, setBengkelComment] = useState('');
  const [showChat, setShowChat] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div></div>;
  }

  if (!booking) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold mb-4">Booking tidak ditemukan</h2><button onClick={() => navigate('/history')} className="px-6 py-3 bg-yellow-400 rounded-lg font-bold">Kembali ke Riwayat</button></div></div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'waiting_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved':
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
      case 'pending': return 'Menunggu Montir';
      case 'waiting_approval': return 'Menunggu Persetujuan Anda';
      case 'approved': return 'Disetujui';
      case 'accepted': return 'Diterima Montir';
      case 'on_the_way': return 'Montir Dalam Perjalanan';
      case 'in_progress': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateBooking.mutateAsync({ id: booking.id, updates: { status: newStatus } });
      toast.success('Status berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handlePayment = async () => {
    try {
      await updateBooking.mutateAsync({ id: booking.id, updates: { paymentStatus: 'paid' } });
      toast.success('Pembayaran berhasil!');
    } catch (error) {
      toast.error('Gagal memproses pembayaran');
    }
  };

  const handleSubmitReview = async () => {
    if (montirRating === 0 && bengkelRating === 0) {
      toast.error('Harap berikan setidaknya satu rating (montir atau bengkel).');
      return;
    }

    const updates: any = {};
    if (montirRating > 0 && booking.montirId) {
      updates.montirReview = { rating: montirRating, comment: montirComment };
    }
    if (bengkelRating > 0 && booking.workshopId) {
      updates.bengkelReview = { rating: bengkelRating, comment: bengkelComment };
    }

    try {
      await updateBooking.mutateAsync({ id: booking.id, updates });
      toast.success('Review berhasil dikirim!');
      setShowRatingModal(false);
      // Reset rating states
      setMontirRating(0);
      setMontirComment('');
      setBengkelRating(0);
      setBengkelComment('');
    } catch (error) {
      toast.error('Gagal mengirim review');
    }
  };

  const handleChatClick = async () => {
    if (!user) {
      toast.error("Anda harus login untuk chat.");
      return;
    }

    let targetMontirId = booking.montirId;
    let targetWorkshopId = booking.destinationLocation && booking.serviceType === 'bawa_bengkel' ? workshops?.find(w => w.address === booking.destinationLocation?.address)?.id : undefined;

    if (!targetMontirId && !targetWorkshopId) {
      toast.error("Tidak ada montir atau bengkel yang terkait dengan booking ini untuk memulai chat.");
      return;
    }

    try {
      const convData = {
        bookingId: booking.id,
        customerId: booking.userId,
        montirId: targetMontirId,
        workshopId: targetWorkshopId,
      };
      const result = await createConversation.mutateAsync(convData);
      if (result.conversationId) {
        setShowChat(true);
      }
    } catch (error: any) {
      toast.error(`Gagal memulai chat: ${error.response?.data?.error || error.message}`);
      console.error("Error creating conversation:", error);
    }
  };

  const isMontir = user?.role === 'montir' && booking.montirId === user.id;
  const isCustomer = user?.id === booking.userId;

  const recipientName = (() => {
    if (isCustomer && booking.montirId) {
      // In a real app, you'd fetch montir's name here
      return "Montir"; 
    } else if (isMontir && booking.userId) {
      // In a real app, you'd fetch customer's name here
      return "Pelanggan";
    } else if (isCustomer && booking.destinationLocation && booking.serviceType === 'bawa_bengkel') {
      const workshop = workshops?.find(w => w.address === booking.destinationLocation?.address);
      return workshop?.name || "Bengkel";
    }
    return "";
  })();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <div className={`px-4 py-2 mb-4 rounded-full font-bold text-center ${getStatusColor(booking.status)}`}>{getStatusText(booking.status)}</div>

            {/* Display Montir Rating if available */}
            {booking.montir && booking.montir.name && (booking.status === 'accepted' || booking.status === 'on_the_way' || booking.status === 'in_progress' || booking.status === 'completed') && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-800">Montir Anda: {booking.montir.name}</h3>
                  {booking.montir.averageRating !== null ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <RatingStars rating={booking.montir.averageRating} readonly size={20} />
                      <span className="text-blue-700 text-sm">({booking.montir.averageRating.toFixed(1)} dari {booking.montir.ratingCount} ulasan)</span>
                    </div>
                  ) : (
                    <p className="text-blue-700 text-sm">Montir ini belum memiliki rating.</p>
                  )}
                </div>
              </div>
            )}

            {/* Display Workshop Rating if available */}
            {booking.workshop && booking.workshop.averageRating !== null && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-yellow-800">Rating Bengkel</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <RatingStars rating={booking.workshop.averageRating} readonly size={20} />
                    <span className="text-yellow-700 text-sm">({booking.workshop.averageRating.toFixed(1)} dari {booking.workshop.ratingCount} ulasan)</span>
                  </div>
                </div>
              </div>
            )}

            {/* ETA Placeholder */}
            {(booking.status === 'accepted' || booking.status === 'on_the_way') && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <h3 className="font-bold text-blue-800">Estimasi Waktu Kedatangan Montir</h3>
                <p className="text-blue-700">
                  Estimasi akan dihitung berdasarkan jarak lokasi montir ke lokasi Anda.
                  <br />
                  {/* TODO: Implement real-time ETA calculation using mechanic's location and a mapping API */}
                  Saat ini, montir sedang dalam perjalanan.
                </p>
              </div>
            )}
            
            {isCustomer && booking.status === 'waiting_approval' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <h3 className="font-bold text-yellow-800">Montir telah mengirim estimasi biaya</h3>
                    <p className="text-yellow-700">Total estimasi biaya servis adalah <strong>Rp {booking.price.toLocaleString('id-ID')}</strong>. Silakan setujui untuk melanjutkan.</p>
                    <div className="flex space-x-3 mt-3">
                        <button onClick={() => handleStatusUpdate('approved')} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg"><Check size={16} className="mr-1"/> Setuju</button>
                        <button onClick={() => handleStatusUpdate('cancelled')} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg"><X size={16} className="mr-1"/> Batal</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Info */}
            </div>

            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-3">
                {isMontir && booking.status === 'approved' && (
                    <button onClick={() => handleStatusUpdate('on_the_way')} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Dalam Perjalanan</button>
                )}
                {isMontir && booking.status === 'on_the_way' && (
                    <button onClick={() => handleStatusUpdate('in_progress')} className="px-4 py-2 bg-orange-600 text-white rounded-lg">Mulai Kerjakan</button>
                )}
                {isMontir && booking.status === 'in_progress' && (
                    <button onClick={() => handleStatusUpdate('completed')} className="px-4 py-2 bg-green-600 text-white rounded-lg">Selesaikan Pekerjaan</button>
                )}
                {isMontir && (booking.status === 'approved' || booking.status === 'on_the_way' || booking.status === 'in_progress') && (
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${booking.location.lat},${booking.location.lng}`, '_blank')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Navigasi ke Customer</button>
                )}
                {isCustomer && booking.status === 'completed' && (!booking.montir?.review && !booking.workshop?.review) && (
                    <button onClick={() => setShowRatingModal(true)} className="px-6 py-3 bg-yellow-400 text-black rounded-lg font-bold">Beri Rating</button>
                )}
                 {isCustomer && booking.paymentStatus === 'unpaid' && booking.status === 'completed' && (
                  <button onClick={handlePayment} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">Bayar Sekarang</button>
                )}
                {(isCustomer || isMontir) && (booking.montirId || (booking.destinationLocation && booking.serviceType === 'bawa_bengkel')) && (
                  <button onClick={handleChatClick} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2">
                    <MessageSquare size={16} />
                    <span>Chat</span>
                  </button>
                )}
              </div>
            </div>

            {(booking.montir?.review || booking.workshop?.review) && (
              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-3">Review Anda</h3>
                {booking.montir?.review && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-2">Review Montir ({booking.montir.name || 'Tidak Diketahui'})</h4>
                    <RatingStars rating={booking.montir.review.rating} readonly />
                    <p className="text-gray-700 mt-2">{booking.montir.review.comment}</p>
                  </div>
                )}
                {booking.workshop?.review && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Review Bengkel ({booking.workshop.name || 'Tidak Diketahui'})</h4>
                    <RatingStars rating={booking.workshop.review.rating} readonly />
                    <p className="text-gray-700 mt-2">{booking.workshop.review.comment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Beri Rating & Ulasan</h3>

            {booking.montirId && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Rating Montir ({booking.montir?.name || 'Tidak Diketahui'})</h4>
                <RatingStars rating={montirRating} onRatingChange={setMontirRating} size={32} />
                <textarea value={montirComment} onChange={(e) => setMontirComment(e.target.value)} className="w-full mt-2 p-2 border rounded" rows={2} placeholder="Komentar untuk montir (opsional)"></textarea>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Rating Bengkel ({booking.workshop?.name || 'Tidak Diketahui'})</h4>
              <RatingStars rating={bengkelRating} onRatingChange={setBengkelRating} size={32} />
              <textarea value={bengkelComment} onChange={(e) => setBengkelComment(e.target.value)} className="w-full mt-2 p-2 border rounded" rows={2} placeholder="Komentar untuk bengkel (opsional)"></textarea>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => setShowRatingModal(false)} className="px-4 py-2 rounded">Batal</button>
                <button onClick={handleSubmitReview} className="px-4 py-2 bg-yellow-400 rounded">Kirim</button>
            </div>
          </div>
        </div>
      )}
      {showChat && conversation?.id && user?.id && recipientName && (
        <ChatWindow
          conversationId={conversation.id}
          senderId={user.id}
          recipientName={recipientName}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default BookingDetailPage;
