import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNavigation from './components/BottomNavigation';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import MainContent from './components/MainContent';
import BookingPage from './routes/BookingPage';
import BookingDetailPage from './routes/BookingDetailPage';
import HistoryPage from './routes/HistoryPage';
import ProfilePage from './routes/ProfilePage';
import MontirDashboard from './routes/MontirDashboard';
import ShopPage from './routes/ShopPage';
import CartPage from './routes/CartPage';
import WalletPage from './routes/WalletPage';
import NotificationsPage from './routes/NotificationsPage';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('servis');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header onMenuToggle={toggleSidebar} isMenuOpen={isSidebarOpen} />
        
        <div className="flex">
          <div className="hidden lg:block">
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
          
          {/* Mobile Sidebar */}
          <div className="lg:hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>
          
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route 
                path="/booking" 
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/booking/:id" 
                element={
                  <ProtectedRoute>
                    <BookingDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/montir/dashboard" 
                element={
                  <ProtectedRoute requiredRole="montir">
                    <MontirDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/shop" element={<ShopPage />} />
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
        
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <AppContent />
          <Toaster position="top-right" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;