const mysql = require("mysql2/promise");

// Pool koneksi MySQL
const pool = mysql.createPool({
  host: "localhost",       // ganti sesuai host database
  user: "root",            // user database
  password: "",            // password database
  database: "montirku_db", // nama database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
