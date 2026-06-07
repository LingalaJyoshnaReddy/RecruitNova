const db = require('../config/db');

const getLogs = (req, res) => {
  const query = `
    SELECT al.*, u.full_name as user_name, u.role as user_role
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 100`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const addLog = (req, res) => {
  const { user_id, action, module, details, ip_address } = req.body;
  db.query(
    'INSERT INTO activity_logs (user_id, action, module, details, ip_address) VALUES (?,?,?,?,?)',
    [user_id || null, action, module || null, details || null, ip_address || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.status(201).json({ message: 'Log added', id: result.insertId });
    });
};

const clearLogs = (req, res) => {
  db.query('DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)', (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Old logs cleared' });
  });
};

module.exports = { getLogs, addLog, clearLogs };