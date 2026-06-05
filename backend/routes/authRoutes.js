const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
require('dotenv').config();

// REGISTER
const register = (req, res) => {
  const { full_name, email, phone, password } = req.body;
  if (!full_name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length > 0) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = bcrypt.hashSync(password, 10);
    const insertQuery = 'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [full_name, email, phone, hashedPassword, 'candidate'], (err) => {
      if (err) return res.status(500).json({ message: 'Registration failed' });
      return res.status(201).json({ message: 'Registration successful! Please login.' });
    });
  });
};

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });
    const user    = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'recruitnova_secret',
      { expiresIn: '1d' }
    );
    return res.status(200).json({
      message: 'Login successful', token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
    });
  });
};

// FORGOT PASSWORD
const forgotPassword = (req, res) => {
  const { email } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Email not found' });
    return res.status(200).json({ message: 'Password reset link sent to your email!' });
  });
};

// RESET PASSWORD
const resetPassword = (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recruitnova_secret');
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(query, [hashedPassword, decoded.id], (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.status(200).json({ message: 'Password reset successful!' });
    });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// CHANGE PASSWORD
const changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    const user    = results[0];
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateQuery, [hashedPassword, userId], (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.status(200).json({ message: 'Password changed successfully!' });
    });
  });
};

// UPDATE PROFILE
const updateProfile = (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone } = req.body;
  const query = 'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?';
  db.query(query, [full_name, email, phone, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Profile updated successfully!' });
  });
};

module.exports = { register, login, forgotPassword, resetPassword, changePassword, updateProfile };
