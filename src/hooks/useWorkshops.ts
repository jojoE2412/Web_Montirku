import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workshopService, CreateWorkshopData, UpdateWorkshopData } from '../services/workshop.service';
import { Workshop } from '../types';

export const useWorkshops = (filters: { towing?: boolean } = {}) => {
  const queryClient = useQueryClient();

  // GET: ambil semua bengkel
  const { data: workshops, isLoading, error } = useQuery<Workshop[]> ({
    queryKey: ['workshops', filters], // Add filters to queryKey
    queryFn: () => workshopService.getWorkshops(filters), // Pass filters to service
  });

  // POST: tambah bengkel
  const addWorkshopMutation = useMutation({
    mutationFn: (workshop: CreateWorkshopData) => workshopService.createWorkshop(workshop),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });

  // PUT: update bengkel
  const updateWorkshopMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & UpdateWorkshopData) =>
      workshopService.updateWorkshop(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });

  // DELETE: hapus bengkel
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