import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form'; // ✅ Controller digunakan di JSX
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import MapPicker from '../../components/MapPicker'; // ✅ MapPicker digunakan di JSX
import { Building, Clock, Plus, Trash2, MapPin, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import JoinRequests from '../../components/JoinRequests';
import ActiveMembers from '../../components/ActiveMembers';
import { useMontirWorkshop } from '../../hooks/useMontirWorkshop';

// --- Constants for the form ---
const specializationsData = { // ✅ digunakan di JSX
  'Jenis Kendaraan': ['Mobil', 'Motor', 'Truk'],
  'Merek Kendaraan': ['Toyota', 'Honda', 'Suzuki', 'Mitsubishi', 'Daihatsu', 'BMW', 'Mercedes-Benz', 'Yamaha', 'Kawasaki'],
  'Jenis Mesin': ['Bensin', 'Diesel', 'Hybrid', 'Listrik'],
  'Area Perbaikan': ['Mesin', 'Kelistrikan & AC', 'Kaki-kaki & Suspensi', 'Transmisi', 'Bodi & Cat'],
};
const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const defaultHours = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { isOpen: false, open: '08:00', close: '17:00' } }), {});

// --- Unified Zod Schema ---
const workshopSchema = z.object({
  name: z.string().min(1, 'Nama bengkel wajib diisi'),
  address: z.string().min(1, 'Alamat bengkel wajib diisi'),
  lat: z.number().refine(val => val !== 0, { message: 'Lokasi wajib dipilih di peta' }),
  lng: z.number().refine(val => val !== 0, { message: 'Lokasi wajib dipilih di peta' }),
  status: z.enum(['available', 'full']),
  isOpen: z.boolean(),
  hasTowing: z.boolean(),
  specializations: z.array(z.string()).min(1, 'Pilih minimal satu spesialisasi'),
  operationalHours: z.record(z.string(), z.object({
    isOpen: z.boolean(),
    open: z.string(),
    close: z.string(),
  })),
});

type WorkshopForm = z.infer<typeof workshopSchema>;

const WorkshopManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const { 
    isLoading, 
    ownedWorkshop,
    addWorkshopMutation,
    updateWorkshopMutation
  } = useMontirWorkshop();

  const existingWorkshop = ownedWorkshop;

  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<WorkshopForm>({
    resolver: zodResolver(workshopSchema),
    // Set initial values directly, re-evaluated when ownedWorkshop changes
    values: {
      name: existingWorkshop?.name || '',
      address: existingWorkshop?.address || '',
      lat: existingWorkshop?.lat || 0,
      lng: existingWorkshop?.lng || 0,
      status: existingWorkshop?.status || 'available',
      isOpen: existingWorkshop?.isOpen === undefined ? true : existingWorkshop.isOpen,
      hasTowing: existingWorkshop?.hasTowing || false,
      specializations: existingWorkshop?.specializations || [],
      operationalHours: existingWorkshop?.operationalHours || defaultHours,
    },
  });

  // Effect to initialize location from workshop data, but only once
  useEffect(() => {
    if (existingWorkshop && !location) {
      const initialLoc = {
        lat: existingWorkshop.lat,
        lng: existingWorkshop.lng,
        address: existingWorkshop.address,
      };
      setLocation(initialLoc);
    }
  }, [existingWorkshop, location]);

  useEffect(() => {
    if (location) {
      setValue('lat', location.lat, { shouldValidate: true });
      setValue('lng', location.lng, { shouldValidate: true });
      setValue('address', location.address, { shouldValidate: true });
    }
  }, [location, setValue]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user || user.role !== 'montir') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Akses Ditolak</h2>
          <p className="text-gray-600">Anda harus login sebagai montir untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: WorkshopForm) => {
    try {
      if (existingWorkshop) {
        await updateWorkshopMutation.mutateAsync({ 
          id: existingWorkshop.id, 
          ...data 
        });
        toast.success('Detail bengkel berhasil diperbarui!');
      } else {
        await addWorkshopMutation.mutateAsync(data);
        toast.success('Bengkel berhasil didaftarkan!');
        await refreshUser(); // Call refreshUser after successful creation
        navigate('/montir/dashboard');
      }
    } catch (err: any) {
      console.error('Error saving workshop:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      toast.error(`Gagal menyimpan: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="text-blue-500 mr-2" /> Manajemen Bengkel
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-6 space-y-8">
          {existingWorkshop ? (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="font-bold text-blue-800">Anda sudah memiliki bengkel terdaftar.</p>
              <p className="text-sm text-blue-700">Perbarui detail bengkel Anda di bawah ini.</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="font-bold text-yellow-800">Anda belum memiliki bengkel terdaftar.</p>
              <p className="text-sm text-yellow-700">Daftarkan bengkel Anda untuk dapat menerima order.</p>
            </div>
          )}

          {/* --- Section: Informasi Dasar --- */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Informasi Dasar</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Bengkel</label>
              <Controller 
                name="name" 
                control={control} 
                render={({ field }) => (
                  <input {...field} id="name" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
                )} 
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div className="flex items-center">
              <Controller
                name="hasTowing"
                control={control}
                render={({ field }) => (
                  <input
                    id="hasTowing"
                    type="checkbox"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    checked={field.value}
                    ref={field.ref}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                )}
              />
              <label htmlFor="hasTowing" className="ml-2 block text-sm text-gray-900">Menyediakan Layanan Derek (Towing)</label>
            </div>
          </div>

          {/* --- Section: Lokasi --- */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Lokasi Bengkel</h2>
            {/* ✅ MapPicker digunakan di sini */}
            <MapPicker onLocationSelect={setLocation} initialLocation={location || undefined} />
            {errors.lat && <p className="text-red-500 text-sm mt-1">{errors.lat.message}</p>}
            {location && <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{location.address}</div>}
          </div>

          {/* --- Section: Spesialisasi --- */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Spesialisasi</h2>
            <Controller
              name="specializations"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  {/* ✅ specializationsData digunakan di sini */}
                  {Object.entries(specializationsData).map(([category, specs]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-gray-600">{category}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {specs.map(spec => (
                          <button
                            type="button"
                            key={spec}
                            onClick={() => {
                              const current = field.value || [];
                              const newSpecs = current.includes(spec) ? current.filter(s => s !== spec) : [...current, spec];
                              field.onChange(newSpecs);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              (field.value || []).includes(spec) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}>
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.specializations && <p className="text-red-500 text-sm mt-1">{errors.specializations.message}</p>}
          </div>

          {/* --- Section: Jam Operasional --- */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Jam Operasional</h2>
            <Controller
              name="operationalHours"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  {daysOfWeek.map(day => (
                    <div key={day} className="grid grid-cols-3 items-center gap-4">
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          id={`isOpen-${day}`}
                          checked={field.value?.[day]?.isOpen || false}
                          onChange={() => {
                            const newHours = { ...field.value };
                            newHours[day] = { ...newHours[day], isOpen: !newHours[day]?.isOpen };
                            field.onChange(newHours);
                          }}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor={`isOpen-${day}`} className="ml-2 font-medium text-gray-900">{day}</label>
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-2">
                        <input
                          type="time"
                          value={field.value?.[day]?.open || '08:00'}
                          onChange={e => {
                            const newHours = { ...field.value };
                            newHours[day] = { ...newHours[day], open: e.target.value };
                            field.onChange(newHours);
                          }}
                          disabled={!field.value?.[day]?.isOpen}
                          className="w-full border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                        <input
                          type="time"
                          value={field.value?.[day]?.close || '17:00'}
                          onChange={e => {
                            const newHours = { ...field.value };
                            newHours[day] = { ...newHours[day], close: e.target.value };
                            field.onChange(newHours);
                          }}
                          disabled={!field.value?.[day]?.isOpen}
                          className="w-full border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          {/* --- Section: Status (Edit Only) --- */}
          {existingWorkshop && (
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Status Bengkel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ketersediaan Slot</label>
                  <Controller name="status" control={control} render={({ field }) => (
                    <select {...field} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option value="available">Tersedia</option>
                      <option value="full">Penuh</option>
                    </select>
                  )} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Buka/Tutup</label>
                  <Controller name="isOpen" control={control} render={({ field }) => (
                    <div className="flex items-center space-x-2 mt-1">
                      <button type="button" onClick={() => field.onChange(true)} className={`flex-1 py-2 px-4 rounded-lg border ${
                        field.value ? 'bg-green-500 text-white' : 'bg-gray-100'
                      }`}>Buka</button>
                      <button type="button" onClick={() => field.onChange(false)} className={`flex-1 py-2 px-4 rounded-lg border ${
                        !field.value ? 'bg-red-500 text-white' : 'bg-gray-100'
                      }`}>Tutup</button>
                    </div>
                  )} />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold text-black transition-colors disabled:bg-gray-300"
          >
            {isSubmitting ? 'Menyimpan...' : existingWorkshop ? 'Perbarui Detail Bengkel' : 'Daftarkan Bengkel'}
          </button>
        </form>

        {/* --- Section: Join Requests (only for existing workshops) --- */}
        {existingWorkshop && (
          <div className="mt-12 space-y-12">
            <JoinRequests />
            <ActiveMembers show={!!existingWorkshop} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopManagement;