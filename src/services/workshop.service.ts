import { api } from './api';
import { Workshop } from '../types';

export interface CreateWorkshopData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  openHours?: string;
}

export interface UpdateWorkshopData {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  status?: 'available' | 'full';
  isOpen?: boolean;
  openHours?: string;
}

export const workshopService = {
  async getWorkshops(filters?: { towing?: boolean }): Promise<Workshop[]> {
    const response = await api.get('/workshops', { params: filters });
    return response.data.data; // Assuming the API returns { data: [...] }
  },

  async getWorkshop(id: string): Promise<Workshop> {
    const response = await api.get(`/workshops/${id}`);
    return response.data;
  },

  async createWorkshop(data: CreateWorkshopData): Promise<Workshop> {
    const response = await api.post('/workshops', data);
    return response.data;
  },

  async updateWorkshop(id: string, data: UpdateWorkshopData): Promise<Workshop> {
    const response = await api.put(`/workshops/${id}`, data);
    return response.data;
  },

  async deleteWorkshop(id: string): Promise<void> {
    await api.delete(`/workshops/${id}`);
  },
};