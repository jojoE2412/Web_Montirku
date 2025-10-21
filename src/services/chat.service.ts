import { api } from './api';
import { Conversation, Message } from '../types';

export interface CreateConversationData {
  bookingId: string;
  customerId: string;
  montirId?: string;
  workshopId?: string;
}

// This interface is now mainly for type-hinting in the component, 
// the actual data will be sent as FormData.
export interface SendMessageData {
  conversationId: string;
  text?: string;
  media?: File;
}

export const chatService = {
  async createConversation(data: CreateConversationData): Promise<{ message?: string; conversationId: string }> {
    const response = await api.post('/conversations', data);
    return response.data;
  },

  async getConversationByBookingId(bookingId: string): Promise<Conversation> {
    const response = await api.get(`/conversations/booking/${bookingId}`);
    return response.data;
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const response = await api.get(`/conversations/user/${userId}`);
    return response.data;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  },

  async sendMessage(data: FormData): Promise<Message> {
    const response = await api.post('/messages', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};