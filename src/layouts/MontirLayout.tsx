import React, { useState, ReactNode } from 'react';
import { Bell, HelpCircle, Menu, X, User, History, Settings, Wallet, Wrench, Car, ArrowLeft, ClipboardList, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface MontirLayoutProps {
  children: ReactNode;
}

const MontirLayout: React.FC<MontirLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Dashboard', icon: Wrench, path: '/montir/dashboard' },
    { title: 'Permintaan Layanan', icon: ClipboardList, path: '/montir/requests' },
    { title: 'Jadwal Perawatan', icon: Calendar, path: '/montir/schedule' },
    { title: 'Riwayat Order', icon: History, path: '/montir/history' },
    {
      title: 'Profile',
      icon: User,
      path: '/profile',
      subItems: [
        { name: 'Settings', icon: Settings, path: '/profile' },
        { name: 'Dompet Digital', icon: Wallet, path: '/wallet' }
      ]
    },
    { title: 'Notifikasi', icon: Bell, path: '/notifications' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header - Blue Theme */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-conic-gradient(white 0% 25%, transparent 0% 50%) 50% / 20px 20px`
          }}></div>
        </div>

        <div className="relative z-10 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isSidebarOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
              </button>

              <Link to="/montir/dashboard" className="flex items-center space-x-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                  MontirKu Pro
                </h1>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/montir/dashboard" className="font-semibold text-white hover:text-blue-100 transition-colors">Dashboard</Link>
              <Link to="/montir/requests" className="font-semibold text-white hover:text-blue-100 transition-colors">Permintaan</Link>
            </nav>

            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Bell size={20} className="text-white" />
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600">Tidak ada notifikasi terbaru</p>
                      </div>
                    </div>
                  )}
                </div>

                <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <HelpCircle size={20} className="text-white" />
                  <span className="font-semibold text-white">Bantuan</span>
                </button>

                {user && (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-white">{user.fullName}</div>
                      <div className="text-xs text-blue-100 capitalize">{user.role}</div>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <button
                      onClick={logout}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Blue Theme */}
        <>
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div className={`
            fixed left-0 top-0 h-full bg-gradient-to-b from-blue-500 to-blue-600
            transform transition-transform duration-300 ease-in-out z-50
            w-80 lg:w-72 shadow-2xl
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:relative lg:shadow-none
          `}>
            <div className="p-4 pt-4 h-full overflow-y-auto">
              <div className="p-4 border-b border-white/10">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center space-x-2 text-white font-semibold mb-3 lg:hidden"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </button>
              </div>

              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div key={index} className="group">
                    <div
                      className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                      onClick={() => {
                        navigate(item.path);
                        setIsSidebarOpen(false);
                      }}
                    >
                      <item.icon size={20} className="text-white" />
                      <span className="font-semibold text-white flex-1">{item.title}</span>
                      {item.subItems && (
                        <span className="text-white/70">−</span>
                      )}
                    </div>
                    {item.subItems && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <div
                            key={subIndex}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => {
                              navigate(subItem.path);
                              setIsSidebarOpen(false);
                            }}
                          >
                            <subItem.icon size={16} className="text-white/70" />
                            <span className="text-white/80">{subItem.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => navigate('/montir/dashboard')}
            className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <Wrench size={24} className="text-blue-600" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/montir/requests')}
            className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <ClipboardList size={24} className="text-blue-600" />
            <span className="text-xs mt-1">Permintaan</span>
          </button>
          <button
            onClick={() => navigate('/montir/history')}
            className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <History size={24} className="text-blue-600" />
            <span className="text-xs mt-1">Riwayat</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <User size={24} className="text-blue-600" />
            <span className="text-xs mt-1">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MontirLayout;
