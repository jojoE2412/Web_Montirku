import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, MapPin, Building2, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateBooking } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MapPicker from "../components/MapPicker";
import { useWorkshops } from "../hooks/useWorkshops";
import { Workshop } from "../types";
import RatingStars from "../components/RatingStars";

const TowingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  
  // Fetch only workshops that have towing capabilities
  const { workshops, isLoading: isLoadingWorkshops } = useWorkshops({ towing: true });

  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(new Date());
  const [step, setStep] = useState(1); // 1: Pilih Jemput, 2: Pilih Bengkel, 3: Jadwal & Konfirmasi

  const handleBooking = async () => {
    if (!user) return toast.error("Login terlebih dahulu");
    if (!selectedWorkshop || !pickupLocation || !scheduledAt) {
      return toast.error("Lengkapi lokasi penjemputan, bengkel tujuan, dan waktu");
    }

    try {
      await createBooking.mutateAsync({
        serviceType: "bawa_bengkel",
        subType: 'towing',
        workshopId: selectedWorkshop.id,
        pickupLocation,
        destinationLocation: {
          lat: selectedWorkshop.lat,
          lng: selectedWorkshop.lng,
          address: selectedWorkshop.address,
        },
        scheduledAt: scheduledAt.toISOString(),
      });

      toast.success("Pesanan derek berhasil dibuat! Menunggu konfirmasi bengkel.");
      navigate("/history");
    } catch {
      toast.error("Terjadi kesalahan saat membuat pesanan derek");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-6 space-y-4 flex-1 flex flex-col">
            <h2 className="font-bold text-lg flex items-center"><MapPin className="text-blue-500 mr-2" /> Langkah 1: Pilih Lokasi Penjemputan</h2>
            <div className="flex-1 min-h-[300px]">
              <MapPicker onLocationSelect={setPickupLocation} />
            </div>
            <button onClick={() => setStep(2)} disabled={!pickupLocation} className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold text-black transition-colors disabled:bg-gray-300">
              Lanjut Pilih Bengkel Tujuan
            </button>
          </div>
        );
      case 2:
        return (
          <div className="p-6 space-y-4 flex-1 flex flex-col">
            <h2 className="font-bold text-lg mb-2 flex items-center"><Building2 size={18} className="text-green-600 mr-2" /> Langkah 2: Pilih Bengkel Tujuan</h2>
            <div className="flex-1 max-h-96 overflow-y-auto space-y-2 pr-2">
              {isLoadingWorkshops ? <p>Mencari bengkel...</p> : workshops && workshops.length > 0 ? (
                <React.Fragment>
                  {workshops.map((w: Workshop) => (
                    <div key={w.id} onClick={() => setSelectedWorkshop(w)} className={`p-3 rounded-lg border-2 cursor-pointer ${selectedWorkshop?.id === w.id ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-yellow-300"}`}>
                      <h3 className="font-semibold text-sm">{w.name}</h3>
                      <p className="text-xs text-gray-600">{w.address}</p>
                      {w.averageRating !== undefined && w.averageRating !== null && (
                        <div className="flex items-center space-x-1 mt-1">
                          <RatingStars rating={w.averageRating} readonly size={14} />
                          <span className="text-xs text-gray-500">({w.averageRating.toFixed(1)} dari {w.ratingCount} ulasan)</span>
                        </div>
                      )}
                      {w.hasTowing && (
                        <div className="text-xs font-semibold mt-1 p-1 rounded w-fit bg-green-100 text-green-800">
                          Menyediakan Layanan Derek
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ) : (
                <div className="text-center py-8">
                  <Truck size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold">Belum ada layanan derek di wilayah Anda.</p>
                  <p className="text-gray-500 text-sm mt-2">Coba lagi nanti atau hubungi admin.</p>
                </div>
              )}
            </div>
             <button onClick={() => setStep(3)} disabled={!selectedWorkshop} className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold text-black transition-colors disabled:bg-gray-300">
              Lanjut Jadwalkan Penjemputan
            </button>
          </div>
        );
      case 3:
        return (
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <h2 className="font-bold text-lg mb-2 flex items-center"><Calendar size={18} className="text-purple-600 mr-2" /> Langkah 3: Pilih Waktu & Konfirmasi</h2>
            <div>
                <h3 className="font-medium text-gray-800 mb-2">Bengkel Tujuan:</h3>
                <div className="p-3 rounded-lg bg-gray-100">
                    <p className="font-bold">{selectedWorkshop?.name}</p>
                    <p className="text-sm text-gray-600">{selectedWorkshop?.address}</p>
                </div>
            </div>
            <div>
                <h3 className="font-medium text-gray-800 mb-2">Waktu Penjemputan:</h3>
                <DatePicker
                    selected={scheduledAt}
                    onChange={(date) => setScheduledAt(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={new Date()}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
            </div>
            <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                    <span>Estimasi Biaya Derek</span>
                    <span>Rp 250.000</span>
                </div>
                <button onClick={handleBooking} disabled={!scheduledAt || createBooking.isPending} className="w-full mt-4 py-3 font-bold rounded-xl transition-colors bg-yellow-400 hover:bg-yellow-500 text-black disabled:bg-gray-300 disabled:text-gray-600">
                    {createBooking.isPending ? 'Memproses...' : 'Konfirmasi & Pesan Derek'}
                </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 flex items-center border-b bg-white shadow-sm">
        <button onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)} className="p-2 rounded-full hover:bg-gray-100 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center">
          <Truck className="text-yellow-500 mr-2" /> Layanan Derek
        </h1>
      </div>
      {renderStep()}
    </div>
  );
};

export default TowingPage;
