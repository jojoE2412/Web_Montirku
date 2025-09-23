import React, { useState } from 'react';
import { User, Car, FileText, Settings, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'vehicles', label: 'Kendaraan', icon: Car },
    { id: 'documents', label: 'Dokumen', icon: FileText },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} className="text-black" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black">{user?.fullName}</h1>
              <p className="text-black/80">{user?.email}</p>
              <p className="text-black/70 text-sm capitalize">{user?.role}</p>
            </div>
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Edit size={20} className="text-black" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Informasi Profil</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={user?.fullName || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor HP
                      </label>
                      <input
                        type="tel"
                        value={user?.phone || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <button className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold transition-colors">
                      Edit Profil
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'vehicles' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Kendaraan Saya</h2>
                    <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-medium transition-colors">
                      Tambah Kendaraan
                    </button>
                  </div>
                  <div className="text-center py-8">
                    <Car size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada kendaraan terdaftar</p>
                    <p className="text-gray-500 text-sm">Tambahkan kendaraan untuk mempercepat proses booking</p>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Dokumen</h2>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText size={20} className="text-gray-400" />
                          <div>
                            <p className="font-medium">KTP</p>
                            <p className="text-sm text-gray-600">Belum diupload</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                          Upload
                        </button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText size={20} className="text-gray-400" />
                          <div>
                            <p className="font-medium">SIM</p>
                            <p className="text-sm text-gray-600">Belum diupload</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                          Upload
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Pengaturan</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Notifikasi</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-gray-700">Email Notifications</span>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-gray-700">Push Notifications</span>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-gray-700">SMS Notifications</span>
                          <input type="checkbox" className="toggle" />
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Privasi</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-gray-700">Bagikan Lokasi</span>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-gray-700">Profil Publik</span>
                          <input type="checkbox" className="toggle" />
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors">
                        Hapus Akun
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;