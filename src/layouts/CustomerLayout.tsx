import React, { useState, ReactNode } from 'react';
import { Bell, HelpCircle, Menu, X, User, ShoppingCart, History, Tag, Settings, Wallet, Package, Wrench, Car, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Beranda', icon: Car, path: '/user/dashboard' },
    {
      title: 'Jual Beli',
      icon: ShoppingCart,
      path: '/shop',
      subItems: [
        { name: 'Sparepart', icon: Package, path: '/shop' },
        { name: 'Aksesoris', icon: Wrench, path: '/shop' },
        { name: 'Ban & Oli', icon: Car, path: '/shop' }
      ]
    },
    {
      title: 'Profile',
      icon: User,
      path: '/profile',
      subItems: [
        { name: 'Settings', icon: Settings, path: '/profile' },
        { name: 'Dompet Digital', icon: Wallet, path: '/wallet' }
      ]
    },
    { title: 'Riwayat', icon: History, path: '/history' },
    { title: 'Promo/Discount', icon: Tag, path: '/user/dashboard' },
    { title: 'Notifikasi', icon: Bell, path: '/notifications' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Header - Yellow/Orange Theme */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-conic-gradient(black 0% 25%, transparent 0% 50%) 50% / 20px 20px`
          }}></div>
        </div>

        <div className="relative z-10 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link to="/user/dashboard" className="flex items-center space-x-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-black drop-shadow-lg">
                  MontirKu
                </h1>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/user/dashboard" className="font-semibold text-black hover:text-gray-700 transition-colors">Beranda</Link>
              <Link to="/shop" className="font-semibold text-black hover:text-gray-700 transition-colors">Shop</Link>
            </nav>

            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="flex items-center space-x-2 px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
                  >
                    <Bell size={20} />
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

                <button
                  onClick={() => navigate('/cart')}
                  className="flex items-center space-x-2 px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors relative"
                >
                  <ShoppingCart size={20} />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </button>

                {user && (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-black">{user.fullName}</div>
                      <div className="text-xs text-black/70 capitalize">{user.role}</div>
                    </div>
                    <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                      <User size={20} className="text-black" />
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
        {/* Sidebar - Orange Theme */}
        <>
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div className={`
            fixed left-0 top-0 h-full bg-gradient-to-b from-orange-400 to-orange-500
            transform transition-transform duration-300 ease-in-out z-50
            w-80 lg:w-72 shadow-2xl
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:relative lg:shadow-none
          `}>
            <div className="p-4 pt-4 h-full overflow-y-auto">
              <div className="p-4 border-b border-black/10">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center space-x-2 text-black font-semibold mb-3 lg:hidden"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </button>
              </div>

              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div key={index} className="group">
                    <div
                      className="flex items-center space-x-3 p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors cursor-pointer"
                      onClick={() => {
                        navigate(item.path);
                        setIsSidebarOpen(false);
                      }}
                    >
                      <item.icon size={20} className="text-black" />
                      <span className="font-semibold text-black flex-1">{item.title}</span>
                      {item.subItems && (
                        <span className="text-black/70">−</span>
                      )}
                    </div>
                    {item.subItems && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <div
                            key={subIndex}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                            onClick={() => {
                              navigate(subItem.path);
                              setIsSidebarOpen(false);
                            }}
                          >
                            <subItem.icon size={16} className="text-black/70" />
                            <span className="text-black/80">{subItem.name}</span>
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
            onClick={() => navigate('/user/dashboard')}
            className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <Car size={24} className="text-yellow-600" />
            <span className="text-xs mt-1">Beranda</span>
          </button>
          <button
            onClick={() => navigate('/booking')}
            className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <Wrench size={24} className="text-yellow-600" />
            <span className="text-xs mt-1">Booking</span>
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <History size={24} className="text-yellow-600" />
            <span className="text-xs mt-1">Riwayat</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <User size={24} className="text-yellow-600" />
            <span className="text-xs mt-1">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
