import React from 'react';
import { Wrench, Truck } from 'lucide-react';

interface ServiceCardProps {
  type: 'mechanic' | 'towing';
  onCallNow: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ type, onCallNow }) => {
  const isMechanic = type === 'mechanic';
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-4 rounded-full ${isMechanic ? 'bg-blue-100' : 'bg-green-100'}`}>
          {isMechanic ? (
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Wrench size={28} className="text-white" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Truck size={28} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {isMechanic ? 'Panggil Montir' : 'Panggil Derek/Towing'}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {isMechanic 
              ? 'Panggil montir dimana saja hingga 24 jam'
              : 'Panggil Mobil derek/Towing untuk antar kendaraan anda kemana saja'
            }
          </p>
        </div>
      </div>
      
      <button 
        onClick={onCallNow}
        className={`
          w-full py-3 px-6 rounded-full font-bold text-black shadow-md 
          transform transition-all duration-200 hover:scale-105 active:scale-95
          ${isMechanic 
            ? 'bg-yellow-400 hover:bg-yellow-500' 
            : 'bg-yellow-400 hover:bg-yellow-500'
          }
        `}
      >
        Panggil Sekarang
      </button>
    </div>
  );
};

export default ServiceCard;