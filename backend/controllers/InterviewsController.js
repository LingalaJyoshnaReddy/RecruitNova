const db = require('../config/db');

const getAllInterviews = (req, res) => {
  const query = `
    SELECT i.*,
      u.full_name  as candidate_name, u.email as candidate_email,
      j.title      as job_title,
      c.name       as company_name,
      iv.full_name as interviewer_name
    FROM interviews i
    LEFT JOIN users     u  ON i.candidate_id   = u.id
    LEFT JOIN jobs      j  ON i.job_id         = j.id
    LEFT JOIN companies c  ON j.company_id     = c.id
    LEFT JOIN users     iv ON i.interviewer_id = iv.id
    ORDER BY i.scheduled_at DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const getMyInterviews = (req, res) => {
  const { candidate_id } = req.params;
  const query = `
    SELECT i.*,
      j.title  as job_title,
      c.name   as company_name,
      iv.full_name as interviewer_name
    FROM interviews i
    LEFT JOIN jobs      j  ON i.job_id         = j.id
    LEFT JOIN companies c  ON j.company_id     = c.id
    LEFT JOIN users     iv ON i.interviewer_id = iv.id
    WHERE i.candidate_id = ?
    ORDER BY i.scheduled_at DESC`;
  db.query(query, [candidate_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const scheduleInterview = (req, res) => {
  const { application_id, job_id, candidate_id, interviewer_id, scheduled_at, mode, notes } = req.body;
  if (!application_id || !job_id || !candidate_id || !scheduled_at) {
    return res.status(400).json({ message: 'Required fields missing' });
  }
  const query = 'INSERT INTO interviews (application_id, job_id, candidate_id, interviewer_id, scheduled_at, mode, notes) VALUES (?,?,?,?,?,?,?)';
  db.query(query, [application_id, job_id, candidate_id, interviewer_id || null, scheduled_at, mode || 'online', notes || null], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(201).json({ message: 'Interview scheduled successfully', id: result.insertId });
  });
};

const updateInterview = (req, res) => {
  const { id } = req.params;
  const { scheduled_at, mode, status, notes } = req.body;
  db.query('UPDATE interviews SET scheduled_at=?, mode=?, status=?, notes=? WHERE id=?',
    [scheduled_at, mode, status, notes, id], (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.status(200).json({ message: 'Interview updated successfully' });
    });
};

const deleteInterview = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM interviews WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Interview deleted' });
  });
};

module.exports = { getAllInterviews, getMyInterviews, scheduleInterview, updateInterview, deleteInterview };
