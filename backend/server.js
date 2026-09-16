require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const { verifyToken } = require('./middleware/auth');


const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
}).promise();

global.db = db;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());

// /api/auth is the one router that must stay open — you don't have a
// session yet when you're trying to log in or sign up.
app.use('/api/auth', authRoutes);

// Everything else requires a valid session first.
app.use('/api/subjects', verifyToken, subjectRoutes);
app.use('/api/timetable', verifyToken, timetableRoutes);
app.use('/api/attendance', verifyToken, attendanceRoutes);
app.use('/api/analytics', verifyToken, analyticsRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/semester', verifyToken, semesterRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
async function startServer() {
  try {
    await db.query('SELECT 1');
    console.log('Connected to MySQL');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

startServer();
