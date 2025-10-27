import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import CustomerLayout from './layouts/CustomerLayout';
import MontirLayout from './layouts/MontirLayout';
import MainLayout from './layouts/MainLayout';
import PreMontirDashboardLayout from './layouts/PreMontirDashboardLayout'; // NEW IMPORT

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

import WorkshopSetupPage from './routes/WorkshopSetupPage';
import JoinWorkshopPage from './routes/JoinWorkshopPage';
import WaitingConfirmationPage from './pages/montir/WaitingConfirmationPage';


const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Do nothing while loading

    if (user?.role === 'montir') {
      const isMontirOnboardingFlow = 
        location.pathname.startsWith('/workshop-setup') ||
        location.pathname.startsWith('/workshop/create') || // Add this line
        location.pathname.startsWith('/workshop/join') ||
        location.pathname.startsWith('/montir/waiting-confirmation');

      // 1. If user has a pending request, force them to the waiting page.
      if (user.hasPendingRequest) {
        if (location.pathname !== '/montir/waiting-confirmation') {
          navigate('/montir/waiting-confirmation', { replace: true });
        }
        return; // Stop further checks
      }

      // 2. If user has no workshop and no pending request, force them to the setup page.
      if (!user.workshopId && !user.hasPendingRequest && !isMontirOnboardingFlow) {
        navigate('/workshop-setup', { replace: true });
        return; // Stop further checks
      }
    }
  }, [user, loading, navigate, location]);

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

        {/* Workshop Setup Flow - Now uses PreMontirDashboardLayout */}
        <Route path="/workshop-setup" element={
          <ProtectedRoute requiredRole="montir">
            <PreMontirDashboardLayout>
              <WorkshopSetupPage />
            </PreMontirDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/workshop/create" element={
          <ProtectedRoute requiredRole="montir">
            <PreMontirDashboardLayout>
              <WorkshopManagement /> {/* Now uses WorkshopManagement */}
            </PreMontirDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/workshop/join" element={
          <ProtectedRoute requiredRole="montir">
            <PreMontirDashboardLayout>
              <JoinWorkshopPage />
            </PreMontirDashboardLayout>
          </ProtectedRoute>
        } />

        {/* Route for the new waiting page */}
        <Route path="/montir/waiting-confirmation" element={
          <ProtectedRoute requiredRole="montir">
            <WaitingConfirmationPage />
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