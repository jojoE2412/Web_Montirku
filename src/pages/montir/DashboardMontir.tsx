import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Car, CheckCircle, XCircle, Navigation, Tag, AlertTriangle, MessageSquare } from 'lucide-react';
import { useBookings, useUpdateBooking } from '../../hooks/useBookings';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ChatWindow from '../../components/ChatWindow';
import { useCreateConversation, useConversationByBookingId } from '../../hooks/useChat';

const EstimateModal: React.FC<{ bookingId: string; onClose: () => void; onSubmit: (id: string, price: number) => void; isLoading: boolean; }> = ({ bookingId, onClose, onSubmit, isLoading }) => {
    const [price, setPrice] = useState('');

    const handleSubmit = () => {
        const priceNumber = parseInt(price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            return toast.error('Masukkan estimasi harga yang valid');
        }
        onSubmit(bookingId, priceNumber);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Masukkan Estimasi Biaya</h3>
                <p className="text-sm text-gray-600 mb-4">Pelanggan akan menyetujui estimasi ini sebelum Anda melanjutkan.</p>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4" placeholder="Contoh: 150000" />
                <div className="flex space-x-3">
                    <button onClick={onClose} className="flex-1 py-2 border rounded-lg">Batal</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400">{isLoading ? 'Mengirim...' : 'Kirim Estimasi'}</button>
                </div>
            </div>
        </div>
    );
};

