import { api } from './api';
import { Booking, BookingsResponse } from '../types';

export interface CreateBookingData {
  // This interface is now more flexible to accommodate FormData for file uploads
  // When sending files, FormData will be used directly.
  // Otherwise, a plain object with these properties will be used.
  serviceType: 'panggil_montir' | 'bawa_bengkel';
  subType?: 'darurat' | 'rutin' | 'bawa_sendiri' | 'towing';
  workshopId?: string;
  vehicle?: { make?: string; model?: string; plate?: string; };
  location?: { lat: number; lng: number; address: string; };
  scheduledAt?: string;
  description?: string;
  additionalNotes?: string;
  pickupLocation?: { lat: number; lng: number; address: string; };
  destinationLocation?: { lat: number; lng: number; address: string; } | null;
  media?: File[]; // For type checking, though FormData will handle actual transfer
}

export const bookingService = {
  // Mendapatkan semua booking milik user
  async getBookings(userId?: string): Promise<BookingsResponse> {
    const response = await api.get('/bookings', { params: { userId } });
    return response.data;
  },

  // Mendapatkan detail booking berdasarkan ID
  async getBooking(id: string): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Membuat booking baru
  async createBooking(data: CreateBookingData | FormData): Promise<Booking> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await api.post('/bookings', data, data instanceof FormData ? config : {});
    return response.data;
  },

  // Mengupdate data booking
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}`, updates);
    return response.data;
  },

  // Menambahkan ulasan setelah servis selesai
  async addReview(bookingId: string, rating: number, comment: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${bookingId}`, {
      review: { rating, comment }
    });
    return response.data;
  }
};
