import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workshopService } from '../services/workshop.service';

// Define a type for the join request data for better type safety
export interface JoinRequest {
  id: string;
  status: string;
  created_at: string;
  fullName: string;
  email: string;
  phone: string;
}

export const useJoinRequests = () => {
  return useQuery<JoinRequest[]>({ 
    queryKey: ['join-requests'],
    queryFn: () => workshopService.getJoinRequests(),
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string, status: 'approved' | 'rejected' }) =>
      workshopService.respondToRequest(requestId, status),
    onSuccess: () => {
      toast.success('Respons telah terkirim!');
      // Invalidate and refetch the join-requests query to update the list
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
    },
    onError: () => {
      toast.error('Gagal mengirim respons.');
    }
  });
};

// Type for a workshop member
export interface WorkshopMember {
  memberEntryId: string; // The ID of the workshop_members entry
  montirId: string;      // The ID of the montir (user_accounts.id)
  fullName: string;
  email: string;
  phone: string;
}

export const useWorkshopMembers = () => {
  return useQuery<WorkshopMember[]>({ 
    queryKey: ['workshop-members'],
    queryFn: () => workshopService.getWorkshopMembers(),
  });
};

export const useRemoveWorkshopMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => workshopService.removeWorkshopMember(memberId),
    onSuccess: () => {
      toast.success('Karyawan berhasil diberhentikan.');
      queryClient.refetchQueries({ queryKey: ['workshop-members'] }); // Changed to refetchQueries
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Gagal memberhentikan karyawan.';
      toast.error(errorMessage);
    },
  });
};
