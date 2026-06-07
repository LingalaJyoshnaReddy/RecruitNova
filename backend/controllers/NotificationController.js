const db = require('../config/db');

const getNotifications = (req, res) => {
  const { user_id } = req.params;
  db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [user_id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.status(200).json(results);
    });
};

const markAsRead = (req, res) => {
  const { user_id } = req.params;
  db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user_id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Marked as read' });
  });
};

const getUnreadCount = (req, res) => {
  const { user_id } = req.params;
  db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [user_id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.status(200).json({ count: results[0].count });
    });
};

const createNotification = (req, res) => {
  const { user_id, title, message, type } = req.body;
  db.query(
    'INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)',
    [user_id, title, message, type || 'system'], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.status(201).json({ message: 'Notification created', id: result.insertId });
    });
};

module.exports = { getNotifications, markAsRead, getUnreadCount, createNotification };
