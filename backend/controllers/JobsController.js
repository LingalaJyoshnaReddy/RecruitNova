const db = require('../config/db');

const getAllJobs = (req, res) => {
  const query = `
    SELECT j.*, c.name as company_name, d.title as drive_title
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    LEFT JOIN drives d    ON j.drive_id   = d.id
    ORDER BY j.created_at DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const getJob = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT j.*, c.name as company_name, d.title as drive_title
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    LEFT JOIN drives d    ON j.drive_id   = d.id
    WHERE j.id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Job not found' });
    return res.status(200).json(results[0]);
  });
};

const addJob = (req, res) => {
  const { title, company_id, drive_id, description, requirements, location, salary_range, job_type, status, created_by } = req.body;
  if (!title || !company_id) return res.status(400).json({ message: 'Title and company are required' });
  const query = 'INSERT INTO jobs (title, company_id, drive_id, description, requirements, location, salary_range, job_type, status, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)';
  db.query(query, [title, company_id, drive_id || null, description, requirements, location, salary_range, job_type || 'full_time', status || 'open', created_by], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(201).json({ message: 'Job posted successfully', id: result.insertId });
  });
};

const updateJob = (req, res) => {
  const { id } = req.params;
  const { title, company_id, drive_id, description, requirements, location, salary_range, job_type, status } = req.body;
  const query = 'UPDATE jobs SET title=?, company_id=?, drive_id=?, description=?, requirements=?, location=?, salary_range=?, job_type=?, status=? WHERE id=?';
  db.query(query, [title, company_id, drive_id || null, description, requirements, location, salary_range, job_type, status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Job updated successfully' });
  });
};

const deleteJob = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM jobs WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Job deleted successfully' });
  });
};

module.exports = { getAllJobs, getJob, addJob, updateJob, deleteJob };
