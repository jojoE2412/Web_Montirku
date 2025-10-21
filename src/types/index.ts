export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'montir' | 'admin';
  avatarUrl?: string;
  averageRating?: number; // Added for montir role
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  workshopId: string; // Added workshopId
  montirId?: string;
  serviceType: 'panggil_montir' | 'bawa_bengkel';
  subType?: 'darurat' | 'rutin' | 'bawa_sendiri' | 'towing';
  description?: string;
  vehicle: { 
    make?: string; 
    model?: string; 
    plate?: string; 
    year?: string; 
    color?: string; 
  };
  location: { 
    lat: number; 
    lng: number; 
    address: string; 
  };
  pickupLocation?: { lat: number; lng: number; address: string };
  destinationLocation?: { lat: number; lng: number; address: string } | null;
  scheduledAt: string;
  status: 'pending' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled' | 'waiting_approval' | 'approved';
  price: number;
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
  updatedAt?: string;
  // Removed old review property
  duration?: number; // Duration in minutes
  montir?: {
    name: string;
    averageRating: number | null;
    ratingCount: number;
    review?: { rating: number; comment: string | null; }; // Added review to montir
  };
  workshop?: { // Added workshop property
    name?: string; // Added name for workshop
    averageRating: number | null;
    ratingCount: number;
    review?: { rating: number; comment: string | null; }; // Added review to workshop
  };
}

export interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  category?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'topup' | 'payment' | 'refund';
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  description?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  meta?: any;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'image' | 'video';
  text?: string; // Optional for media messages
  mediaUrl?: string; // Optional for text messages
  createdAt: string;
}

export interface Conversation {
  id: string;
  bookingId: string;
  customerId: string;
  montirId?: string;
  workshopId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  imageUrl?: string;
}

export interface Workshop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: 'available' | 'full';
  isOpen: boolean;
  openHours?: string;
  montirId?: string;
  has_towing_vehicle?: boolean;
  towing_affiliate?: boolean;
  averageRating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingsResponse {
  data: Booking[];
}