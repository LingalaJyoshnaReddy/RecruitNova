const db = require('../config/db');

const getDashboardStats = (req, res) => {
  const queries = {
    companies:   'SELECT COUNT(*) as count FROM companies',
    users:       'SELECT COUNT(*) as count FROM users',
    drives:      'SELECT COUNT(*) as count FROM drives',
    jobs:        'SELECT COUNT(*) as count FROM jobs',
    applications:'SELECT COUNT(*) as count FROM applications',
    interviews:  'SELECT COUNT(*) as count FROM interviews',
    selected:    'SELECT COUNT(*) as count FROM results WHERE status="selected"',
    shortlisted: 'SELECT COUNT(*) as count FROM applications WHERE status="shortlisted"'
  };

  const results = {};
  const keys    = Object.keys(queries);
  let done      = 0;

  keys.forEach(key => {
    db.query(queries[key], (err, rows) => {
      results[key] = err ? 0 : rows[0].count;
      done++;
      if (done === keys.length) {
        return res.status(200).json(results);
      }
    });
  });
};

const getApplicationsByJob = (req, res) => {
  const query = `
    SELECT j.title as job, COUNT(a.id) as count
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    GROUP BY j.id, j.title
    ORDER BY count DESC LIMIT 10`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const getApplicationsByCompany = (req, res) => {
  const query = `
    SELECT c.name as company, COUNT(a.id) as count
    FROM applications a
    JOIN jobs      j ON a.job_id     = j.id
    JOIN companies c ON j.company_id = c.id
    GROUP BY c.id, c.name
    ORDER BY count DESC LIMIT 10`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const getATSScoreDistribution = (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN total_score >= 80 THEN 1 ELSE 0 END) as shortlisted,
      SUM(CASE WHEN total_score >= 60 AND total_score < 80 THEN 1 ELSE 0 END) as hold,
      SUM(CASE WHEN total_score < 60 THEN 1 ELSE 0 END) as rejected
    FROM ats_results`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results[0]);
  });
};

const getHiringFunnel = (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM applications) as applied,
      (SELECT COUNT(*) FROM applications WHERE status='shortlisted') as shortlisted,
      (SELECT COUNT(*) FROM interviews WHERE status='scheduled' OR status='completed') as interviewed,
      (SELECT COUNT(*) FROM results WHERE status='selected') as selected,
      (SELECT COUNT(*) FROM results WHERE status='offer_released') as offered,
      (SELECT COUNT(*) FROM results WHERE status='joined') as joined`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results[0]);
  });
};

const getMonthlyApplications = (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(applied_at, '%b %Y') as month,
      COUNT(*) as count
    FROM applications
    GROUP BY DATE_FORMAT(applied_at, '%Y-%m')
    ORDER BY MIN(applied_at) DESC
    LIMIT 6`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results.reverse());
  });
};

module.exports = {
  getDashboardStats, getApplicationsByJob, getApplicationsByCompany,
  getATSScoreDistribution, getHiringFunnel, getMonthlyApplications
};