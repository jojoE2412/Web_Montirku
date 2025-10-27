import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users } from 'lucide-react';

const WorkshopSetupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Selamat Datang, Montir!</h1>
        <p className="text-lg text-gray-600 mb-12">
          Untuk melanjutkan, Anda perlu terhubung dengan sebuah bengkel. <br />
          Silakan buat bengkel baru atau gabung dengan bengkel yang sudah terdaftar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Option 1: Create a new workshop */}
          <div
            onClick={() => navigate('/workshop/create')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col items-center"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Building size={40} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Bengkel Baru</h2>
            <p className="text-gray-600">
              Daftarkan bengkel Anda sendiri dan jadilah pemilik. Anda akan dapat mengelola montir dan pesanan.
            </p>
          </div>

          {/* Option 2: Join an existing workshop */}
          <div
            onClick={() => navigate('/workshop/join')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col items-center"
          >
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Users size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Gabung Bengkel</h2>
            <p className="text-gray-600">
              Cari dan kirim permintaan untuk bergabung dengan bengkel yang sudah ada sebagai montir staf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopSetupPage;
