import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Wrench, Car, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose, onSwitchToSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    login(formData.email, formData.password)
      .then(({ user }) => {
        toast.success('Login berhasil!');
        onClose();

     if (user.role.toLowerCase() === "montir") {
  window.location.href = "/montir/dashboard";
} else if (user.role.toLowerCase() === "customer") {
  window.location.href = "/user/dashboard"; // arahkan ke layout customer
} else {
  window.location.href = "/";
}

      })
      .catch((error) => {
        toast.error('Login gagal. Periksa email dan password Anda.');
        console.error('Login error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header with automotive theme */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 relative overflow-hidden">
          {/* Checkered pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full" style={{
              backgroundImage: `repeating-conic-gradient(black 0% 25%, transparent 0% 50%) 50% / 15px 15px`
            }}></div>
          </div>     
          
          <div className="relative z-10 text-center">
            <div className="flex justify-center items-center space-x-2 mb-2">
              <div className="bg-black/20 p-2 rounded-full">
                <Wrench size={24} className="text-black" />
              </div>
              <h1 className="text-2xl font-bold text-black">MontirKu</h1>
            </div>
            <h2 className="text-xl font-semibold text-black">Login ke Akun Anda</h2>
            <p className="text-black/80 text-sm mt-1">Masuk untuk mengakses layanan montir terbaik</p>
          </div>
          
          {/* Decorative automotive icons */}
          <div className="absolute top-2 right-2 opacity-30">
            <Car size={20} className="text-black" />
          </div>
          <div className="absolute bottom-2 left-2 opacity-30">
            <Settings size={16} className="text-black" />
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email atau Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Masukkan email atau username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Lupa Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:from-orange-600 hover:to-orange-700 disabled:hover:from-gray-400 disabled:hover:to-gray-500 transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">atau</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span className="font-medium text-gray-700">Login dengan Google</span>
              </button>
              
              <button
                type="button"
                className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span className="font-medium text-gray-700">Login dengan Facebook</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Daftar di sini
                </button>              </p>
            </div>
          </form>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-yellow-300 bg-gradient-to-r from-red-500 to-red-700 rounded-full p-2 shadow-md hover:scale-105 transition-transform duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;