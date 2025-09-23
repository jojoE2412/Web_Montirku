const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
const db = {
  users: [
    {
      id: '1',
      fullName: 'John Customer',
      email: 'customer@test.com',
      phone: '081234567890',
      role: 'customer',
      password: bcrypt.hashSync('password', 10),
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      fullName: 'Ahmad Montir',
      email: 'montir@test.com',
      phone: '081234567891',
      role: 'montir',
      password: bcrypt.hashSync('password', 10),
      createdAt: new Date().toISOString()
    }
  ],
  bookings: [
    {
      id: '1',
      userId: '1',
      serviceType: 'mechanic',
      vehicle: {
        make: 'Toyota',
        model: 'Avanza',
        plate: 'B 1234 ABC'
      },
      location: {
        lat: -6.2088,
        lng: 106.8456,
        address: 'Jakarta Pusat, DKI Jakarta'
      },
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      price: 150000,
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      review: {
        rating: 5,
        comment: 'Pelayanan sangat memuaskan!'
      }
    }
  ],
  products: [
    {
      id: '1',
      title: 'Oli Mesin Castrol GTX 10W-40',
      price: 85000,
      stock: 25,
      category: 'oli',
      description: 'Oli mesin berkualitas tinggi untuk perlindungan maksimal',
      image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'Ban Michelin Energy XM2 185/65 R15',
      price: 750000,
      stock: 8,
      category: 'ban',
      description: 'Ban berkualitas dengan daya tahan tinggi',
      image: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      title: 'Filter Udara K&N',
      price: 250000,
      stock: 15,
      category: 'sparepart',
      description: 'Filter udara performa tinggi untuk mesin yang lebih bertenaga'
    },
    {
      id: '4',
      title: 'Kampas Rem Brembo',
      price: 180000,
      stock: 12,
      category: 'sparepart',
      description: 'Kampas rem berkualitas untuk pengereman yang optimal'
    }
  ],
  promos: [
    {
      id: '1',
      title: 'Diskon Servis',
      description: 'Servis berkala kendaraan',
      discount: 50,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Promo Sparepart',
      description: 'Beli 2 gratis 1 untuk oli mesin',
      discount: 30,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Cashback Derek',
      description: 'Cashback 20% untuk layanan derek',
      discount: 20,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  transactions: [],
  notifications: [],
  messages: []
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // Check if user exists
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = {
      id: uuidv4(),
      fullName,
      email,
      phone,
      role: 'customer',
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    db.users.push(user);

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);

    // Remove password from response
    const { password: _, ...userResponse } = user;
    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);

    // Remove password from response
    const { password: _, ...userResponse } = user;
    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { password: _, ...userResponse } = user;
  res.json(userResponse);
});

// Booking routes
app.get('/api/bookings', authenticateToken, (req, res) => {
  const { userId } = req.query;
  let bookings = db.bookings;
  
  if (userId) {
    bookings = bookings.filter(b => b.userId === userId);
  }
  
  res.json(bookings);
});

app.get('/api/bookings/:id', authenticateToken, (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(booking);
});

app.post('/api/bookings', authenticateToken, (req, res) => {
  const booking = {
    id: uuidv4(),
    userId: req.user.id,
    ...req.body,
    status: 'pending',
    price: Math.floor(Math.random() * 200000) + 100000, // Random price
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString()
  };
  
  db.bookings.push(booking);
  
  // Emit notification to montirs
  io.emit('new_booking', booking);
  
  res.json(booking);
});

app.patch('/api/bookings/:id', authenticateToken, (req, res) => {
  const bookingIndex = db.bookings.findIndex(b => b.id === req.params.id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  db.bookings[bookingIndex] = {
    ...db.bookings[bookingIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  // Emit status update
  io.emit('booking_updated', db.bookings[bookingIndex]);
  
  res.json(db.bookings[bookingIndex]);
});

// Product routes
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Promo routes
app.get('/api/promos', (req, res) => {
  res.json(db.promos);
});

// Wallet routes
app.get('/api/wallet/:userId', authenticateToken, (req, res) => {
  const transactions = db.transactions.filter(t => t.userId === req.params.userId);
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  res.json({
    balance,
    transactions
  });
});

app.post('/api/wallet/topup', authenticateToken, (req, res) => {
  const { amount } = req.body;
  
  // Mock payment token
  const paymentToken = uuidv4();
  
  // Simulate successful payment
  setTimeout(() => {
    const transaction = {
      id: uuidv4(),
      userId: req.user.id,
      amount: amount,
      type: 'topup',
      status: 'success',
      createdAt: new Date().toISOString(),
      description: 'Top Up via Mock Payment'
    };
    
    db.transactions.push(transaction);
    
    // Emit notification
    io.to(req.user.id).emit('transaction_success', transaction);
  }, 2000);
  
  res.json({ paymentToken });
});

// Payment routes
app.post('/api/payments/create-token', authenticateToken, (req, res) => {
  const paymentToken = uuidv4();
  res.json({ paymentToken });
});

app.post('/api/payments/confirm', authenticateToken, (req, res) => {
  const { bookingId } = req.body;
  
  const bookingIndex = db.bookings.findIndex(b => b.id === bookingId);
  if (bookingIndex !== -1) {
    db.bookings[bookingIndex].paymentStatus = 'paid';
  }
  
  res.json({ success: true });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_user', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`Test credentials:`);
  console.log(`Customer: customer@test.com / password`);
  console.log(`Montir: montir@test.com / password`);
});