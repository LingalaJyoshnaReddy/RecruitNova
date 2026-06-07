const db     = require('../config/db');
const path   = require('path');
const fs     = require('fs');

// Upload resume
const uploadResume = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const { user_id } = req.body;

  db.query('SELECT id FROM candidates WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Please complete your profile first' });

    const candidate_id = results[0].id;

    // set all previous resumes as inactive
    db.query('UPDATE resumes SET is_active = 0 WHERE candidate_id = ?', [candidate_id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Server error' });

      const filename = req.file.filename;
      const filepath = `resumes/${filename}`;

      db.query('INSERT INTO resumes (candidate_id, filename, filepath, is_active) VALUES (?,?,?,1)',
        [candidate_id, req.file.originalname, filepath], (err3, result) => {
          if (err3) return res.status(500).json({ message: 'Server error' });
          return res.status(201).json({
            message: 'Resume uploaded successfully',
            resume_id: result.insertId,
            filename: req.file.originalname,
            filepath
          });
        });
    });
  });
};

// Get resumes by user_id
const getResumes = (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT r.* FROM resumes r
    JOIN candidates c ON r.candidate_id = c.id
    WHERE c.user_id = ?
    ORDER BY r.uploaded_at DESC`;
  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

// Delete resume
const deleteResume = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM resumes WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Resume not found' });

    const filepath = path.join(__dirname, '../uploads/', results[0].filepath);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    db.query('DELETE FROM resumes WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Server error' });
      return res.status(200).json({ message: 'Resume deleted' });
    });
  });
};

module.exports = { uploadResume, getResumes, deleteResume };
