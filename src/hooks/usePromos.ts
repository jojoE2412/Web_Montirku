import { useQuery } from '@tanstack/react-query';
import { promoService } from '../services/promo.service';

export const usePromos = () => {
  return useQuery({
    queryKey: ['promos'],
    queryFn: promoService.getPromos
  });
};