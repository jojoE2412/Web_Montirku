import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'; // Added useCallback // Added useCallback
import { User } from '../types';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast'; // Import toast


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{user:User; token:string}>;
  signup: (userData: { fullName: string; email: string; phone: string; password: string; role: string }) => Promise<{ user: User; token: string }>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>; // New function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // This is the base URL, not the socket URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'; // Assuming socket runs on port 3000

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null); // State for socket instance

  const refreshUser = useCallback(async () => {
    setLoading(true); // Set loading to true while refreshing
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Token invalid');
        const data = await res.json();
        // Only update user state if data has actually changed to prevent unnecessary re-renders
        if (JSON.stringify(user) !== JSON.stringify(data)) {
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [setLoading, setUser]); // Dependencies for useCallback

  useEffect(() => {
    refreshUser(); // Initial fetch
  }, []); // Run once on mount

  // Socket.IO connection and event listener
  useEffect(() => {
    if (user && user.id && !socket) { // Connect only if user is logged in and socket not yet connected
      const newSocket = io(SOCKET_URL, {
        query: { userId: user.id }, // Pass userId for identification
        extraHeaders: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // Pass token for auth
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        // Join a room specific to the user's ID
        newSocket.emit('join_user_room', user.id);
      });

      newSocket.on('employee_removed_from_workshop', (data) => {
        console.log('Received employee_removed_from_workshop event:', data);
        // Force refresh user data, which will set workshopId to null
        refreshUser();
        // The App.tsx useEffect will then redirect to /workshop-setup
      });

      newSocket.on('join_request_rejected', (data) => {
        console.log('Received join_request_rejected event:', data);
        toast.error(`Permintaan Anda untuk bergabung dengan ${data.workshopName} telah ditolak.`);
        // Refresh user to update hasPendingRequest to false
        refreshUser();
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (!user && socket) { // Disconnect if user logs out
      socket.disconnect();
      setSocket(null);
    }
  }, [user, socket, refreshUser]); // Depend on user, socket, and refreshUser

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    await refreshUser(); // Refresh user after login to get full data including workshopId
    return {user: data.user, token: data.token};
  };

  const signup = async (userData: { fullName: string; email: string; phone: string; password: string; role: string }) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Signup failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    await refreshUser(); // Refresh user after signup
    return{user: data.user, token: data.token};
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