const DashboardMontir: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allBookingsResponse, isLoading } = useBookings();
  const updateBooking = useUpdateBooking();
  const createConversation = useCreateConversation();

  const [activeTab, setActiveTab] = useState('incoming');
  const [estimatingBooking, setEstimatingBooking] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentChatBookingId, setCurrentChatBookingId] = useState<string | null>(null);

  const incomingBookings = (allBookingsResponse?.data || []).filter(b => b.status === 'pending' && !b.montirId);
  const myBookings = (allBookingsResponse?.data || []).filter(b => b.montirId === user?.id);

  const handleAcceptBooking = async (bookingId: string, subType?: string) => {
    if (subType === 'rutin') {
        setEstimatingBooking(bookingId);
    } else {
        try {
            await updateBooking.mutateAsync({ id: bookingId, updates: { montirId: user?.id, status: 'accepted' } });
            toast.success('Booking berhasil diterima!');
        } catch (error) {
            toast.error('Gagal menerima booking');
        }
    }
  };

  const handleEstimateSubmit = async (bookingId: string, price: number) => {
    try {
        await updateBooking.mutateAsync({ id: bookingId, updates: { montirId: user?.id, status: 'waiting_approval', price } });
        toast.success('Estimasi berhasil dikirim ke pelanggan!');
        setEstimatingBooking(null);
    } catch (error) {
        toast.error('Gagal mengirim estimasi');
    }
  };

  const handleChatClick = async (bookingId: string, customerId: string) => {
    if (!user) {
      toast.error("Anda harus login untuk chat.");
      return;
    }

    try {
      const convData = {
        bookingId: bookingId,
        customerId: customerId,
        montirId: user.id,
      };
      const result = await createConversation.mutateAsync(convData);
      if (result.conversationId) {
        setCurrentChatBookingId(bookingId);
        setShowChat(true);
      }
    } catch (error: any) {
      toast.error(`Gagal memulai chat: ${error.response?.data?.error || error.message}`);
      console.error("Error creating conversation:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-teal-100 text-teal-800';
      case 'on_the_way': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'waiting_approval': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Diterima';
      case 'waiting_approval': return 'Menunggu Persetujuan Pelanggan';
      case 'approved': return 'Disetujui Pelanggan';
      case 'on_the_way': return 'Dalam Perjalanan';
      case 'in_progress': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>;
  }

  const currentChatConversation = currentChatBookingId ? useConversationByBookingId(currentChatBookingId).data : undefined;

  return (
    <div className="min-h-screen py-8 pb-24 lg:pb-8">
      {estimatingBooking && <EstimateModal bookingId={estimatingBooking} onClose={() => setEstimatingBooking(null)} onSubmit={handleEstimateSubmit} isLoading={updateBooking.isPending} />}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 shadow-lg">
            <h1 className="text-2xl font-bold text-white">Dashboard Montir</h1>
            <p className="text-blue-100">Selamat datang, {user?.fullName}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b">
            <nav className="flex">
              <button onClick={() => setActiveTab('incoming')} className={`px-6 py-4 font-medium ${activeTab === 'incoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>Booking Masuk ({incomingBookings.length})</button>
              <button onClick={() => setActiveTab('my-bookings')} className={`px-6 py-4 font-medium ${activeTab === 'my-bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>Booking Saya ({myBookings.length})</button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'incoming' && (
              <div className="space-y-4">
                {incomingBookings.length === 0 ? (
                  <div className="text-center py-8"><Clock size={48} className="mx-auto mb-4" /><p>Tidak ada booking masuk</p></div>
                ) : (
                  incomingBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-xl p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            {booking.subType === 'darurat' && <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center"><AlertTriangle size={12} className="mr-1"/>Darurat</span>}
                            {booking.subType === 'rutin' && <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center"><Tag size={12} className="mr-1"/>Perawatan Rutin</span>}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{booking.description}</p>
                        <div className="flex space-x-3 mt-4">
                            <button onClick={() => handleAcceptBooking(booking.id, booking.subType)} disabled={updateBooking.isPending} className="flex-1 flex items-center justify-center py-2 bg-green-600 text-white rounded-lg"><CheckCircle size={20} className="mr-2"/>Terima</button>
                            <button disabled={updateBooking.isPending} className="flex-1 flex items-center justify-center py-2 bg-red-600 text-white rounded-lg"><XCircle size={20} className="mr-2"/>Tolak</button>
                        </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'my-bookings' && (
              <div className="space-y-4">
                {myBookings.length === 0 ? (
                  <div className="text-center py-8"><Car size={48} className="mx-auto mb-4" /><p>Belum ada booking yang diterima</p></div>
                ) : (
                  myBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-xl p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{booking.vehicle?.make} {booking.vehicle?.model}</h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>{getStatusText(booking.status)}</div>
                        </div>
                        {/* ETA Placeholder for Montir */}
                        {(booking.status === 'accepted' || booking.status === 'on_the_way') && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                                <h4 className="font-bold text-blue-800">Estimasi Waktu Kedatangan ke Pelanggan</h4>
                                <p className="text-blue-700 text-sm">
                                    Estimasi akan dihitung berdasarkan jarak lokasi Anda ke lokasi pelanggan.
                                    {/* TODO: Implement real-time ETA calculation using montir's location and a mapping API */}
                                    Segera menuju lokasi pelanggan.
                                </p>
                            </div>
                        )}
                        <p className="text-gray-500 text-sm mb-4">{booking.description}</p>
                        {booking.status === 'waiting_approval' && <p className="text-yellow-700 bg-yellow-50 p-2 rounded-lg text-sm">Menunggu persetujuan pelanggan untuk estimasi biaya: <strong>Rp {(booking.price ?? 0).toLocaleString('id-ID')}</strong></p>}
                        <div className="flex items-center justify-between mt-4">
                            <div className="font-bold text-lg">Rp {(booking.price ?? 0) > 0 ? (booking.price ?? 0).toLocaleString('id-ID') : '-'}</div>
                            <div className="flex space-x-2">
                                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${booking.location?.lat},${booking.location?.lng}`, '_blank')} className="p-2 bg-blue-600 text-white rounded-lg"><Navigation size={16} /></button>
                                <button onClick={() => handleChatClick(booking.id, booking.user_id)} className="p-2 bg-blue-500 text-white rounded-lg"><MessageSquare size={16} /></button>
                                <button onClick={() => navigate(`/booking/${booking.id}`)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Detail</button>
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
      {showChat && currentChatConversation?.id && user?.id && (
        <ChatWindow
          conversationId={currentChatConversation.id}
          senderId={user.id}
          recipientName="Pelanggan"
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default DashboardMontir;
