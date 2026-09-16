const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if user exists
    const [existingUser] = await global.db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const [existingUsername] = await global.db.query('SELECT id FROM users WHERE username = ?', [name]);
    if (existingUsername.length > 0) {
      return res.status(400).json({ message: 'That username is taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert into MySQL
    await global.db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Signup successful! Please log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const [users] = await global.db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Set Session
    // NOTE: key is "username" (matching the DB column and what the frontend
    // reads via user?.username) — it was previously "name", which meant
    // Dashboard.jsx's "Welcome back, {user?.username}" always rendered blank.
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    const authUser = { id: user.id, username: user.username, email: user.email };
    const token = jwt.sign(authUser, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: "Login successful",
      user: authUser,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Verify password — used to gate every destructive action in the Danger
// Zone (delete subjects/timetable/attendance, reset semester). Doesn't
// touch the session; just tells the caller whether the password matches.
router.post('/verify-password', verifyToken, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'password is required' });
  }

  try {
    const [users] = await global.db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, users[0].password_hash);
    res.json({ valid: isMatch });
  } catch (err) {
    console.error('Error verifying password:', err);
    res.status(500).json({ error: err.message });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
