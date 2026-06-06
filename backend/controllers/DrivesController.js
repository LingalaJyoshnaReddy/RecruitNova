const db = require('../config/db');

const getAllDrives = (req, res) => {
  const query = `
    SELECT d.*, c.name as company_name 
    FROM drives d 
    LEFT JOIN companies c ON d.company_id = c.id 
    ORDER BY d.created_at DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const getDrive = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT d.*, c.name as company_name 
    FROM drives d 
    LEFT JOIN companies c ON d.company_id = c.id 
    WHERE d.id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Drive not found' });
    return res.status(200).json(results[0]);
  });
};

const addDrive = (req, res) => {
  const { title, company_id, description, location, drive_date, status, created_by } = req.body;
  if (!title || !company_id) return res.status(400).json({ message: 'Title and company are required' });
  const query = 'INSERT INTO drives (title, company_id, description, location, drive_date, status, created_by) VALUES (?,?,?,?,?,?,?)';
  db.query(query, [title, company_id, description, location, drive_date, status || 'active', created_by], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(201).json({ message: 'Drive created successfully', id: result.insertId });
  });
};

const updateDrive = (req, res) => {
  const { id } = req.params;
  const { title, company_id, description, location, drive_date, status } = req.body;
  const query = 'UPDATE drives SET title=?, company_id=?, description=?, location=?, drive_date=?, status=? WHERE id=?';
  db.query(query, [title, company_id, description, location, drive_date, status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Drive updated successfully' });
  });
};

const deleteDrive = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM drives WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Drive deleted successfully' });
  });
};

module.exports = { getAllDrives, getDrive, addDrive, updateDrive, deleteDrive };
