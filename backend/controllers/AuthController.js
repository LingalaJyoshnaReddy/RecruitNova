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
// FORGOT PASSWORD
const forgotPassword = (req, res) => {
  const { email } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Email not found' });

    const user  = results[0];
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'recruitnova_secret',
      { expiresIn: '1h' }
    );
    const expiry = Date.now() + 3600000;

    db.query('UPDATE users SET reset_token=?, reset_token_expiry=? WHERE id=?',
      [token, expiry, user.id], (err2) => {
        if (err2) return res.status(500).json({ message: 'Server error' });

        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const resetLink = `http://localhost:3000/reset-password/${token}`;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to:   user.email,
          subject: 'RecruitNova — Password Reset',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0a0a0f;color:#f9fafb;border-radius:12px;">
              <h2 style="color:#6366f1;">RecruitNova</h2>
              <p>Hi ${user.full_name},</p>
              <p>Click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${resetLink}" style="display:inline-block;margin:24px 0;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
              <p style="color:#6b7280;font-size:12px;">If you didn't request this, ignore this email.</p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (err3) => {
          if (err3) {
            console.error('Email error:', err3);
            return res.status(500).json({ message: 'Failed to send email' });
          }
          return res.status(200).json({ message: 'Password reset link sent to your email!' });
        });
      }
    );
  });
};

// RESET PASSWORD
// RESET PASSWORD
const resetPassword = (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recruitnova_secret');
    db.query('SELECT * FROM users WHERE id=? AND reset_token=?',
      [decoded.id, token], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired token' });

        const user = results[0];
        if (Date.now() > user.reset_token_expiry) {
          return res.status(400).json({ message: 'Reset link has expired' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        db.query('UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?',
          [hashedPassword, decoded.id], (err2) => {
            if (err2) return res.status(500).json({ message: 'Server error' });
            return res.status(200).json({ message: 'Password reset successful!' });
          }
        );
      }
    );
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
  const { id }                    = req.params;
  const { full_name, email, phone } = req.body;
  const query = 'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?';
  db.query(query, [full_name, email, phone, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Profile updated successfully!' });
  });
};

// GET ALL USERS
const getAllUsers = (req, res) => {
  const query = 'SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

// UPDATE USER ROLE
const updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const validRoles = ['super_admin', 'hr_admin', 'recruiter', 'candidate'];
  if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  db.query('UPDATE users SET role = ? WHERE id = ?', [role, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'User role updated successfully' });
  });
};

// DELETE USER
const deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'User deleted successfully' });
  });
};

module.exports = { register, login, forgotPassword, resetPassword, changePassword, updateProfile, getAllUsers, updateUserRole, deleteUser };

