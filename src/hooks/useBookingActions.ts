import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingService } from '../services/booking.service';

export const useDelegateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, employeeId }: { bookingId: string; employeeId: string }) => 
      bookingService.delegateBooking(bookingId, employeeId),
    onSuccess: (data, variables) => {
      toast.success('Pesanan berhasil didelegasikan!');
      // Invalidate the specific booking query to refetch its details
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      // Optionally, invalidate the main bookings list as well
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Gagal mendelegasikan pesanan.';
      toast.error(errorMessage);
    },
  });
};
