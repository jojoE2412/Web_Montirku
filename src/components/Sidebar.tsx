import React from 'react';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCart, 
  User, 
  History, 
  Tag, 
  Bell, 
  Settings, 
  LogOut, 
  Wallet,
  Package,
  Wrench,
  Car
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Jual Beli',
      icon: ShoppingCart,
      onClick: () => navigate('/shop'),
      subItems: [
        { name: 'Sparepart', icon: Package, onClick: () => navigate('/shop') },
        { name: 'Aksesoris', icon: Wrench, onClick: () => navigate('/shop') },
        { name: 'Ban & Oli', icon: Car, onClick: () => navigate('/shop') }
      ]
    },
    {
      title: 'Profile',
      icon: User,
      onClick: () => navigate('/profile'),
      subItems: [
        { name: 'Settings', icon: Settings, onClick: () => navigate('/profile') },
        { name: 'Dompet Digital', icon: Wallet, onClick: () => navigate('/wallet') }
      ]
    },
    { title: 'Riwayat', icon: History, onClick: () => navigate('/history') },
    { title: 'Promo/Discount', icon: Tag, onClick: () => navigate('/') },
    { title: 'Notifikasi', icon: Bell, onClick: () => navigate('/notifications') }
  ];

  // Add Montir Dashboard if user is montir
  if (user?.role === 'montir') {
    menuItems.unshift({
      title: 'Dashboard Montir',
      icon: Wrench,
      onClick: () => navigate('/montir/dashboard')
    });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gradient-to-b from-orange-400 to-orange-500 
        transform transition-transform duration-300 ease-in-out z-50
        w-80 lg:w-72 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:shadow-none
      `}>
        <div className="p-4 pt-4 h-full overflow-y-auto">

          {/* Tombol Back di pojok kiri atas */}
          <div className="p-4 border-b border-black/10">
            <button 
            onClick={onClose}
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
                  onClick={item.onClick}
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
                        onClick={subItem.onClick}
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
  );
};

export default Sidebar;