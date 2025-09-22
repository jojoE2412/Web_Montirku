import React from 'react';
import { ShoppingCart, Wrench, Search, Car, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'jual-beli', label: 'Jual/Beli', icon: ShoppingCart, color: 'text-purple-600' },
    { id: 'servis', label: 'Servis', icon: Wrench, color: 'text-red-600' },
    { id: 'diagnosa', label: 'Diagnosa', icon: Search, color: 'text-green-600' },
    { id: 'cuci', label: 'Cuci Kendaraan', icon: Car, color: 'text-blue-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-gray-600' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-400 to-yellow-500 shadow-2xl border-t border-yellow-300 z-30">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200
              ${activeTab === tab.id 
                ? 'transform -translate-y-1 scale-110' 
                : 'hover:bg-black/10'
              }
            `}
          >
            <div className={`
              p-2 rounded-full mb-1 transition-colors
              ${activeTab === tab.id 
                ? 'bg-black/20 shadow-lg' 
                : 'bg-black/10'
              }
            `}>
              <tab.icon 
                size={20} 
                className={`${tab.color} ${activeTab === tab.id ? 'drop-shadow-sm' : ''}`} 
              />
            </div>
            <span className={`
              text-xs font-semibold text-black transition-all
              ${activeTab === tab.id ? 'drop-shadow-sm' : 'opacity-80'}
            `}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;