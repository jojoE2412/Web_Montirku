import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle, Vehicle } from '../routes/vehicle.service';

export const useVehicles = () => {
  const queryClient = useQueryClient();

  // GET: ambil semua kendaraan
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  // POST: tambah kendaraan
  const addMutation = useMutation({
    mutationFn: addVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // PUT: update kendaraan
  const updateMutation = useMutation({
    mutationFn: ({ id, ...vehicle }: Vehicle) => updateVehicle(id, vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // DELETE: hapus kendaraan
  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  return { vehicles, isLoading, addMutation, updateMutation, deleteMutation };
};
