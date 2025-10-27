import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Calendar, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateBooking } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import { useWorkshops } from "../hooks/useWorkshops";
import { Workshop } from "../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RatingStars from "../components/RatingStars";
import MapPicker from "../components/MapPicker"; // Using the reusable MapPicker

// Haversine distance function
function haversineDistance(coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }) {
  function toRad(x: number) {
    return x * Math.PI / 180;
  }
  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

// Extend workshop type to include optional distance
interface WorkshopWithDistance extends Workshop {
  distance?: number;
}

const BawaSendiriPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const { workshops, isLoading: isLoadingWorkshops } = useWorkshops();

  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopWithDistance | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(new Date(Date.now() + 3600 * 1000));
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Memoized calculation and sorting of workshops by distance
  const sortedWorkshops = useMemo(() => {
    if (!workshops || !userLocation) {
      return [];
    }
    return workshops
      .map((workshop: Workshop) => ({
        ...workshop,
        distance: haversineDistance(userLocation, { lat: workshop.lat, lng: workshop.lng }),
      }))
      .sort((a: WorkshopWithDistance, b: WorkshopWithDistance) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [workshops, userLocation]);

  const handleBooking = async () => {
    if (!user) return toast.error("Silakan login terlebih dahulu");
    if (!selectedWorkshop) return toast.error("Pilih bengkel terlebih dahulu");
    if (!scheduledAt) return toast.error("Pilih jadwal kedatangan");
    if (!userLocation) return toast.error("Lokasi Anda tidak ditemukan, silakan pilih di peta.");

    const formData = new FormData();
    formData.append('serviceType', "bawa_bengkel");
    formData.append('subType', 'bawa_sendiri');
    formData.append('workshopId', selectedWorkshop.id);
    formData.append('scheduledAt', scheduledAt.toISOString());

    // Backend expects vehicle and location to be stringified JSON
    formData.append('vehicle', JSON.stringify({ make: 'Unknown', model: 'Unknown', plate: 'XXX' }));
    formData.append('location', JSON.stringify(userLocation)); // User's current location
    formData.append('destinationLocation', JSON.stringify({
      lat: selectedWorkshop.lat,
      lng: selectedWorkshop.lng,
      address: selectedWorkshop.address,
    }));

    try {
      await createBooking.mutateAsync(formData);

      toast.success("Jadwal kedatangan ke bengkel berhasil dibuat ✅");
      navigate("/history");
    } catch (err) {
      toast.error("Terjadi kesalahan saat membuat booking");
    }
  };

  if (isLoadingWorkshops) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-600">Memuat data bengkel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 flex items-center border-b bg-white shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center">
          <Building2 className="text-green-500 mr-2" /> Bawa Sendiri ke Bengkel
        </h1>
      </div>

      {/* Use MapPicker for location input */}
      <div className="p-4 bg-white">
        <h2 className="font-bold text-lg mb-2">Lokasi Anda</h2>
        <MapPicker onLocationSelect={setUserLocation} />
      </div>

      <div className="bg-gray-100 p-4 flex-1 overflow-y-auto">
        <h2 className="font-bold text-lg mb-2">Pilih Bengkel Mitra Terdekat</h2>
        {!userLocation ? (
            <div className="text-center py-8 text-gray-500">Pilih lokasi Anda di peta untuk melihat bengkel terdekat.</div>
        ) : sortedWorkshops.length === 0 ? (
          <div className="text-center py-8">
            <Building2 size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">Belum ada bengkel tersedia.</p>
          </div>
        ) : (
          sortedWorkshops.map((w: WorkshopWithDistance) => (
            <div key={w.id} onClick={() => setSelectedWorkshop(w)} className={`p-4 mb-3 rounded-xl border transition-all cursor-pointer bg-white ${selectedWorkshop?.id === w.id ? "border-yellow-400 ring-2 ring-yellow-300" : "border-gray-200 hover:border-yellow-300"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{w.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center"><MapPin size={14} className="mr-1 text-red-500"/> {w.address}</p>
                  {w.distance !== undefined && (
                    <p className="text-sm font-bold text-gray-800 mt-1">~{w.distance.toFixed(1)} km dari Anda</p>
                  )}
                  {w.averageRating !== undefined && w.averageRating !== null && (
                    <div className="flex items-center space-x-1 mt-1">
                      <RatingStars rating={w.averageRating} readonly size={16} />
                      <span className="text-xs text-gray-500">({w.averageRating.toFixed(1)})</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${w.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {w.isOpen ? 'Buka' : 'Tutup'}
                    </span>
                </div>
              </div>
              {selectedWorkshop?.id === w.id && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center"><Calendar className="mr-2" size={16}/> Atur Jadwal Kedatangan</label>
                      <DatePicker
                          selected={scheduledAt}
                          onChange={(date) => setScheduledAt(date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={30}
                          dateFormat="dd/MM/yyyy HH:mm"
                          minDate={new Date()}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          placeholderText="Pilih tanggal & waktu"
                      />
                  </div>
                  <button onClick={handleBooking} disabled={!scheduledAt || createBooking.isPending} className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold text-black transition-colors disabled:bg-gray-300">
                    {createBooking.isPending ? 'Memproses...' : 'Konfirmasi Jadwal'}
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedWorkshop.lat},${selectedWorkshop.lng}`, '_blank')}
                    className="w-full py-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
                  >
                    <Navigation size={16} className="mr-2 inline"/> Navigasi ke Bengkel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BawaSendiriPage;
