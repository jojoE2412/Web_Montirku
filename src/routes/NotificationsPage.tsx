import React, { useState } from 'react';
import { Bell, Check, Trash2, Settings } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Booking Dikonfirmasi',
      body: 'Montir telah menerima booking Anda dan sedang dalam perjalanan',
      read: false,
      createdAt: '2024-01-15T10:30:00Z',
      meta: { bookingId: 'booking-1' }
    },
    {
      id: '2',
      title: 'Pembayaran Berhasil',
      body: 'Pembayaran untuk servis montir sebesar Rp 75.000 telah berhasil',
      read: false,
      createdAt: '2024-01-14T15:45:00Z',
      meta: { amount: 75000 }
    },
    {
      id: '3',
      title: 'Promo Spesial',
      body: 'Dapatkan diskon 20% untuk servis berkala bulan ini!',
      read: true,
      createdAt: '2024-01-13T09:20:00Z',
      meta: { promoCode: 'SERVIS20' }
    },
    {
      id: '4',
      title: 'Booking Selesai',
      body: 'Servis kendaraan Anda telah selesai. Berikan rating untuk montir!',
      read: true,
      createdAt: '2024-01-12T16:15:00Z',
      meta: { bookingId: 'booking-2' }
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (title: string) => {
    if (title.includes('Booking')) return '🚗';
    if (title.includes('Pembayaran')) return '💳';
    if (title.includes('Promo')) return '🎉';
    return '📢';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Notifikasi</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
            </p>
          </div>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Check size={16} />
                <span>Tandai Semua</span>
              </button>
            )}
            <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Notifikasi</h3>
            <p className="text-gray-600">Semua notifikasi sudah dibersihkan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl
                  ${!notification.read ? 'border-l-4 border-blue-500' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.title)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-bold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.body}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Tandai sudah dibaca"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus notifikasi"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Pengaturan Notifikasi</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Notifikasi Booking</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Notifikasi Pembayaran</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Notifikasi Promo</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Email Notifications</span>
              <input type="checkbox" className="toggle" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;