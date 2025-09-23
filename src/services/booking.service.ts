import { api } from './api';
import { Booking } from '../types';

interface CreateBookingData {
  serviceType: 'mechanic' | 'towing';
  vehicle: {
    make?: string;
    model?: string;
    plate?: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  scheduledAt: string;
}

export const bookingService = {
  async getBookings(userId?: string): Promise<Booking[]> {
    const response = await api.get('/bookings', { params: { userId } });
    return response.data;
  },

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}`, updates);
    return response.data;
  },

  async addReview(bookingId: string, rating: number, comment: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${bookingId}`, {
      review: { rating, comment }
    });
    return response.data;
  }
};