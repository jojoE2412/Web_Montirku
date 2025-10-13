import React, { useState } from 'react';
import ServiceCard from './ServiceCard';
import PromoBanner from './PromoBanner';
import { Clock, Star, MapPin } from 'lucide-react';

const MainContent: React.FC = () => {
  const [showMechanicModal, setShowMechanicModal] = useState(false);
  const [showTowingModal, setShowTowingModal] = useState(false);

  const handleCallMechanic = () => {
    setShowMechanicModal(true);
  };

  const handleCallTowing = () => {
    setShowTowingModal(true);
  };

  const ServiceModal = ({ 
    isOpen, 
    onClose, 
    title, 
    type 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    type: 'mechanic' | 'towing';
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin size={20} className="text-blue-600" />
              <div>
                <p className="font-semibold">Lokasi Anda</p>
                <p className="text-sm text-gray-600">Jakarta Selatan, DKI Jakarta</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock size={20} className="text-green-600" />
              <div>
                <p className="font-semibold">Estimasi Waktu</p>
                <p className="text-sm text-gray-600">15-30 menit</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Star size={20} className="text-yellow-500" />
              <div>
                <p className="font-semibold">Rating Montir</p>
                <p className="text-sm text-gray-600">4.8/5 (124 ulasan)</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                alert(`${type === 'mechanic' ? 'Montir' : 'Derek'} sedang menuju lokasi Anda!`);
                onClose();
              }}
              className="flex-1 py-3 px-6 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold text-black transition-colors"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Promo Banner */}
        <PromoBanner />
        
        {/* Main Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ServiceCard type="mechanic" onCallNow={handleCallMechanic} />
          <ServiceCard type="towing" onCallNow={handleCallTowing} />
        </div>

        {/* Additional Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Sparepart', desc: 'Suku cadang berkualitas', color: 'from-purple-400 to-purple-500' },
            { title: 'Oli & Ban', desc: 'Oli dan ban terpercaya', color: 'from-blue-400 to-blue-500' },
            { title: 'Cuci Mobil', desc: 'Layanan cuci premium', color: 'from-green-400 to-green-500' },
            { title: 'Servis Rutin', desc: 'Perawatan berkala', color: 'from-red-400 to-red-500' }
          ].map((service, index) => (
            <div key={index} className={`bg-gradient-to-r ${service.color} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
              <h4 className="font-bold text-lg mb-2">{service.title}</h4>
              <p className="text-sm opacity-90">{service.desc}</p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Montir Terpercaya', value: '500+' },
            { label: 'Kendaraan Dilayani', value: '10,000+' },
            { label: 'Kota Tersedia', value: '25+' },
            { label: 'Rating Kepuasan', value: '4.9/5' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ServiceModal 
        isOpen={showMechanicModal}
        onClose={() => setShowMechanicModal(false)}
        title="Panggil Montir"
        type="mechanic"
      />
      
      <ServiceModal 
        isOpen={showTowingModal}
        onClose={() => setShowTowingModal(false)}
        title="Panggil Derek/Towing"
        type="towing"
      />
    </div>
  );
};

export default MainContent;