import React, { useState } from 'react';
import { Wrench, Car, Clock, Star, Shield, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../auth/LoginPage';
import SignUpPage from '../auth/SignUpPage';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const switchToSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  const switchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-conic-gradient(black 0% 25%, transparent 0% 50%) 50% / 20px 20px`
          }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black drop-shadow-lg">MontirKu</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/shop')}
                className="px-4 py-2 text-black font-semibold hover:text-gray-700 transition-colors"
              >
                Shop
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => setShowSignUp(true)}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Daftar
              </button>
            </div>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-6 text-gray-800">
              Solusi Cepat untuk <span className="text-yellow-500">Kendaraan Anda</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Panggil montir profesional atau layanan derek kapan saja, di mana saja. Layanan darurat dan perawatan rutin tersedia 24/7.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSignUp(true)}
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-bold text-lg transition-colors flex items-center space-x-2"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight size={24} />
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="px-8 py-4 border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 rounded-lg font-bold text-lg transition-colors"
              >
                Lihat Shop
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-100 p-4 rounded-xl">
                    <Wrench size={32} className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Panggil Montir</h3>
                    <p className="text-gray-600">Respons cepat 15-30 menit</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-4 rounded-xl">
                    <Car size={32} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Derek/Towing</h3>
                    <p className="text-gray-600">Layanan derek 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Kenapa Memilih MontirKu?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Cepat & Responsif',
                description: 'Montir tiba dalam 15-30 menit untuk panggilan darurat',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Shield,
                title: 'Terpercaya & Aman',
                description: 'Semua montir terverifikasi dan berpengalaman',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: Star,
                title: 'Rating Tinggi',
                description: 'Kepuasan pelanggan 4.9/5 dari ribuan ulasan',
                color: 'bg-yellow-100 text-yellow-600'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className={`${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Dua Kategori Layanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-2xl p-8">
              <div className="bg-red-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Panggil Darurat</h3>
              <ul className="text-left space-y-2">
                {['Respons cepat 15-30 menit', 'Layanan 24/7', 'Montir datang ke lokasi', 'Untuk keadaan darurat'].map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Perawatan Rutin</h3>
              <ul className="text-left space-y-2">
                {['Jadwal fleksibel', 'Ke bengkel atau panggil', 'Servis berkala', 'Harga transparan'].map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Statistik Kami</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Montir Terpercaya' },
              { value: '10,000+', label: 'Kendaraan Dilayani' },
              { value: '25+', label: 'Kota Tersedia' },
              { value: '4.9/5', label: 'Rating Kepuasan' }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-yellow-500 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Siap untuk Memulai?</h2>
        <p className="text-xl text-gray-600 mb-8">Bergabunglah dengan ribuan pengguna yang puas</p>
        <button
          onClick={() => setShowSignUp(true)}
          className="px-12 py-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-bold text-xl transition-colors"
        >
          Daftar Sekarang
        </button>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 MontirKu. All rights reserved.</p>
        </div>
      </footer>

      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
          onSwitchToSignUp={switchToSignUp}
        />
      )}

      {showSignUp && (
        <SignUpPage
          onClose={() => setShowSignUp(false)}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </div>
  );
};

export default LandingPage;
