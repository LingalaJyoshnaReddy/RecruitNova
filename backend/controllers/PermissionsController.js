const db = require('../config/db');

const getAllPermissions = (req, res) => {
  db.query('SELECT * FROM permissions ORDER BY role_name, module', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

const upsertPermission = (req, res) => {
  const { role_name, module, can_view, can_create, can_edit, can_delete } = req.body;
  if (!role_name || !module) return res.status(400).json({ message: 'role_name and module are required' });

  const checkQuery = 'SELECT id FROM permissions WHERE role_name=? AND module=?';
  db.query(checkQuery, [role_name, module], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length > 0) {
      const updateQuery = 'UPDATE permissions SET can_view=?, can_create=?, can_edit=?, can_delete=? WHERE role_name=? AND module=?';
      db.query(updateQuery, [can_view, can_create, can_edit, can_delete, role_name, module], (err2) => {
        if (err2) return res.status(500).json({ message: 'Server error' });
        return res.status(200).json({ message: 'Permission updated' });
      });
    } else {
      const insertQuery = 'INSERT INTO permissions (role_name, module, can_view, can_create, can_edit, can_delete) VALUES (?,?,?,?,?,?)';
      db.query(insertQuery, [role_name, module, can_view, can_create, can_edit, can_delete], (err2) => {
        if (err2) return res.status(500).json({ message: 'Server error' });
        return res.status(201).json({ message: 'Permission created' });
      });
    }
  });
};

const deletePermission = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM permissions WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json({ message: 'Permission deleted' });
  });
};

module.exports = { getAllPermissions, upsertPermission, deletePermission };
