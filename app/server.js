const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

client.collectDefaultMetrics();
const httpRequestsTotal = new client.Counter({
  name: 'hotel_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'hotel_user',
  password: process.env.DB_PASSWORD || 'StrongSecretPass123!',
  database: process.env.DB_NAME || 'hotel_db'
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(10) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        room_id INT REFERENCES rooms(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const count = await pool.query('SELECT COUNT(*) FROM rooms');
    if (parseInt(count.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO rooms (room_number, type, price, is_available) VALUES 
        ('101', 'Deluxe Single', 500000, true),
        ('102', 'Deluxe Double', 800000, true),
        ('201', 'VIP Suite', 1500000, true);
      `);
    }
  } catch (err) {
    console.error('Lỗi DB:', err.message);
  }
}
initDb();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/api/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/book', async (req, res) => {
  const { customer_name, customer_phone, room_id } = req.body;
  if (!customer_name || !customer_phone || !room_id) {
    return res.status(400).json({ error: 'Thieu thong tin' });
  }
  try {
    await pool.query('BEGIN');
    await pool.query('INSERT INTO bookings (customer_name, customer_phone, room_id) VALUES ($1, $2, $3)', [customer_name, customer_phone, room_id]);
    await pool.query('UPDATE rooms SET is_available = false WHERE id = $1', [room_id]);
    await pool.query('COMMIT');
    res.json({ message: 'Dat phong thanh cong!' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server chạy tại port ${port}`));
