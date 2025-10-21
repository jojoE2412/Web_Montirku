import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import CustomerLayout from './layouts/CustomerLayout';
import MontirLayout from './layouts/MontirLayout';
import MainLayout from './layouts/MainLayout';

import LandingPage from './pages/public/LandingPage';
import DashboardCustomer from './pages/user/DashboardCustomer';
import DashboardMontir from './pages/montir/DashboardMontir';
import RequestsMontir from './pages/montir/RequestsMontir';
import ScheduleMontir from './pages/montir/ScheduleMontir';
import HistoryMontir from './pages/montir/HistoryMontir';
import WorkshopManagement from './pages/montir/WorkshopManagement';

import BookingPage from './routes/BookingPage';
import BookingDetailPage from './routes/BookingDetailPage';
import HistoryPage from './routes/HistoryPage';
import ProfilePage from './routes/ProfilePage';
import ShopPage from './routes/ShopPage';
import CartPage from './routes/CartPage';
import WalletPage from './routes/WalletPage';
import NotificationsPage from './routes/NotificationsPage';

import EmergencyServicePage from './routes/PanggilDaruratPage';
import PerawatanRutinPage from './routes/PerawatanRutinPage';
import BawaSendiriPage from './routes/BawaSendiriPage';
import TowingPage from './routes/TowingPage';


const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <Routes>
        <Route path="/" element={
          <MainLayout>
            <LandingPage />
          </MainLayout>
        } />

        <Route path="/shop" element={
          <MainLayout>
            <ShopPage />
          </MainLayout>
        } />

        <Route path="/user/dashboard" element={
          <ProtectedRoute requiredRole="customer">
            <CustomerLayout>
              <DashboardCustomer />
            </CustomerLayout>
          </ProtectedRoute>
        } />

        <Route path="/booking" element={
          <ProtectedRoute>
            <CustomerLayout>
              <BookingPage />
            </CustomerLayout>
          </ProtectedRoute>
        } />

        <Route path="/booking/:id" element={
          <ProtectedRoute>
            <CustomerLayout>
              <BookingDetailPage />
            </CustomerLayout>
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute>
            <CustomerLayout>
              <HistoryPage />
            </CustomerLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            {user?.role === 'montir' ? (
              <MontirLayout>
                <ProfilePage />
              </MontirLayout>
            ) : (
              <CustomerLayout>
                <ProfilePage />
              </CustomerLayout>
            )}
          </ProtectedRoute>
        } />

        <Route path="/cart" element={
          <ProtectedRoute>
            <CustomerLayout>
              <CartPage />
            </CustomerLayout>
          </ProtectedRoute>
        } />

        <Route path="/wallet" element={
          <ProtectedRoute>
            {user?.role === 'montir' ? (
              <MontirLayout>
                <WalletPage />
              </MontirLayout>
            ) : (
              <CustomerLayout>
                <WalletPage />
              </CustomerLayout>
            )}
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            {user?.role === 'montir' ? (
              <MontirLayout>
                <NotificationsPage />
              </MontirLayout>
            ) : (
              <CustomerLayout>
                <NotificationsPage />
              </CustomerLayout>
            )}
          </ProtectedRoute>
        } />

        <Route path="/montir/dashboard" element={
          <ProtectedRoute requiredRole="montir">
            <MontirLayout>
              <DashboardMontir />
            </MontirLayout>
          </ProtectedRoute>
        } />

        <Route path="/montir/requests" element={
          <ProtectedRoute requiredRole="montir">
            <MontirLayout>
              <RequestsMontir />
            </MontirLayout>
          </ProtectedRoute>
        } />

        <Route path="/montir/schedule" element={
          <ProtectedRoute requiredRole="montir">
            <MontirLayout>
              <ScheduleMontir />
            </MontirLayout>
          </ProtectedRoute>
        } />

        <Route path="/montir/history" element={
          <ProtectedRoute requiredRole="montir">
            <MontirLayout>
              <HistoryMontir />
            </MontirLayout>
          </ProtectedRoute>
        } />

        <Route path="/montir/workshop-management" element={
          <ProtectedRoute requiredRole="montir">
            <MontirLayout>
              <WorkshopManagement />
            </MontirLayout>
          </ProtectedRoute>
        } />

        <Route path="/booking/panggil-darurat" element={
          <ProtectedRoute requiredRole="customer">
            <CustomerLayout>
              <EmergencyServicePage />
              </CustomerLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/booking/perawatan-rutin" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <PerawatanRutinPage />
                  </CustomerLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/booking/bawa-sendiri" element={
                  <ProtectedRoute requiredRole="customer">
                    <CustomerLayout>
                      <BawaSendiriPage />
                      </CustomerLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/booking/towing" element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerLayout>
                          <TowingPage />
                          </CustomerLayout>
                          </ProtectedRoute>
                        } />


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
          <Toaster position="top-right" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;