// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const pool = require("./db");
require('dotenv').config();
const multer = require('multer');
const path = require('path');

// --- Scheduling Helpers ---

/**
 * Estimates service duration in minutes based on keywords in the description.
 * @param {string} description - The booking description containing service types.
 * @returns {number} Estimated duration in minutes.
 */
function getServiceDuration(description = '') {
  let duration = 0;
  if (description.includes('ganti_oli')) duration += 60;
  if (description.includes('tune_up')) duration += 120;
  if (description.includes('cek_rem')) duration += 90;
  if (description.includes('servis_ringan')) duration += 120;
  if (description.includes('servis_besar')) duration += 240;
  if (duration === 0) duration = 60; // Default duration if no keyword matches
  return duration;
}

/**
 * Calculates the Haversine distance between two points on the earth.
 * @param {{lat: number, lng: number}} coords1 - The first point's coordinates.
 * @param {{lat: number, lng: number}} coords2 - The second point's coordinates.
 * @returns {number} The distance in kilometers.
 */
function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Parses an operating hours string (e.g., "08:00 - 17:00") into Date objects for a specific day.
 * @param {string} hoursString - The operating hours string.
 * @param {Date} bookingDate - The date of the booking.
 * @returns {{start: Date, end: Date} | null} An object with start and end Date objects, or null if parsing fails.
 */
function parseOperatingHours(hoursString, bookingDate) {
  if (!hoursString || !hoursString.includes('-')) return null;

  const [startTime, endTime] = hoursString.split('-').map(s => s.trim());
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return null;
  }

  const start = new Date(bookingDate);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(bookingDate);
  end.setHours(endHour, endMinute, 0, 0);

  return { start, end };
}


// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be stored in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
} // pastikan db.js mengekspor mysql2/promise pool

const app = express();

// Config from env
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Basic middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(morgan('dev'));

// Rate limiter (basic)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// --- Helper: centralized error responder ---
function handleServerError(res, context = '') {
  return (error) => {
    console.error(context, error);
    res.status(500).json({ error: 'Internal server error' });
  };
}

// --- Auth middleware ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

// ================== ROUTES ==================

// Healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ------------------ AUTH ------------------
// Signup with express-validator
app.post('/api/auth/signup',
  [
    body('fullName').isString().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().isString().trim(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['customer', 'montir'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { fullName, email, phone, password, role } = req.body;

      const [rows] = await pool.query('SELECT id FROM user_accounts WHERE email = ?', [email]);
      if (rows.length > 0) return res.status(400).json({ error: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      const id = uuidv4();

      await pool.query(
        'INSERT INTO user_accounts (id, fullName, email, phone, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [id, fullName, email, phone || null, hashedPassword, role]
      );

      const [newUserRows] = await pool.query(
        'SELECT id, fullName, email, phone, role, created_at FROM user_accounts WHERE id = ?',
        [id]
      );

      const user = newUserRows[0];
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.status(201).json({ user, token });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Login
app.post('/api/auth/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const [rows] = await pool.query('SELECT * FROM user_accounts WHERE email = ?', [email]);
      if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // Remove password before sending
      delete user.password;
      res.json({ user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role }, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, fullName, email, phone, role, created_at FROM user_accounts WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ WORKSHOPS ------------------

// Get all workshops with optional pagination
app.get('/api/workshops', async (req, res) => {
  try {
    // basic pagination
    const limit = parseInt(req.query.limit, 10) || 50;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query('SELECT * FROM workshops LIMIT ? OFFSET ?', [limit, offset]);
    res.json({ data: rows, pagination: { page, limit } });
  } catch (error) {
    console.error('Get workshops error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workshop by id
app.get('/api/workshops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM workshops WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Workshop not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get workshop by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create workshop (only montir)
app.post('/api/workshops', authenticateToken, [
  body('name').isString().notEmpty(),
  body('address').isString().notEmpty(),
  body('lat').optional().isFloat(),
  body('lng').optional().isFloat(),
  body('openHours').optional().isString()
], async (req, res) => {
  try {
    if (req.user.role !== 'montir') return res.status(403).json({ error: 'Forbidden: Only montirs can create workshops' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, address, lat, lng, openHours } = req.body;
    const id = uuidv4();

    // check existing
    const [existingWorkshop] = await pool.query('SELECT id FROM workshops WHERE montir_id = ?', [req.user.id]);
    if (existingWorkshop.length > 0) return res.status(400).json({ error: 'Montir already owns a workshop' });

    await pool.query('INSERT INTO workshops (id, name, address, lat, lng, open_hours, montir_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [id, name, address, lat || null, lng || null, openHours || null, req.user.id]);

    res.status(201).json({ id, name, address, lat, lng, openHours, montirId: req.user.id });
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update workshop (owner only)
app.put('/api/workshops/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, lat, lng, status, isOpen, openHours } = req.body;

    const [workshopRows] = await pool.query('SELECT * FROM workshops WHERE id = ?', [id]);
    if (workshopRows.length === 0) return res.status(404).json({ error: 'Workshop not found' });

    const workshop = workshopRows[0];
    if (workshop.montir_id !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this workshop' });

    await pool.query('UPDATE workshops SET name = ?, address = ?, lat = ?, lng = ?, status = ?, is_open = ?, open_hours = ?, updated_at = NOW() WHERE id = ?',
      [name || workshop.name, address || workshop.address, lat || workshop.lat, lng || workshop.lng, status || workshop.status, typeof isOpen === 'boolean' ? isOpen : workshop.is_open, openHours || workshop.open_hours, id]);

    res.json({ id, name: name || workshop.name, address: address || workshop.address, lat: lat || workshop.lat, lng: lng || workshop.lng, status: status || workshop.status, isOpen: typeof isOpen === 'boolean' ? isOpen : workshop.is_open, openHours: openHours || workshop.open_hours, montirId: req.user.id });
  } catch (error) {
    console.error('Update workshop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete workshop (owner only)
app.delete('/api/workshops/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [workshopRows] = await pool.query('SELECT * FROM workshops WHERE id = ?', [id]);
    if (workshopRows.length === 0) return res.status(404).json({ error: 'Workshop not found' });

    const workshop = workshopRows[0];
    if (workshop.montir_id !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this workshop' });

    await pool.query('DELETE FROM workshops WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Delete workshop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ BOOKINGS ------------------

// Get bookings (optionally by userId) - supports simple filters and pagination
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { userId, status } = req.query;
    const limit = parseInt(req.query.limit, 10) || 50;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * limit;

    let query = "SELECT id, user_id, montir_id, service_type, sub_type, vehicle_make, vehicle_model, vehicle_plate, location_lat, location_lng, location_address, scheduled_at, description, additional_notes, pickup_location_lat, pickup_location_lng, pickup_location_address, destination_location_lat, destination_location_lng, destination_location_address, media_urls, status, price, payment_status, created_at, updated_at FROM bookings";
    const params = [];
    const where = [];

    if (userId) {
      where.push('(user_id = ? OR montir_id = ?)');
      params.push(userId, userId);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    if (where.length > 0) query += ' WHERE ' + where.join(' AND ');

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const bookingsWithDuration = rows.map(booking => ({
      ...booking,
      duration: getServiceDuration(booking.description)
    }));
    res.json({ data: bookingsWithDuration, pagination: { page, limit } });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking by id
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT id, user_id, montir_id, service_type, sub_type, vehicle_make, vehicle_model, vehicle_plate, location_lat, location_lng, location_address, scheduled_at, description, additional_notes, pickup_location_lat, pickup_location_lng, pickup_location_address, destination_location_lat, destination_location_lng, destination_location_address, media_urls, status, price, payment_status, created_at, updated_at FROM bookings WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = rows[0];
    if (req.user.id !== booking.user_id && req.user.id !== booking.montir_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not authorized to view this booking' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create booking
app.post("/api/bookings", authenticateToken, upload.array('media', 5), async (req, res) => {
  try {
    const { serviceType, subType, scheduledAt, description, additionalNotes } = req.body;
    const id = uuidv4();
    const userId = req.user.id;

    // Parse complex objects from FormData
    const vehicle = JSON.parse(req.body.vehicle);
    const location = JSON.parse(req.body.location);
    const pickupLocation = req.body.pickupLocation ? JSON.parse(req.body.pickupLocation) : null;
    const destinationLocation = req.body.destinationLocation ? JSON.parse(req.body.destinationLocation) : null;
    
    const mediaUrls = req.files ? req.files.map(file => file.path) : [];

    // NEW: Logic for routine maintenance scheduling
    if (subType === 'rutin') {
        const customerLocation = location;
        const requestedTime = new Date(scheduledAt);
        const serviceDuration = getServiceDuration(description); // in minutes

        const [workshops] = await pool.query('SELECT * FROM workshops WHERE is_open = true AND montir_id IS NOT NULL');

        let availableMechanics = [];

        for (const workshop of workshops) {
            // 1. Check Operating Hours
            const operatingHours = parseOperatingHours(workshop.open_hours, requestedTime);
            if (!operatingHours) continue;

            const requestedStartTime = new Date(requestedTime);
            const requestedEndTime = new Date(requestedStartTime.getTime() + serviceDuration * 60000);

            if (requestedStartTime < operatingHours.start || requestedEndTime > operatingHours.end) {
                continue; // Skip if outside operating hours
            }

            // 2. Check for Schedule Conflicts
            const [montirBookings] = await pool.query(
                'SELECT scheduled_at, description FROM bookings WHERE montir_id = ? AND status NOT IN (?, ?) AND DATE(scheduled_at) = DATE(?)',
                [workshop.montir_id, 'completed', 'cancelled', requestedStartTime]
            );

            let isConflict = false;
            for (const booking of montirBookings) {
                const existingStartTime = new Date(booking.scheduled_at);
                const existingDuration = getServiceDuration(booking.description);
                const existingEndTime = new Date(existingStartTime.getTime() + existingDuration * 60000);

                // Check for overlap
                if (requestedStartTime < existingEndTime && requestedEndTime > existingStartTime) {
                    isConflict = true;
                    break;
                }
            }

            if (isConflict) {
                continue; // Skip if there's a conflict
            }

            // 3. Calculate Distance
            const distance = haversineDistance(customerLocation, { lat: workshop.lat, lng: workshop.lng });
            availableMechanics.push({ ...workshop, distance });
        }

        if (availableMechanics.length === 0) {
            return res.status(404).json({ error: 'Tidak ada montir yang tersedia pada jadwal yang diminta. Silakan coba jadwal lain.' });
        }

        // Sort by distance (nearest first)
        availableMechanics.sort((a, b) => a.distance - b.distance);
        const bestMontir = availableMechanics[0];

        // Create booking with the best montir
        await pool.query(
          "INSERT INTO bookings (id, user_id, montir_id, service_type, sub_type, vehicle_make, vehicle_model, vehicle_plate, location_lat, location_lng, location_address, scheduled_at, description, additional_notes, media_urls, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [id, userId, bestMontir.montir_id, serviceType, subType, vehicle.make, vehicle.model, vehicle.plate, location?.lat, location?.lng, location?.address, scheduledAt, description, additionalNotes, JSON.stringify(mediaUrls), 'pending', 'unpaid']
        );
        return res.status(201).json({ id, userId, serviceType, subType, vehicle, location, scheduledAt, description, additionalNotes, mediaUrls, status: 'pending', paymentStatus: 'unpaid' });
    }
    // END OF NEW LOGIC

    // Original logic for other booking types
    await pool.query(
      "INSERT INTO bookings (id, user_id, workshop_id, service_type, sub_type, vehicle_make, vehicle_model, vehicle_plate, location_lat, location_lng, location_address, scheduled_at, description, additional_notes, destination_location_lat, destination_location_lng, destination_location_address, media_urls, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, userId, serviceType, subType, vehicle.make, vehicle.model, vehicle.plate, location?.lat, location?.lng, location?.address, scheduledAt, description, additionalNotes, pickupLocation?.lat, pickupLocation?.lng, pickupLocation?.address, destinationLocation?.lat, destinationLocation?.lng, destinationLocation?.address, JSON.stringify(mediaUrls), 'pending', 'unpaid']
    );
    res.status(201).json({ id, userId, serviceType, subType, vehicle, location, scheduledAt, description, additionalNotes, pickupLocation, destinationLocation, mediaUrls, status: 'pending', paymentStatus: 'unpaid' });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update booking (partial fields allowed)
app.patch('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    const [bookingRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookingRows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = bookingRows[0];
    if (userId !== booking.user_id && userId !== booking.montir_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not authorized to update this booking' });
    }

    const updateFields = [];
    const updateValues = [];

    // Map allowed updates (safe subset)
    if (updates.vehicle) {
      if (updates.vehicle.make) { updateFields.push('vehicle_make = ?'); updateValues.push(updates.vehicle.make); }
      if (updates.vehicle.model) { updateFields.push('vehicle_model = ?'); updateValues.push(updates.vehicle.model); }
      if (updates.vehicle.plate) { updateFields.push('vehicle_plate = ?'); updateValues.push(updates.vehicle.plate); }
    }
    if (updates.location) {
      if (updates.location.lat) { updateFields.push('location_lat = ?'); updateValues.push(updates.location.lat); }
      if (updates.location.lng) { updateFields.push('location_lng = ?'); updateValues.push(updates.location.lng); }
      if (updates.location.address) { updateFields.push('location_address = ?'); updateValues.push(updates.location.address); }
    }
    if (updates.pickupLocation) {
      if (updates.pickupLocation.lat) { updateFields.push('pickup_location_lat = ?'); updateValues.push(updates.pickupLocation.lat); }
      if (updates.pickupLocation.lng) { updateFields.push('pickup_location_lng = ?'); updateValues.push(updates.pickupLocation.lng); }
      if (updates.pickupLocation.address) { updateFields.push('pickup_location_address = ?'); updateValues.push(updates.pickupLocation.address); }
    }
    if (updates.destinationLocation) {
      if (updates.destinationLocation.lat) { updateFields.push('destination_location_lat = ?'); updateValues.push(updates.destinationLocation.lat); }
      if (updates.destinationLocation.lng) { updateFields.push('destination_location_lng = ?'); updateValues.push(updates.destinationLocation.lng); }
      if (updates.destinationLocation.address) { updateFields.push('destination_location_address = ?'); updateValues.push(updates.destinationLocation.address); }
    }
    if (updates.review) {
      updateFields.push('review_rating = ?', 'review_comment = ?');
      updateValues.push(updates.review.rating || null, updates.review.comment || null);
    }
    if (updates.montirId) {
      updateFields.push('montir_id = ?'); updateValues.push(updates.montirId);
    }
    if (updates.serviceType) {
      updateFields.push('service_type = ?'); updateValues.push(updates.serviceType);
    }
    if (updates.subType) {
      updateFields.push('sub_type = ?'); updateValues.push(updates.subType);
    }
    if (updates.description) {
      updateFields.push('description = ?'); updateValues.push(updates.description);
    }
    if (updates.scheduledAt) {
      updateFields.push('scheduled_at = ?'); updateValues.push(updates.scheduledAt);
    }
    if (updates.status) {
      updateFields.push('status = ?'); updateValues.push(updates.status);
    }
    if (updates.price) {
      updateFields.push('price = ?'); updateValues.push(updates.price);
    }
    if (updates.paymentStatus) {
      updateFields.push('payment_status = ?'); updateValues.push(updates.paymentStatus);
    }
    if (updates.additionalNotes) {
      updateFields.push('additional_notes = ?'); updateValues.push(updates.additionalNotes);
    }
    if (updates.mediaUrls) {
      updateFields.push('media_urls = ?'); updateValues.push(JSON.stringify(updates.mediaUrls));
    }

    if (updateFields.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const query = `UPDATE bookings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await pool.query(query, [...updateValues, id]);

    const [updatedRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ VEHICLES ------------------

// Get vehicles for logged in user
app.get('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add vehicle
app.post('/api/vehicles', authenticateToken, [
  body('make').isString().notEmpty(),
  body('model').isString().notEmpty(),
  body('plate').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { make, model, plate } = req.body;
    const id = uuidv4();
    const userId = req.user.id;

    await pool.query('INSERT INTO vehicles (id, user_id, make, model, plate, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, userId, make, model, plate]);

    res.status(201).json({ id, userId, make, model, plate });
  } catch (error) {
    console.error('Add vehicle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vehicle
app.put('/api/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, plate } = req.body;
    const userId = req.user.id;

    const [vehicleRows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (vehicleRows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

    const vehicle = vehicleRows[0];
    if (vehicle.user_id !== userId) return res.status(403).json({ error: 'Forbidden: You do not own this vehicle' });

    await pool.query('UPDATE vehicles SET make = ?, model = ?, plate = ?, updated_at = NOW() WHERE id = ?', [make || vehicle.make, model || vehicle.model, plate || vehicle.plate, id]);
    res.json({ id, userId, make: make || vehicle.make, model: model || vehicle.model, plate: plate || vehicle.plate });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vehicle
app.delete('/api/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [vehicleRows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (vehicleRows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

    const vehicle = vehicleRows[0];
    if (vehicle.user_id !== userId) return res.status(403).json({ error: 'Forbidden: You do not own this vehicle' });

    await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ PRODUCTS & PROMOS (Read-only endpoints) ------------------

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/promos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promos');
    res.json(rows);
  } catch (error) {
    console.error('Get promos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/promos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM promos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Promo not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get promo by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ CHAT & SOCKET.IO ------------------

// Create http server + socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] }
});

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('send_message', async ({ conversationId, senderId, text }) => {
    try {
      const messageId = uuidv4();
      await pool.query('INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES (?, ?, ?, ?, NOW())',
        [messageId, conversationId, senderId, text]);

      const [newMessage] = await pool.query('SELECT * FROM messages WHERE id = ?', [messageId]);
      io.to(conversationId).emit('receive_message', newMessage[0]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

// Conversations endpoints
app.post('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const { bookingId, customerId, montirId, workshopId } = req.body;
    const id = uuidv4();

    if (req.user.id !== customerId && req.user.id !== montirId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not authorized to create this conversation' });
    }

    const [existingConv] = await pool.query('SELECT id FROM conversations WHERE booking_id = ?', [bookingId]);
    if (existingConv.length > 0) {
      return res.status(200).json({ message: 'Conversation already exists', conversationId: existingConv[0].id });
    }

    await pool.query('INSERT INTO conversations (id, booking_id, customer_id, montir_id, workshop_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, bookingId, customerId, montirId, workshopId]);

    res.status(201).json({ id, bookingId, customerId, montirId, workshopId });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversations/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const [rows] = await pool.query('SELECT * FROM conversations WHERE booking_id = ?', [bookingId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Conversation not found' });

    const conversation = rows[0];
    if (req.user.id !== conversation.customer_id && req.user.id !== conversation.montir_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not authorized to view this conversation' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation by booking ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversations/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not authorized to view these conversations' });
    }

    const [rows] = await pool.query('SELECT * FROM conversations WHERE customer_id = ? OR montir_id = ?', [userId, userId]);
    res.json(rows);
  } catch (error) {
    console.error('Get conversations by user ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/messages/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const [convRows] = await pool.query('SELECT customer_id, montir_id FROM conversations WHERE id = ?', [conversationId]);
    if (convRows.length === 0) return res.status(404).json({ error: 'Conversation not found' });

    const conversation = convRows[0];
    if (req.user.id !== conversation.customer_id && req.user.id !== conversation.montir_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not authorized to view this conversation' });
    }

    const [rows] = await pool.query('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [conversationId]);
    res.json(rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/messages', authenticateToken, [
  body('conversationId').isString().notEmpty(),
  body('text').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { conversationId, text } = req.body;
    const senderId = req.user.id;
    const id = uuidv4();

    const [convRows] = await pool.query('SELECT customer_id, montir_id FROM conversations WHERE id = ?', [conversationId]);
    if (convRows.length === 0) return res.status(404).json({ error: 'Conversation not found' });

    const conversation = convRows[0];
    if (senderId !== conversation.customer_id && senderId !== conversation.montir_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not authorized to send message in this conversation' });
    }

    await pool.query('INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES (?, ?, ?, ?, NOW())', [id, conversationId, senderId, text]);
    const [newMessage] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);

    io.to(conversationId).emit('receive_message', newMessage[0]);

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
''