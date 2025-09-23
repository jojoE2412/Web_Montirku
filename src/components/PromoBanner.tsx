import React from 'react';
import { Search } from 'lucide-react';
import { usePromos } from '../hooks/usePromos';

const PromoBanner: React.FC = () => {
  const { data: promos, isLoading } = usePromos();

  return (
    <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 mb-8 shadow-lg">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Cari yang anda butuhkan disini"
            className="w-full pl-12 pr-4 py-4 rounded-full border-0 shadow-md focus:ring-4 focus:ring-orange-200 focus:outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Promo Carousel */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 min-w-max">
          {isLoading ? (
            // Loading skeleton
            [1, 2, 3].map((index) => (
              <div key={index} className="flex-shrink-0 w-80 h-32 bg-gray-300 animate-pulse rounded-lg"></div>
            ))
          ) : promos && promos.length > 0 ? (
            promos.map((promo) => (
              <div key={promo.id} className="flex-shrink-0 w-80 h-32 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg relative overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 p-4 text-white">
                  <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2 inline-block">
                    PROMO SPESIAL
                  </div>
                  <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
                  <p className="text-sm opacity-90">{promo.description}</p>
                </div>
                <div className="absolute bottom-0 right-0 p-2">
                  <div className="w-12 h-8 bg-yellow-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-black">{promo.discount}%</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback to static promos
            [1, 2, 3].map((index) => (
              <div key={index} className="flex-shrink-0 w-80 h-32 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg relative overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 p-4 text-white">
                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2 inline-block">
                  PROMO SPESIAL
                </div>
                <h3 className="font-bold text-lg mb-1">Diskon 50%</h3>
                <p className="text-sm opacity-90">Servis berkala kendaraan</p>
              </div>
              <div className="absolute bottom-0 right-0 p-2">
                <div className="w-12 h-8 bg-yellow-400 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-black">50%</span>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;