import { api } from './api';
import { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async signup(userData: SignupData): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  }
};