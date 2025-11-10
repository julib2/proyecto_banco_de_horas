const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../server');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, pin } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    const query = 'INSERT INTO users (username, email, password, pin) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, hashedPin], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error registering user' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'secret_key', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// Verify PIN
router.post('/verify-pin', (req, res) => {
  const { email, pin } = req.body;

  const query = 'SELECT pin FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = results[0];
    const isValidPin = await bcrypt.compare(pin, user.pin);

    if (!isValidPin) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    res.json({ message: 'PIN verified successfully' });
  });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.id;
    next();
  });
};

// Protected route example
router.get('/profile', verifyToken, (req, res) => {
  const query = 'SELECT id, username, email FROM users WHERE id = ?';
  db.query(query, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    res.json({ user: results[0] });
  });
});

module.exports = router;
