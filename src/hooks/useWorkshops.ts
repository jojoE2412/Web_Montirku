import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workshopService, CreateWorkshopData, UpdateWorkshopData } from '../services/workshop.service';
import { Workshop } from '../types';
import { useMemo } from 'react';

export const useWorkshops = (filters: { towing?: boolean } = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<any> ({
    queryKey: ['workshops', filters],
    queryFn: () => workshopService.getWorkshops(filters),
  });

  // Defensively process the data to ensure it's always an array
  const workshops = useMemo(() => {
    if (!data) return []; // If no data, return empty array
    if (Array.isArray(data)) return data; // If it's already an array, return it
    if (data && Array.isArray(data.data)) return data.data; // If it's { data: [...] }, extract the array
    return []; // Fallback to empty array for any other unexpected shape
  }, [data]);

  const addWorkshopMutation = useMutation({
    mutationFn: (workshop: CreateWorkshopData) => workshopService.createWorkshop(workshop),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });

  const updateWorkshopMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & UpdateWorkshopData) =>
      workshopService.updateWorkshop(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });

  const deleteWorkshopMutation = useMutation({
    mutationFn: (id: string) => workshopService.deleteWorkshop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });

  return {
    workshops,
    isLoading,
    error,
    addWorkshopMutation,
    updateWorkshopMutation,
    deleteWorkshopMutation,
  };
};

export const useWorkshop = (id: string) => {
  return useQuery<Workshop>({
    queryKey: ['workshop', id],
    queryFn: () => workshopService.getWorkshop(id),
    enabled: !!id,
  });
};

export const useJoinWorkshop = () => {
  return useMutation({
    mutationFn: (workshopId: string) => workshopService.requestToJoin(workshopId),
    onSuccess: () => {
      toast.success('Permintaan bergabung telah terkirim!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Gagal mengirim permintaan bergabung.';
      toast.error(errorMessage);
    },
  });
};

export const usePendingRequestDetail = () => {
  return useQuery({
    queryKey: ['pendingRequestDetail'],
    queryFn: () => workshopService.getPendingRequestDetail(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry on 404 (no pending request)
  });
};

export const useCancelRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => workshopService.cancelMyPendingRequest(),
    onSuccess: () => {
      toast.success('Permintaan bergabung telah dibatalkan.');
      // Invalidate user data to refetch and update their status
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Gagal membatalkan permintaan.';
      toast.error(errorMessage);
    },
  });
};
