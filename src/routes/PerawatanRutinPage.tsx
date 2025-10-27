import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Calendar, Wrench, Car, Droplet, Settings } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import MapPicker from "../components/MapPicker";
import { useCreateBooking } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import { useVehicles } from "../hooks/useVehicles";

const maintenanceTypes = [
    { id: "ganti_oli", label: "Ganti Oli", icon: Droplet },
    { id: "tune_up", label: "Tune Up", icon: Settings },
    { id: "cek_rem", label: "Cek Rem", icon: Car },
    { id: "servis_ringan", label: "Servis Ringan", icon: Wrench },
    { id: "servis_besar", label: "Servis Besar", icon: Wrench },
    { id: "ganti_ban", label: "Ganti Ban", icon: Wrench }, // ✅ Tambahan baru
];

const schema = z.object({
  vehicleSelection: z.string(),
  vehicle: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    plate: z.string().optional(),
  }),
  maintenanceTypes: z.array(z.string()).min(1, "Pilih minimal satu jenis perawatan"),
  complaint: z.string().optional(),
  scheduledAt: z.date(),
}).refine(data => {
    if (data.vehicleSelection === 'new') {
        return data.vehicle.make && data.vehicle.model;
    }
    return true;
}, {
    message: "Merk dan model kendaraan wajib diisi",
    path: ['vehicle', 'make'],
});

type RoutineForm = z.infer<typeof schema>;

const PerawatanRutinPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const createBooking = useCreateBooking();
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RoutineForm>({
    resolver: zodResolver(schema),
    defaultValues: {
        vehicleSelection: vehicles?.[0]?.id || 'new',
        maintenanceTypes: [],
        scheduledAt: new Date(Date.now() + 3600 * 1000)
    },
  });

  const vehicleSelection = watch('vehicleSelection');

  const onSubmit = async (data: RoutineForm) => {
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }
    if (!location) {
      toast.error("Silakan pilih lokasi servis");
      return;
    }

    let vehicleData: { make?: string; model?: string; plate?: string } = {}; // Explicitly type vehicleData
    if (data.vehicleSelection === 'new') {
        vehicleData = data.vehicle;
    } else {
        const selected = vehicles?.find(v => v.id === data.vehicleSelection);
        if (selected) {
            vehicleData = { make: selected.make, model: selected.model, plate: selected.plate };
        }
    }

    const formData = new FormData();
    formData.append('serviceType', "panggil_montir");
    formData.append('subType', 'perawatan_rutin');
    formData.append('description', `Perawatan: ${data.maintenanceTypes.join(', ')}. Keluhan: ${data.complaint || '-'}`);
    formData.append('scheduledAt', data.scheduledAt.toISOString());
    formData.append('vehicle', JSON.stringify(vehicleData)); // Stringify vehicleData
    formData.append('location', JSON.stringify(location)); // Stringify location

    try {
      await createBooking.mutateAsync(formData as any); // Pass formData

      toast.success("Servis rutin berhasil dijadwalkan ✅");
      navigate("/history");
    } catch (err: any) {
          const errorMessage = err.response?.data?.error || "Terjadi kesalahan saat membuat jadwal servis";
          toast.error(errorMessage);
        }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800 mr-3 p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="text-blue-500 mr-2" /> Perawatan Rutin
            </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          
          <div>
            <h2 className="font-bold text-lg mb-3 flex items-center"><Car className="text-purple-500 mr-2" /> Pilihan Kendaraan</h2>
            {isLoadingVehicles ? <p>Memuat kendaraan...</p> : (
                <Controller
                    name="vehicleSelection"
                    control={control}
                    render={({ field }) => (
                        <select {...field} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                            {vehicles?.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plate})</option>)}
                            <option value="new">Isi baru secara manual</option>
                        </select>
                    )}
                />
            )}
            {vehicleSelection === 'new' && (
                <div className="space-y-4 mt-4 border-t pt-4">
                    <input {...register("vehicle.make")} placeholder="Merk Kendaraan" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                    <input {...register("vehicle.model")} placeholder="Model Kendaraan" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                    <input {...register("vehicle.plate")} placeholder="Nomor Polisi" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                    {errors.vehicle?.make && <p className="text-red-500 text-sm">{errors.vehicle.make.message}</p>}
                </div>
            )}
          </div>

          <div>
            <h2 className="font-bold text-lg mb-3 flex items-center"><Wrench className="text-green-500 mr-2" /> Pilih Jenis Perawatan</h2>
            <Controller
                name="maintenanceTypes"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {maintenanceTypes.map(m => (
                            <button type="button" key={m.id} onClick={() => {
                                const current = field.value || [];
                                const newValue = current.includes(m.id) ? current.filter(id => id !== m.id) : [...current, m.id];
                                field.onChange(newValue);
                            }} className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center transition-all ${field.value?.includes(m.id) ? 'bg-yellow-100 border-yellow-400' : 'hover:bg-gray-50'}`}>
                                <m.icon size={24} className="mb-2" />
                                <span className="text-sm font-medium">{m.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            />
            {errors.maintenanceTypes && <p className="text-red-500 text-sm mt-2">{errors.maintenanceTypes.message}</p>}
          </div>

          <div>
            <h2 className="font-bold text-lg mb-3">Keluhan Tambahan (Opsional)</h2>
            <textarea {...register("complaint")} placeholder="Jelaskan keluhan atau permintaan tambahan Anda di sini..." className="w-full border border-gray-300 rounded-lg px-4 py-2" rows={3}></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h2 className="font-bold text-lg mb-3 flex items-center"><Calendar className="text-red-500 mr-2" /> Pilih Jadwal</h2>
                <Controller
                    name="scheduledAt"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            selected={field.value}
                            onChange={date => field.onChange(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            dateFormat="dd/MM/yyyy HH:mm"
                            minDate={new Date()}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            placeholderText="Pilih tanggal & waktu"
                        />
                    )}
                />
                {errors.scheduledAt && <p className="text-red-500 text-sm mt-1">{errors.scheduledAt.message}</p>}
            </div>
            <div>
                <h2 className="font-bold text-lg mb-3 flex items-center"><MapPin className="text-blue-500 mr-2" /> Lokasi Servis</h2>
                <MapPicker onLocationSelect={setLocation} />
            </div>
          </div>

         <button type="submit" disabled={createBooking.isPending || Object.keys(errors).length > 0} className="w-full py-3
            bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold text-black transition-colors disabled:bg-gray-300 disabled:text-gray-600">
            {createBooking.isPending ? "Membuat Jadwal..." : "Pesan Jadwal Servis"}
         </button>
        </form>
      </div>
    </div>
  );
};

export default PerawatanRutinPage;