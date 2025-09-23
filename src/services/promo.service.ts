import { api } from './api';
import { Promo } from '../types';

export const promoService = {
  async getPromos(): Promise<Promo[]> {
    const response = await api.get('/promos');
    return response.data;
  }
};