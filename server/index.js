const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = "your-secret-key";

// Middleware JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ================== SIGNUP ==================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Validasi role
    const allowedRoles = ["user", "montir"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Cek email duplikat
    const [rows] = await pool.query(
      "SELECT * FROM user_accounts WHERE email = ?",
      [email]
    );
    if (rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const id = uuidv4();
    await pool.query(
      "INSERT INTO user_accounts (id, fullName, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [id, fullName, email, phone, hashedPassword, role]
    );

    // Ambil data user baru
    const [newUser] = await pool.query(
      "SELECT id, fullName, email, phone, role, created_at FROM user_accounts WHERE email = ?",
      [email]
    );

    const user = newUser[0];

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================== LOGIN ==================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM user_accounts WHERE email = ?",
      [email]
    );
    if (rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );

    delete user.password; // jangan kirim password ke client
    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================== GET CURRENT USER ==================
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, fullName, email, phone, role, created_at FROM user_accounts WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
