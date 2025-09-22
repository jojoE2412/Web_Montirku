import React, { useState } from 'react';
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
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const menuItems = [
    {
      title: 'Jual Beli',
      icon: ShoppingCart,
      subItems: [
        { name: 'Sparepart', icon: Package },
        { name: 'Aksesoris', icon: Wrench },
        { name: 'Ban & Oli', icon: Car }
      ]
    },
    {
      title: 'Profile',
      icon: User,
      subItems: [
        { name: 'Settings', icon: Settings },
        { name: 'Logout', icon: LogOut },
        { name: 'Dompet Digital', icon: Wallet }
      ]
    },
    { title: 'Riwayat', icon: History },
    { title: 'Promo/Discount', icon: Tag },
    { title: 'Notifikasi', icon: Bell }
  ];

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
        <div className="p-6 pt-20 lg:pt-6 h-full overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div key={index} className="group">
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors cursor-pointer"
                  onClick={() => item.subItems && toggleExpanded(index)}
                >
                  <item.icon size={20} className="text-black" />
                  <span className="font-semibold text-black flex-1">{item.title}</span>
                  {item.subItems && (
                    <span className={`text-black/70 transition-transform duration-200 ${
                      expandedItems.includes(index) ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </span>
                  )}
                </div>
                
                {item.subItems && expandedItems.includes(index) && (
                  <div className="ml-8 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems.map((subItem, subIndex) => (
                      <div 
                        key={subIndex}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-black/10 transition-colors cursor-pointer transform hover:translate-x-1"
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