import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Clock, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateBooking } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import { useWorkshops } from "../hooks/useWorkshops";
import { Workshop } from "../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RatingStars from "../components/RatingStars";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = {
  lat: -6.2088,
  lng: 106.8456
};

const BawaSendiriPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const { workshops, isLoading: isLoadingWorkshops } = useWorkshops();

  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(new Date(Date.now() + 3600 * 1000));
  const mapRef = useRef<L.Map | null>(null);

  // Sort workshops by distance (client-side for now, ideally done on backend)
  const sortedWorkshops = [...(workshops || [])].sort((a, b) => {
    // Placeholder for actual distance calculation
    // For now, just sort by name or some other default
    return a.name.localeCompare(b.name);
  });

  const handleBooking = async () => {
    if (!user) return toast.error("Silakan login terlebih dahulu");
    if (!selectedWorkshop) return toast.error("Pilih bengkel terlebih dahulu");
    if (!scheduledAt) return toast.error("Pilih jadwal kedatangan");

    try {
      await createBooking.mutateAsync({
        serviceType: "bawa_bengkel",
        subType: 'bawa_sendiri',
        vehicle: {}, 
        workshopId: selectedWorkshop.id, 
        destinationLocation: {
          lat: selectedWorkshop.lat,
          lng: selectedWorkshop.lng,
          address: selectedWorkshop.address,
        },
        scheduledAt: scheduledAt.toISOString(),
      });

      toast.success("Jadwal kedatangan ke bengkel berhasil dibuat ✅");
      navigate("/history");
    } catch (err) {
      toast.error("Terjadi kesalahan saat membuat booking");
    }
  };

  useEffect(() => {
    if (mapRef.current && sortedWorkshops.length > 0) {
      // Set map view to the first workshop or default center
      const center = selectedWorkshop ? { lat: selectedWorkshop.lat, lng: selectedWorkshop.lng } : DEFAULT_CENTER;
      mapRef.current.setView(center, 12);
    }
  }, [sortedWorkshops, selectedWorkshop]);

  if (isLoadingWorkshops) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
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

      <div className="relative flex-1">
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            whenCreated={map => { mapRef.current = map; }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {sortedWorkshops.map(w => (
              <Marker 
                  key={w.id} 
                  position={{ lat: w.lat, lng: w.lng }} 
                  eventHandlers={{
                    click: () => setSelectedWorkshop(w),
                  }}
              >
                <Popup>
                  <div>
                      <h4 className="font-bold">{w.name}</h4>
                      <p>{w.address}</p>
                      {w.averageRating !== undefined && w.averageRating !== null && (
                        <div className="flex items-center space-x-1 mt-1">
                          <RatingStars rating={w.averageRating} readonly size={16} />
                          <span className="text-xs text-gray-500">({w.averageRating.toFixed(1)} dari {w.ratingCount} ulasan)</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600">Jam Buka: {w.openHours || 'Tidak Tersedia'}</p>
                      <p className="text-sm text-gray-600">Status: {w.isOpen ? 'Buka' : 'Tutup'}</p>
                      <p className="text-sm text-gray-600">Slot: {w.status === 'available' ? 'Tersedia' : 'Penuh'}</p>
                      {selectedWorkshop?.id === w.id && (
                        <div className="mt-2 text-center">
                          <span className="text-blue-600 font-semibold">Bengkel Terpilih</span>
                        </div>
                      )}
                  </div>
                </Popup>
              </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="bg-white p-4 shadow-inner max-h-[40vh] overflow-y-auto border-t">
        <h2 className="font-bold text-lg mb-2">Pilih Bengkel Mitra Terdekat</h2>
        {sortedWorkshops.length === 0 ? (
          <div className="text-center py-8">
            <Building2 size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">Belum ada bengkel tersedia di wilayah Anda.</p>
            <p className="text-gray-500 text-sm mt-2">Coba lagi nanti atau hubungi admin.</p>
          </div>
        ) : (
          sortedWorkshops.map((w) => (
            <div key={w.id} onClick={() => setSelectedWorkshop(w)} className={`p-4 mb-3 rounded-xl border transition-all cursor-pointer ${selectedWorkshop?.id === w.id ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-yellow-300"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{w.name}</h3>
                  <p className="text-sm text-gray-600">{w.address}</p>
                  {w.averageRating !== undefined && w.averageRating !== null && (
                    <div className="flex items-center space-x-1 mt-1">
                      <RatingStars rating={w.averageRating} readonly size={16} />
                      <span className="text-xs text-gray-500">({w.averageRating.toFixed(1)} dari {w.ratingCount} ulasan)</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={14} className="mr-1" />{w.openHours || "Tidak Tersedia"}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${w.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {w.isOpen ? 'Buka' : 'Tutup'}
                    </span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${w.status === 'available' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                      {w.status === 'available' ? 'Slot Tersedia' : 'Penuh'}
                    </span>
                  </div>
                </div>
                <MapPin size={20} className="text-blue-500 flex-shrink-0 ml-2" />
              </div>
              {selectedWorkshop?.id === w.id && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Calendar className="mr-2" size={16}/> Atur Jadwal Kedatangan</label>
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
                    Navigasi ke Bengkel
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