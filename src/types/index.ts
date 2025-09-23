export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'montir' | 'admin';
  avatarUrl?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  montirId?: string;
  serviceType: 'mechanic' | 'towing';
  vehicle: { 
    make?: string; 
    model?: string; 
    plate?: string; 
  };
  location: { 
    lat: number; 
    lng: number; 
    address: string; 
  };
  scheduledAt: string;
  status: 'pending' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
  updatedAt?: string;
  review?: {
    rating: number;
    comment: string;
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
  text: string;
  createdAt: string;
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