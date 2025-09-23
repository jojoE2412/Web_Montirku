# MontirKu - Vehicle Maintenance Service Platform

## Fitur Utama
MontirKu adalah platform layanan perawatan kendaraan yang menghubungkan pengguna dengan montir profesional dan menyediakan toko sparepart online.
### Untuk Customer
- **Booking Montir**: Panggil montir ke lokasi Anda
- **Derek/Towing**: Layanan derek kendaraan 24/7
- **Toko Sparepart**: Belanja sparepart dan aksesoris kendaraan
- **Dompet Digital**: Top up saldo dan pembayaran cashless
- **Riwayat & Rating**: Lihat riwayat booking dan berikan rating
- **Chat Real-time**: Komunikasi langsung dengan montir
- **Notifikasi**: Update status booking secara real-time
### Untuk Montir
- **Dashboard Montir**: Kelola booking masuk dan status pekerjaan
- **Navigasi GPS**: Petunjuk arah ke lokasi customer
- **Update Status**: Real-time update progress pekerjaan
- **Riwayat Pendapatan**: Lihat statistik dan pendapatan
## Tech Stack
### Frontend
- **React 18** dengan TypeScript
- **Vite** sebagai build tool
- **Tailwind CSS** untuk styling
- **React Router v6** untuk routing
- **TanStack Query** untuk state management & data fetching
- **React Hook Form + Zod** untuk form validation
- **React Leaflet** untuk maps (OpenStreetMap)
- **Socket.io Client** untuk real-time features
- **React Hot Toast** untuk notifications
### Backend (Mock Server)
- **Node.js + Express** untuk REST API
- **Socket.io** untuk real-time communication
- **JWT** untuk authentication
- **In-memory database** untuk development
## Instalasi & Menjalankan Aplikasi
### Prerequisites
- Node.js 18+ 
- npm atau yarn
### 1. Clone Repository
```bash
git clone <repository-url>
cd montirku
```
### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install
# Install server dependencies
cd server
npm install
cd ..
```
### 3. Setup Environment Variables
```bash
cp .env.example .env
```
Edit file `.env` sesuai kebutuhan. Untuk development, konfigurasi default sudah cukup.
### 4. Menjalankan Aplikasi
#### Opsi 1: Jalankan Frontend dan Backend Terpisah
```bash
# Terminal 1 - Frontend
npm run dev
# Terminal 2 - Backend
npm run dev:server
```
#### Opsi 2: Jalankan Bersamaan (Recommended)
```bash
npm run dev:full
```
### 5. Akses Aplikasi
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
## Test Accounts
Gunakan akun berikut untuk testing:
### Customer Account
- **Email**: customer@test.com
- **Password**: password
### Montir Account  
- **Email**: montir@test.com
- **Password**: password
## Struktur Proyek
```
src/
├── components/          # Reusable components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── BottomNavigation.tsx
│   ├── MapPicker.tsx
│   ├── RatingStars.tsx
│   └── ...
├── routes/             # Page components
│   ├── BookingPage.tsx
│   ├── HistoryPage.tsx
│   ├── ShopPage.tsx
│   └── ...
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── hooks/              # Custom hooks
│   ├── useBookings.ts
│   ├── useProducts.ts
│   └── ...
├── services/           # API services
│   ├── api.ts
│   ├── auth.service.ts
│   └── ...
├── types/              # TypeScript interfaces
│   └── index.ts
└── ...
server/
├── index.js            # Express server
├── package.json
└── ...
```
## API Endpoints
### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking detail
- `PATCH /api/bookings/:id` - Update booking status
### Products & Shop
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product detail
### Wallet & Payments
- `GET /api/wallet/:userId` - Get wallet balance
- `POST /api/wallet/topup` - Top up balance
- `POST /api/payments/create-token` - Create payment token
### Promos
- `GET /api/promos` - Get active promos
## Real-time Features
Aplikasi menggunakan Socket.io untuk fitur real-time:
### Events
- `new_booking` - Notifikasi booking baru untuk montir
- `booking_updated` - Update status booking
- `transaction_success` - Konfirmasi transaksi berhasil
## Mode Development vs Production
### Development Mode (Default)
- Menggunakan mock server lokal
- Data disimpan in-memory
- Maps menggunakan OpenStreetMap (gratis)
- Payment menggunakan mock provider
### Production Mode
Untuk production, ganti konfigurasi berikut di `.env`:
```env
# Database
DATABASE_URL=postgresql://...
# Maps
VITE_MAP_PROVIDER=google
VITE_GOOGLE_MAPS_API_KEY=your_api_key
# Payment
PAYMENT_PROVIDER=midtrans
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
# Real-time
VITE_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase config
```
## Deployment
### Frontend (Vercel/Netlify)
```bash
npm run build
# Upload dist/ folder
```
### Backend (Railway/Heroku)
```bash
cd server
# Deploy server folder
```
## Testing
### Manual Testing Checklist
- [ ] User dapat signup/login
- [ ] User dapat membuat booking montir/towing
- [ ] Montir dapat melihat dan menerima booking
- [ ] Real-time notification berfungsi
- [ ] User dapat berbelanja di toko sparepart
- [ ] Cart dan checkout berfungsi
- [ ] Wallet top-up berfungsi
- [ ] User dapat memberikan rating
- [ ] Maps picker berfungsi
- [ ] Responsive di mobile dan desktop
### Unit Tests
```bash
npm test
```
## Contributing
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request
## Roadmap
### Phase 1 ✅
- [x] Basic booking system
- [x] User authentication
- [x] Montir dashboard
- [x] Shop & cart functionality
- [x] Wallet system
- [x] Real-time notifications
### Phase 2 🚧
- [ ] Chat system
- [ ] Advanced search & filters
- [ ] Push notifications
- [ ] Mobile app (React Native)
### Phase 3 📋
- [ ] Admin panel
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Advanced payment methods
## License
MIT License - see LICENSE file for details
## Support
Untuk pertanyaan atau dukungan, silakan buat issue di repository ini atau hubungi tim development.