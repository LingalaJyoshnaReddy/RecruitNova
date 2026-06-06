const db = require('../config/db');

const getAllRoles = (req, res) => {
  db.query('SELECT * FROM roles ORDER BY id ASC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const addRole = (req, res) => {
  const { role_name, description } = req.body;
  if (!role_name) return res.status(400).json({ message: 'Role name is required' });
  db.query('INSERT INTO roles (role_name, description) VALUES (?, ?)', [role_name, description], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Role already exists' });
      return res.status(500).json({ message: 'Server error' });
    }
    return res.status(201).json({ message: 'Role added successfully', id: result.insertId });
  });
};

const updateRole = (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  db.query('UPDATE roles SET description=? WHERE id=?', [description, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Role updated successfully' });
  });
};

const deleteRole = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM roles WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Role deleted successfully' });
  });
};

module.exports = { getAllRoles, addRole, updateRole, deleteRole };
