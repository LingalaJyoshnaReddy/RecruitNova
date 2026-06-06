const db = require('../config/db');

const getAllApplications = (req, res) => {
  const query = `
    SELECT a.*, 
      u.full_name as candidate_name, u.email as candidate_email,
      j.title as job_title, c.name as company_name
    FROM applications a
    LEFT JOIN users     u ON a.candidate_id = u.id
    LEFT JOIN jobs      j ON a.job_id       = j.id
    LEFT JOIN companies c ON j.company_id   = c.id
    ORDER BY a.applied_at DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const getMyApplications = (req, res) => {
  const { candidate_id } = req.params;
  const query = `
    SELECT a.*, 
      j.title as job_title, j.location as job_location, j.salary_range,
      c.name as company_name
    FROM applications a
    LEFT JOIN jobs      j ON a.job_id     = j.id
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE a.candidate_id = ?
    ORDER BY a.applied_at DESC`;
  db.query(query, [candidate_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const applyJob = (req, res) => {
  const { job_id, candidate_id, resume_url } = req.body;
  if (!job_id || !candidate_id) return res.status(400).json({ message: 'Job and candidate are required' });

  db.query('SELECT id FROM applications WHERE job_id=? AND candidate_id=?', [job_id, candidate_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length > 0) return res.status(400).json({ message: 'Already applied to this job' });

    const ats_score = Math.floor(Math.random() * 41) + 60;
    const query = 'INSERT INTO applications (job_id, candidate_id, resume_url, ats_score) VALUES (?,?,?,?)';
    db.query(query, [job_id, candidate_id, resume_url || null, ats_score], (err2, result) => {
      if (err2) return res.status(500).json({ message: 'Server error' });
      return res.status(201).json({ message: 'Application submitted successfully', id: result.insertId, ats_score });
    });
  });
};

const updateApplicationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE applications SET status=? WHERE id=?', [status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Application status updated' });
  });
};

const deleteApplication = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM applications WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Application deleted' });
  });
};

module.exports = { getAllApplications, getMyApplications, applyJob, updateApplicationStatus, deleteApplication };
