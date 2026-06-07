const db = require('../config/db');

const getAllResults = (req, res) => {
  const query = `
    SELECT r.*,
      u.full_name  as candidate_name,
      u.email      as candidate_email,
      j.title      as job_title,
      c.name       as company_name
    FROM results r
    JOIN users     u ON r.candidate_id   = u.id
    JOIN jobs      j ON r.job_id         = j.id
    JOIN companies c ON j.company_id     = c.id
    ORDER BY r.created_at DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const getMyResults = (req, res) => {
  const { candidate_id } = req.params;
  const query = `
    SELECT r.*,
      j.title  as job_title,
      c.name   as company_name
    FROM results r
    JOIN jobs      j ON r.job_id     = j.id
    JOIN companies c ON j.company_id = c.id
    WHERE r.candidate_id = ?
    ORDER BY r.created_at DESC`;
  db.query(query, [candidate_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const addResult = (req, res) => {
  const { application_id, candidate_id, job_id, status, offer_date, joining_date, notes } = req.body;
  if (!application_id || !candidate_id || !job_id) {
    return res.status(400).json({ message: 'Required fields missing' });
  }
  const query = `
    INSERT INTO results (application_id, candidate_id, job_id, status, offer_date, joining_date, notes)
    VALUES (?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      status=VALUES(status),
      offer_date=VALUES(offer_date),
      joining_date=VALUES(joining_date),
      notes=VALUES(notes)`;
  db.query(query,
    [application_id, candidate_id, job_id,
     status || 'selected',
     offer_date   || null,
     joining_date || null,
     notes        || null],
    (err, result) => {
      if (err) {
        console.error('addResult error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      // notify candidate
      db.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?,?,?,?)`,
        [candidate_id,
         'Result Announced',
         `Your application result has been updated to: ${status || 'selected'}`,
         'result'], () => {});
      return res.status(201).json({ message: 'Result saved successfully' });
    });
};

const updateResult = (req, res) => {
  const { id } = req.params;
  const { status, offer_date, joining_date, notes } = req.body;
  db.query(
    'UPDATE results SET status=?, offer_date=?, joining_date=?, notes=? WHERE id=?',
    [status, offer_date || null, joining_date || null, notes || null, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.status(200).json({ message: 'Result updated' });
    });
};

module.exports = { getAllResults, getMyResults, addResult, updateResult };