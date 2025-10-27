import React, { useState, useEffect } from 'react';
import { User, Car, FileText, Settings, LogOut, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Vehicle data type
interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
}

// VehicleModal props type
interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id'>) => void;
  vehicle: Vehicle | null;
}

// VehicleModal Component
const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, onSave, vehicle }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setPlate(vehicle.plate);
    } else {
      setMake('');
      setModel('');
      setPlate('');
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ make, model, plate });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{vehicle ? 'Edit' : 'Tambah'} Kendaraan</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merk Kendaraan
            </label>
            <input
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Contoh: Toyota, Honda"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Kendaraan
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Contoh: Avanza, Beat"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Plat
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Contoh: B 1234 ABC"
              required
            />
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ProfilePage Component
const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const queryClient = useQueryClient();
  const { vehicles = [], isLoading } = useVehicles();

  // Mutations
  const addMutation = useMutation({
    mutationFn: (vehicle: Omit<Vehicle, 'id'>) =>
      api.post('/vehicles', vehicle).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({queryKey : ['vehicles']}),
  });

  const updateMutation = useMutation({
    mutationFn: (vehicle: Vehicle) =>
      api.put(`/vehicles/${vehicle.id}`, vehicle).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({queryKey:['vehicles']}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/vehicles/${id}`).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({queryKey:['vehicles']}),
  });

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
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
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
                  <p>Nama: {user?.fullName}</p>
                  <p>Email: {user?.email}</p>
                  <p>Role: {user?.role}</p>
                </div>
              )}

              {activeTab === 'vehicles' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Kendaraan Saya</h2>
                    <button
                      onClick={() => {
                        setEditingVehicle(null);
                        setShowVehicleModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-medium transition-colors"
                    >
                      <Plus size={16} />
                      <span>Tambah Kendaraan</span>
                    </button>
                  </div>
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : vehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <Car size={48} className="text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Belum ada kendaraan terdaftar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vehicles.map((vehicle: Vehicle) => (
                        <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Car size={20} className="text-gray-500" />
                              <div>
                                <p className="font-bold">
                                  {vehicle.make} {vehicle.model}
                                </p>
                                <p className="text-sm text-gray-600">{vehicle.plate}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingVehicle(vehicle);
                                  setShowVehicleModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteMutation.mutate(vehicle.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <VehicleModal
          isOpen={showVehicleModal}
          onClose={() => {
            setShowVehicleModal(false);
            setEditingVehicle(null);
          }}
          onSave={(vehicle) => {
            if (editingVehicle) {
              updateMutation.mutate({ ...editingVehicle, ...vehicle });
            } else {
              addMutation.mutate(vehicle);
            }
            setShowVehicleModal(false);
          }}
          vehicle={editingVehicle}
        />
      )}
    </div>
  );
};

export default ProfilePage;
