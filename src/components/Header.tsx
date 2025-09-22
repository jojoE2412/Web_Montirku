import React, { useState } from 'react';
import { Bell, HelpCircle, Menu, X, User } from 'lucide-react';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
  };

  const switchToSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  const switchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  return (
    <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg relative overflow-hidden">
      {/* Checkered pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: `repeating-conic-gradient(black 0% 25%, transparent 0% 50%) 50% / 20px 20px`
        }}></div>
      </div>
      
      <div className="relative z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Menu and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}>
                {isMenuOpen ? <X size={24} className="text-black" /> : <Menu size={24} className="text-black" />}
              </div>
            </button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-black drop-shadow-lg">
                MontirKu
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#" className="font-semibold text-black hover:text-gray-700 transition-colors">Beranda</a>
            <a href="#" className="font-semibold text-black hover:text-gray-700 transition-colors">Tentang</a>
            <a href="#" className="font-semibold text-black hover:text-gray-700 transition-colors">Hubungi</a>
            <button 
              onClick={handleLoginClick}
              className="font-semibold text-black hover:text-gray-700 transition-colors"
            >
              Login
            </button>
          </nav>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Navigation Items */}
            <div className="flex lg:hidden items-center space-x-2">
              <button className="p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors">
                <Bell size={20} />
              </button>
              <button className="p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors">
                <HelpCircle size={20} />
              </button>
              <button className="p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors">
                <User size={20} />
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex items-center space-x-2 px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
                >
                  <Bell size={20} />
                  <span className="font-semibold">Notifikasi</span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600">Tidak ada notifikasi terbaru</p>
                    </div>
                  </div>
                )}
              </div>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors">
                <HelpCircle size={20} />
                <span className="font-semibold">Bantuan</span>
              </button>
              
              <button 
                onClick={handleLoginClick}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <User size={20} />
                <span className="font-semibold">Login / Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginPage 
          onClose={() => setShowLogin(false)}
          onSwitchToSignUp={switchToSignUp}
        />
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <SignUpPage 
          onClose={() => setShowSignUp(false)}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </header>
  );
};

export default Header;