import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, MapPin, Car, Battery, Droplet, Wind, Key, MessageSquare, Camera } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import MapPicker from "../components/MapPicker";
import { useCreateBooking } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import { useVehicles } from "../hooks/useVehicles";

const problemTypes = [
  { id: "aki_soak", label: "Aki Soak", icon: Battery },
  { id: "ban_bocor", label: "Ban Bocor", icon: Droplet },
  { id: "mesin_mogok", label: "Mesin Mogok", icon: Wrench },
  { id: "bensin_habis", label: "Kehabisan Bensin", icon: Wind },
  { id: "kunci_tertinggal", label: "Kunci Tertinggal", icon: Key },
  { id: "lainnya", label: "Lainnya", icon: MessageSquare },
];

const schema = z.object({
  vehicleSelection: z.string(),
  vehicle: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    plate: z.string().optional(),
  }),
  problemType: z.string().min(1, "Jenis masalah wajib dipilih"),
  problemDescription: z.string().optional(),
  additionalNotes: z.string().optional(),
}).refine(data => {
    if (data.vehicleSelection === 'new') {
        return data.vehicle.make && data.vehicle.model;
    }
    return true;
}, {
    message: "Merk dan model kendaraan wajib diisi untuk kendaraan baru",
    path: ['vehicle', 'make'],
});

type DaruratForm = z.infer<typeof schema>;

const PanggilDaruratPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const createBooking = useCreateBooking();
  
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<DaruratForm>({ 
      resolver: zodResolver(schema),
      defaultValues: { vehicleSelection: vehicles?.[0]?.id || 'new' }
    });

  const vehicleSelection = watch('vehicleSelection');
  const problemType = watch('problemType');

  const onSubmit = async (data: DaruratForm) => {
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }
    if (!location) {
      toast.error("Silakan pilih lokasi Anda terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append('serviceType', "panggil_montir");
    formData.append('subType', 'darurat');
    formData.append('scheduledAt', new Date().toISOString());
    formData.append('description', `${data.problemType}${data.problemDescription ? `: ${data.problemDescription}` : ''}`);
    if (data.additionalNotes) {
      formData.append('additionalNotes', data.additionalNotes);
    }

    // Append location data
    formData.append('location', JSON.stringify(location));

    // Append vehicle data
    const vehicleData: { make?: string; model?: string; plate?: string } = {};
    if (data.vehicleSelection === 'new') {
        vehicleData.make = data.vehicle.make;
        vehicleData.model = data.vehicle.model;
        vehicleData.plate = data.vehicle.plate;
    } else {
        const selected = vehicles?.find(v => v.id === data.vehicleSelection);
        if (selected) {
            vehicleData.make = selected.make;
            vehicleData.model = selected.model;
            vehicleData.plate = selected.plate;
        }
    }
    formData.append('vehicle', JSON.stringify(vehicleData));

    // Append files
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('media', selectedFiles[i]);
      }
    }

    try {
      await createBooking.mutateAsync(formData as any); // Cast to any for now, will refine types later

      toast.success("Montir sedang menuju lokasi Anda 🚗💨");
      navigate("/history");
    } catch (err) {
      toast.error("Terjadi kesalahan saat memproses permintaan");
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
            <Wrench className="text-yellow-500 mr-2" /> Panggil Darurat
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          
          {/* Step 1 - Lokasi */}
          <div>
            <h2 className="font-bold text-lg mb-3 flex items-center"><MapPin className="text-blue-500 mr-2" /> Lokasi Anda</h2>
            <MapPicker onLocationSelect={setLocation} />
          </div>

          {/* Step 2 - Pilihan Kendaraan */}
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
                    <input {...register("vehicle.make")} placeholder="Merk Kendaraan (Contoh: Toyota)" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                    <input {...register("vehicle.model")} placeholder="Model Kendaraan (Contoh: Avanza)" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                    <input {...register("vehicle.plate")} placeholder="Nomor Polisi (Opsional)" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                    {errors.vehicle?.make && <p className="text-red-500 text-sm">{errors.vehicle.make.message}</p>}
                </div>
            )}
          </div>

          {/* Step 3 - Jenis Masalah */}
          <div>
            <h2 className="font-bold text-lg mb-3 flex items-center"><Wrench className="text-red-500 mr-2" /> Jenis Masalah Darurat</h2>
            <Controller
                name="problemType"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {problemTypes.map(p => (
                            <button type="button" key={p.id} onClick={() => field.onChange(p.id)} className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center transition-all ${field.value === p.id ? 'bg-yellow-100 border-yellow-400' : 'hover:bg-gray-50'}`}>
                                <p.icon size={24} className="mb-2" />
                                <span className="text-sm font-medium">{p.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            />
            {errors.problemType && <p className="text-red-500 text-sm mt-2">{errors.problemType.message}</p>}
            {problemType === 'lainnya' && (
                <textarea {...register("problemDescription")} placeholder="Jelaskan masalah Anda di sini..." className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-4" rows={3}></textarea>
            )}
          </div>

          {/* Step 4 - Upload Foto/Video & Keterangan Kondisi */}
          <div>
            <h2 className="font-bold text-lg mb-3 flex items-center"><Camera className="text-green-500 mr-2" /> Foto/Video Kondisi Kendaraan (Opsional)</h2>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFiles && selectedFiles.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">{selectedFiles.length} file terpilih.</p>
            )}

            <h2 className="font-bold text-lg mb-3 mt-6 flex items-center"><MessageSquare className="text-orange-500 mr-2" /> Keterangan Tambahan (Opsional)</h2>
            <textarea {...register("additionalNotes")} placeholder="Berikan keterangan tambahan mengenai kondisi kendaraan atau masalah..." className="w-full border border-gray-300 rounded-lg px-4 py-2" rows={3}></textarea>
          </div>

          {/* Estimasi waktu kedatangan akan ditampilkan setelah montir menerima pesanan */}

          <button type="submit" disabled={createBooking.isPending} className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold text-black transition-colors disabled:bg-gray-300">
            {createBooking.isPending ? "Mencari Montir..." : "Konfirmasi & Panggil Montir"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PanggilDaruratPage;