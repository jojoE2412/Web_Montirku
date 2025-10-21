// src/routes/BookingPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Clock, Building2, Truck } from "lucide-react";

/**
 * Halaman pemilihan layanan (Booking entry)
 * - Menampilkan 2 grup utama: Panggil Montir & Bawa ke Bengkel
 * - Pada masing-masing grup tampilkan sub-layanan yang sudah dirancang:
 *   - Panggil Montir: Darurat, Perawatan Rutin
 *   - Bawa ke Bengkel: Bawa Sendiri, Derek / Towing
 *
 * Setelah klik sub-layanan -> navigate ke route khusus (page per layanan)
 *
 * Routes yang dipakai (sesuaikan router di projectmu):
 * - /booking/panggil-darurat
 * - /booking/perawatan-rutin
 * - /booking/bawa-sendiri
 * - /booking/towing
 */

type SubService =
  | "panggil_darurat"
  | "perawatan_rutin"
  | "bawa_sendiri"
  | "derek_towing";

const BookingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (sub: SubService) => {
    // map sub-service ke route yang sudah kita sepakati
    const routeMap: Record<SubService, string> = {
      panggil_darurat: "/booking/panggil-darurat",
      perawatan_rutin: "/booking/perawatan-rutin",
      bawa_sendiri: "/booking/bawa-sendiri",
      derek_towing: "/booking/towing",
    };

    const target = routeMap[sub] ?? "/booking";
    navigate(target);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">

        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Pesan Layanan</h1>
          <p className="text-sm text-gray-600 mt-1">
            Pilih layanan yang Anda butuhkan. Setelah memilih, Anda akan diarahkan ke halaman pemesanan khusus untuk layanan tersebut.
          </p>
        </header>

        {/* Grup: Panggil Montir */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Panggil Montir</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Darurat */}
            <div
              role="button"
              onClick={() => handleNavigate("panggil_darurat")}
              className="p-5 bg-white rounded-xl shadow hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-50 rounded-full">
                  <Wrench size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Panggil Darurat</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Montir datang cepat ke lokasi Anda — untuk kasus ban bocor, aki soak, mogok, dll.
                  </p>
                  <div className="mt-3 text-xs text-gray-500">Estimasi waktu: 15–30 menit (lokal)</div>
                </div>
              </div>
            </div>

            {/* Perawatan Rutin */}
            <div
              role="button"
              onClick={() => handleNavigate("perawatan_rutin")}
              className="p-5 bg-white rounded-xl shadow hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Clock size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Perawatan Rutin</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Booking servis terjadwal (ganti oli, tune-up, cek rem). Pilih jadwal dan montir datang.
                  </p>
                  <div className="mt-3 text-xs text-gray-500">Pilih jadwal sesuai ketersediaan montir</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grup: Bawa ke Bengkel */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bawa ke Bengkel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bawa Sendiri */}
            <div
              role="button"
              onClick={() => handleNavigate("bawa_sendiri")}
              className="p-5 bg-white rounded-xl shadow hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-50 rounded-full">
                  <Building2 size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Bawa Sendiri</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Pilih bengkel mitra terdekat (lihat di peta) dan jadwalkan kedatangan Anda.
                  </p>
                  <div className="mt-3 text-xs text-gray-500">Peta interaktif + daftar bengkel (Gojek-style)</div>
                </div>
              </div>
            </div>

            {/* Derek / Towing */}
            {(() => {
              const isTowingServiceAvailable = false; // Set to false to disable
              const disabledClasses = "opacity-50 cursor-not-allowed";
              const enabledClasses = "hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all cursor-pointer";

              return (
                <div
                  role="button"
                  onClick={isTowingServiceAvailable ? () => handleNavigate("derek_towing") : undefined}
                  className={`p-5 bg-white rounded-xl shadow ${isTowingServiceAvailable ? enabledClasses : disabledClasses}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-50 rounded-full">
                      <Truck size={24} className="text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Derek / Towing</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Kendaraan dijemput dari lokasi Anda dan diantar ke bengkel tujuan.
                      </p>
                      <div className="mt-3 text-xs text-gray-500">Pilih tujuan bengkel lalu atur penjemputan</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Info tambahan / CTA */}
        <footer className="mt-8">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800">Butuh Bantuan?</div>
              <div className="text-xs text-gray-500">Hubungi layanan pelanggan atau lihat FAQ untuk panduan cepat.</div>
            </div>
            <button
              onClick={() => navigate("/help")}
              className="py-2 px-4 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold"
            >
              Bantuan
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BookingPage;
