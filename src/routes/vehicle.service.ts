import { api } from '../services/api';
 // ini wrapper axios/fetch yg sudah ada

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
}

// Ambil semua kendaraan user
export const getVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await api.get('/vehicles');
  return data;
};

// Tambah kendaraan baru
export const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
  const { data } = await api.post('/vehicles', vehicle);
  return data;
};

// Update kendaraan
export const updateVehicle = async (id: string, vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
  const { data } = await api.put(`/vehicles/${id}`, vehicle);
  return data;
};

// Hapus kendaraan
export const deleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};
