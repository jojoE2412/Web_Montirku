import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Clock, MapPin, Truck, Building2 } from 'lucide-react';
import PromoBanner from '../../components/PromoBanner';

const DashboardCustomer = () => {
  const navigate = useNavigate();

  type ServiceType = 'panggil_darurat' | 'perawatan_rutin' | 'bawa_sendiri' | 'derek_towing';

  const handleNavigate = (service: string) => {
  switch (service) {
    case 'panggil_darurat':
      navigate('/booking/panggil-darurat');
      break;
    case 'perawatan_rutin':
      navigate('/booking/perawatan-rutin');
      break;
    case 'bawa_sendiri':
      navigate('/booking/bawa-sendiri');
      break;
    case 'derek_towing':
      navigate('/booking/towing');
      break;
    default:
      navigate('/booking');
  }
};


  return (
    <div className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <PromoBanner />

        {/* Layanan Utama */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Layanan Utama</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1. Panggil Darurat */}
            <button
              onClick={() => handleNavigate('panggil_darurat')}
              className="p-5 bg-white rounded-xl shadow hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all text-left"
            >
              <div className="p-3 bg-red-100 rounded-full w-fit mb-3">
                <Wrench className="text-red-600" size={24} />
              </div>
              <h3 className="font-bold text-lg">Panggil Darurat</h3>
              <p className="text-sm text-gray-600">Montir datang ke lokasi Anda</p>
            </button>

            {/* 2. Perawatan Rutin */}
            <button
              onClick={() => handleNavigate('perawatan_rutin')}
              className="p-5 bg-white rounded-xl shadow hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all text-left"
            >
              <div className="p-3 bg-blue-100 rounded-full w-fit mb-3">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-lg">Perawatan Rutin</h3>
              <p className="text-sm text-gray-600">Servis terjadwal di tempat anda</p>
            </button>

            {/* 3. Bawa Sendiri */}
            <button
              onClick={() => handleNavigate('bawa_sendiri')}
              className="p-5 bg-white rounded-xl shadow hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all text-left"
            >
              <div className="p-3 bg-green-100 rounded-full w-fit mb-3">
                <Building2 className="text-green-600" size={24} />
              </div>
              <h3 className="font-bold text-lg">Bawa Sendiri</h3>
              <p className="text-sm text-gray-600">Datang langsung ke bengkel mitra</p>
            </button>

            {/* 4. Derek / Towing */}
            {(() => {
              const isTowingServiceAvailable = false; // Set to false to disable
              const disabledClasses = "opacity-50 cursor-not-allowed";
              const enabledClasses = "hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all text-left";

              return (
                <button
                  onClick={isTowingServiceAvailable ? () => handleNavigate('derek_towing') : undefined}
                  className={`p-5 bg-white rounded-xl shadow ${isTowingServiceAvailable ? enabledClasses : disabledClasses}`}
                  disabled={!isTowingServiceAvailable}
                >
                  <div className="p-3 bg-yellow-100 rounded-full w-fit mb-3">
                    <Truck className="text-yellow-600" size={24} />
                  </div>
                  <h3 className="font-bold text-lg">Derek / Towing</h3>
                  <p className="text-sm text-gray-600">Kendaraan Anda diantar ke bengkel</p>
                </button>
              );
            })()}
          </div>
        </div>

        {/* Statistik */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Montir Terpercaya', value: '500+' },
            { label: 'Kendaraan Dilayani', value: '10,000+' },
            { label: 'Kota Tersedia', value: '25+' },
            { label: 'Rating Kepuasan', value: '4.9/5' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCustomer;
