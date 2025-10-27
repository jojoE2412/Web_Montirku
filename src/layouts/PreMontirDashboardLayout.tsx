import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Only need LogOut for a simple header

interface PreMontirDashboardLayoutProps {
  children: ReactNode;
}

const PreMontirDashboardLayout: React.FC<PreMontirDashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header - Simplified Blue Theme */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-conic-gradient(white 0% 25%, transparent 0% 50%) 50% / 20px 20px`
          }}></div>
        </div>

        <div className="relative z-10 px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                MontirKu Pro
              </h1>
            </Link>

            <div className="flex items-center space-x-3">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-white">{user.fullName}</div>
                    <div className="text-xs text-blue-100 capitalize">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <LogOut size={20} className="inline-block mr-1" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default PreMontirDashboardLayout;
