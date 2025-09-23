import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, Car, MapPin, Wrench, Truck } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MapPicker from '../components/MapPicker';
import { useCreateBooking } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const bookingSchema = z.object({
  serviceType: z.enum(['mechanic', 'towing']),
  vehicle: z.object({
    make: z.string().min(1, 'Merk kendaraan wajib diisi'),
    model: z.string().min(1, 'Model kendaraan wajib diisi'),
    plate: z.string().min(1, 'Nomor plat wajib diisi'),
  }),
  scheduledAt: z.date(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: 'mechanic',
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    }
  });

  const serviceType = watch('serviceType');
  const scheduledAt = watch('scheduledAt');

  const onSubmit = async (data: BookingFormData) => {
    if (!location) {
      toast.error('Silakan pilih lokasi terlebih dahulu');
      return;
    }

    if (!user) {
      toast.error('Anda harus login terlebih dahulu');
      return;
    }

    try {
      const booking = await createBooking.mutateAsync({
        ...data,
        location,
        scheduledAt: data.scheduledAt.toISOString()
      });

      toast.success('Booking berhasil dibuat!');
      navigate(`/booking/${booking.id}`);
    } catch (error) {
      toast.error('Gagal membuat booking. Silakan coba lagi.');
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${step >= stepNumber 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${step > stepNumber ? 'bg-yellow-400' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>Layanan</span>
            <span>Kendaraan</span>
            <span>Waktu</span>
            <span>Lokasi</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Service Type */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Pilih Layanan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`
                  p-6 border-2 rounded-xl cursor-pointer transition-all
                  ${serviceType === 'mechanic' 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <input
                    type="radio"
                    value="mechanic"
                    {...register('serviceType')}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Wrench size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Panggil Montir</h3>
                      <p className="text-gray-600 text-sm">Montir datang ke lokasi Anda</p>
                    </div>
                  </div>
                </label>

                <label className={`
                  p-6 border-2 rounded-xl cursor-pointer transition-all
                  ${serviceType === 'towing' 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <input
                    type="radio"
                    value="towing"
                    {...register('serviceType')}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Truck size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Derek/Towing</h3>
                      <p className="text-gray-600 text-sm">Angkut kendaraan Anda</p>
                    </div>
                  </div>
                </label>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full mt-6 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold transition-colors"
              >
                Lanjutkan
              </button>
            </div>
          )}

          {/* Step 2: Vehicle Info */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Informasi Kendaraan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merk Kendaraan
                  </label>
                  <input
                    type="text"
                    {...register('vehicle.make')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Contoh: Toyota, Honda, Yamaha"
                  />
                  {errors.vehicle?.make && (
                    <p className="text-red-500 text-sm mt-1">{errors.vehicle.make.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Kendaraan
                  </label>
                  <input
                    type="text"
                    {...register('vehicle.model')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Contoh: Avanza, Beat, Vario"
                  />
                  {errors.vehicle?.model && (
                    <p className="text-red-500 text-sm mt-1">{errors.vehicle.model.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Plat
                  </label>
                  <input
                    type="text"
                    {...register('vehicle.plate')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Contoh: B 1234 ABC"
                  />
                  {errors.vehicle?.plate && (
                    <p className="text-red-500 text-sm mt-1">{errors.vehicle.plate.message}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold transition-colors"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Pilih Waktu</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal & Waktu
                  </label>
                  <DatePicker
                    selected={scheduledAt}
                    onChange={(date) => setValue('scheduledAt', date!)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={new Date()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholderText="Pilih tanggal dan waktu"
                  />
                  {errors.scheduledAt && (
                    <p className="text-red-500 text-sm mt-1">{errors.scheduledAt.message}</p>
                  )}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Jam Operasional</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Senin - Minggu: 06:00 - 22:00
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-bold transition-colors"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Pilih Lokasi</h2>
              
              <MapPicker onLocationSelect={setLocation} />

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={!location || createBooking.isPending}
                  className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
                >
                  {createBooking.isPending ? 'Memproses...' : 'Buat Booking'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingPage;