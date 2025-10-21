import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkshops } from '../../hooks/useWorkshops';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import MapPicker from '../../components/MapPicker';
import { Building2, MapPin, CheckCircle, XCircle } from 'lucide-react';

const workshopSchema = z.object({
  name: z.string().min(1, 'Nama bengkel wajib diisi'),
  address: z.string().min(1, 'Alamat bengkel wajib diisi'),
  lat: z.number(),
  lng: z.number(),
  status: z.enum(['available', 'full']),
  isOpen: z.boolean(),
  openHours: z.string().min(1, 'Jam buka wajib diisi'),
});

type WorkshopForm = z.infer<typeof workshopSchema>;

const WorkshopManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workshops, isLoading, addWorkshopMutation, updateWorkshopMutation } = useWorkshops();

  const [myWorkshop, setMyWorkshop] = useState<WorkshopForm | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkshopForm>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      name: '',
      address: '',
      lat: 0,
      lng: 0,
      status: 'available',
      isOpen: true,
      openHours: '08:00 - 17:00',
    },
  });

  useEffect(() => {
    if (user && workshops) {
      const foundWorkshop = workshops.find(w => w.montirId === user.id);
      if (foundWorkshop) {
        setMyWorkshop({
          name: foundWorkshop.name,
          address: foundWorkshop.address,
          lat: foundWorkshop.lat,
          lng: foundWorkshop.lng,
          status: foundWorkshop.status,
          isOpen: foundWorkshop.isOpen,
          openHours: foundWorkshop.openHours || '08:00 - 17:00',
        });
        reset({
          name: foundWorkshop.name,
          address: foundWorkshop.address,
          lat: foundWorkshop.lat,
          lng: foundWorkshop.lng,
          status: foundWorkshop.status,
          isOpen: foundWorkshop.isOpen,
          openHours: foundWorkshop.openHours || '08:00 - 17:00',
        });
        setLocation({ lat: foundWorkshop.lat, lng: foundWorkshop.lng, address: foundWorkshop.address });
      } else {
        setMyWorkshop(null);
        reset();
        setLocation(null);
      }
    }
  }, [user, workshops, reset]);

  useEffect(() => {
    if (location) {
      setValue('lat', location.lat);
      setValue('lng', location.lng);
      setValue('address', location.address);
    }
  }, [location, setValue]);

  const onSubmit = async (data: WorkshopForm) => {
    if (!user) {
      toast.error('Anda harus login sebagai montir.');
      return;
    }
    if (!location) {
      toast.error('Silakan pilih lokasi bengkel di peta.');
      return;
    }

    try {
      if (myWorkshop) {
        // Update existing workshop
        const existingWorkshop = workshops?.find(w => w.montirId === user.id);
        if (!existingWorkshop) {
          toast.error('Gagal menemukan bengkel yang terdaftar untuk diperbarui.');
          return;
        }
        await updateWorkshopMutation.mutateAsync({
          id: existingWorkshop.id,
          ...data,
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        });
        toast.success('Detail bengkel berhasil diperbarui!');
      } else {
        // Create new workshop
        await addWorkshopMutation.mutateAsync({
          ...data,
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        });
        toast.success('Bengkel berhasil didaftarkan!');
      }
      // Refresh data
      // queryClient.invalidateQueries(['workshops']); // This is handled by onSuccess in useWorkshops
    } catch (err: any) {
      toast.error(`Gagal menyimpan detail bengkel: ${err.response?.data?.error || err.message}`);
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800 mr-3 p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building2 className="text-blue-500 mr-2" /> Manajemen Bengkel
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {myWorkshop ? (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="font-bold text-blue-800">Anda sudah memiliki bengkel terdaftar.</p>
              <p className="text-blue-700">Silakan perbarui detailnya di bawah.</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="font-bold text-yellow-800">Anda belum memiliki bengkel terdaftar.</p>
              <p className="text-yellow-700">Daftarkan bengkel Anda untuk menerima order.</p>
            </div>
          )}

          {/* Nama Bengkel */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Bengkel
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Bengkel Jaya Abadi"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Lokasi Bengkel */}
          <div>
            <h2 className="font-bold text-lg mb-3 flex items-center"><MapPin className="text-blue-500 mr-2" /> Lokasi Bengkel</h2>
            <MapPicker onLocationSelect={setLocation} initialLocation={location || undefined} />
            {errors.lat && <p className="text-red-500 text-sm mt-1">Lokasi wajib dipilih di peta.</p>}
          </div>
          {location && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Alamat Terpilih:</p>
              <p className="text-sm text-gray-600">{location.address}</p>
            </div>
          )}

          {/* Jam Buka */}
          <div>
            <label htmlFor="openHours" className="block text-sm font-semibold text-gray-700 mb-2">
              Jam Buka (Contoh: 08:00 - 17:00)
            </label>
            <input
              id="openHours"
              type="text"
              {...register('openHours')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Senin-Jumat 08:00-17:00, Sabtu 08:00-14:00"
            />
            {errors.openHours && <p className="text-red-500 text-sm mt-1">{errors.openHours.message}</p>}
          </div>

          {/* Status Bengkel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status Ketersediaan Slot
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="available">Tersedia (Ada Slot)</option>
                    <option value="full">Penuh (Tidak Ada Slot)</option>
                  </select>
                )}
              />
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status Buka/Tutup
              </label>
              <Controller
                name="isOpen"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-4 h-full">
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        field.value ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle size={18} className="inline-block mr-2" /> Buka
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange(false)}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        !field.value ? 'bg-red-500 text-white border-red-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <XCircle size={18} className="inline-block mr-2" /> Tutup
                    </button>
                  </div>
                )}
              />
              {errors.isOpen && <p className="text-red-500 text-sm mt-1">{errors.isOpen.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold text-black transition-colors disabled:bg-gray-300"
          >
            {isSubmitting ? 'Menyimpan...' : myWorkshop ? 'Perbarui Detail Bengkel' : 'Daftarkan Bengkel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkshopManagement;