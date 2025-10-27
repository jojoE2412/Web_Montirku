import { api } from './api';
import { Workshop } from '../types';

export interface CreateWorkshopData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  hasTowing: boolean;
  specializations: string[];
  operationalHours: Record<string, { isOpen: boolean; open: string; close: string }>;
  status: 'available' | 'full';
  isOpen: boolean;
}

export interface UpdateWorkshopData extends Partial<CreateWorkshopData> {}

export const workshopService = {
  async getWorkshops(filters: { towing?: boolean } = {}): Promise<Workshop[]> {
    const response = await api.get('/workshops', { params: filters });
    return response.data.data;
  },

  async getWorkshop(id: string): Promise<Workshop> {
    const response = await api.get(`/workshops/${id}`);
    return response.data;
  },

  async createWorkshop(data: CreateWorkshopData): Promise<Workshop> {
    const response = await api.post('/workshops', data);
    return response.data;
  },

  async updateWorkshop(id: string, updates: UpdateWorkshopData): Promise<Workshop> {
    const response = await api.patch(`/workshops/${id}`, updates);
    return response.data;
  },

  async deleteWorkshop(id: string): Promise<void> {
    await api.delete(`/workshops/${id}`);
  },

  // Montir requests to join a workshop
  async requestToJoin(workshopId: string): Promise<any> {
    const { data } = await api.post(`/workshops/${workshopId}/join`);
    return data;
  },

  // Montir gets detail of their pending request
  async getPendingRequestDetail(): Promise<any> {
    const { data } = await api.get('/join-requests/my-pending-detail');
    return data;
  },

  // Montir cancels their pending request
  async cancelMyPendingRequest(): Promise<any> {
    const { data } = await api.delete('/join-requests/my-pending');
    return data;
  },

  async getJoinRequests(): Promise<any[]> { // TODO: Define a proper type for the response
    const response = await api.get('/workshops/my-workshop/join-requests');
    return response.data;
  },

  async respondToRequest(requestId: string, status: 'approved' | 'rejected'): Promise<void> {
    await api.patch(`/join-requests/${requestId}`, { status });
  },

  async getWorkshopMembers(): Promise<any[]> { // TODO: Define a member type
    const response = await api.get('/workshops/my-workshop/members');
    return response.data;
  },

  async removeWorkshopMember(memberId: string): Promise<void> {
    await api.delete(`/workshop-members/${memberId}`);
  },
};
