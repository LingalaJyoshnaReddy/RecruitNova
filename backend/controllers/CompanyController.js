const db = require('../config/db');

// GET ALL COMPANIES
const getAllCompanies = (req, res) => {
  const query = 'SELECT * FROM companies ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

// GET SINGLE COMPANY
const getCompany = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM companies WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Company not found' });
    return res.status(200).json(results[0]);
  });
};

// ADD COMPANY
const addCompany = (req, res) => {
  const { name, email, phone, website, industry, location, description } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  const query = 'INSERT INTO companies (name, email, phone, website, industry, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [name, email, phone, website, industry, location, description], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Company email already exists' });
      return res.status(500).json({ message: 'Server error' });
    }
    return res.status(201).json({ message: 'Company added successfully', id: result.insertId });
  });
};

// UPDATE COMPANY
const updateCompany = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, website, industry, location, description, status } = req.body;
  const logo = req.file ? req.file.filename : null;

  let query, params;
  if (logo) {
    query  = 'UPDATE companies SET name=?, email=?, phone=?, website=?, industry=?, location=?, description=?, status=?, logo=? WHERE id=?';
    params = [name, email, phone, website, industry, location, description, status, logo, id];
  } else {
    query  = 'UPDATE companies SET name=?, email=?, phone=?, website=?, industry=?, location=?, description=?, status=? WHERE id=?';
    params = [name, email, phone, website, industry, location, description, status, id];
  }

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Company updated successfully' });
  });
};

// DELETE COMPANY
const deleteCompany = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM companies WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Company deleted successfully' });
  });
};

// VERIFY COMPANY
const verifyCompany = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const query = 'UPDATE companies SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: `Company ${status} successfully` });
  });
};

module.exports = { getAllCompanies, getCompany, addCompany, updateCompany, deleteCompany, verifyCompany };
