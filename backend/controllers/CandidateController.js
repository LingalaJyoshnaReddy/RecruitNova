const db = require('../config/db');

// GET candidate profile by user_id
const getCandidateProfile = (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT c.*, 
      GROUP_CONCAT(DISTINCT cs.skill) as skills
    FROM candidates c
    LEFT JOIN candidate_skills cs ON cs.candidate_id = c.id
    WHERE c.user_id = ?
    GROUP BY c.id`;
  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Profile not found' });
    const profile = results[0];
    // get education
    db.query('SELECT * FROM education_details WHERE candidate_id = ?', [profile.id], (err2, edu) => {
      if (err2) return res.status(500).json({ message: 'Server error' });
      profile.education = edu;
      profile.skills    = profile.skills ? profile.skills.split(',') : [];
      return res.status(200).json(profile);
    });
  });
};

// CREATE or UPDATE candidate profile
const upsertCandidateProfile = (req, res) => {
  const { user_id } = req.params;
  const { dob, gender, address, linkedin, github, portfolio, summary, skills, education } = req.body;

  db.query('SELECT id FROM candidates WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    const saveProfile = (candidate_id) => {
      // update skills
      db.query('DELETE FROM candidate_skills WHERE candidate_id = ?', [candidate_id], (err2) => {
        if (err2) return res.status(500).json({ message: 'Server error' });
        if (skills && skills.length > 0) {
          const skillValues = skills.map(s => [candidate_id, s.trim()]);
          db.query('INSERT INTO candidate_skills (candidate_id, skill) VALUES ?', [skillValues], () => {});
        }
      });

      // update education
      if (education && education.length > 0) {
        db.query('DELETE FROM education_details WHERE candidate_id = ?', [candidate_id], () => {
          const eduValues = education.map(e => [
            candidate_id, e.degree, e.branch, e.institution, e.cgpa, e.start_year, e.end_year
          ]);
          db.query('INSERT INTO education_details (candidate_id, degree, branch, institution, cgpa, start_year, end_year) VALUES ?',
            [eduValues], () => {});
        });
      }

      return res.status(200).json({ message: 'Profile saved successfully', candidate_id });
    };

    if (results.length > 0) {
      const candidate_id = results[0].id;
      db.query('UPDATE candidates SET dob=?, gender=?, address=?, linkedin=?, github=?, portfolio=?, summary=? WHERE id=?',
        [dob, gender, address, linkedin, github, portfolio, summary, candidate_id], (err2) => {
          if (err2) return res.status(500).json({ message: 'Server error' });
          saveProfile(candidate_id);
        });
    } else {
      db.query('INSERT INTO candidates (user_id, dob, gender, address, linkedin, github, portfolio, summary) VALUES (?,?,?,?,?,?,?,?)',
        [user_id, dob, gender, address, linkedin, github, portfolio, summary], (err2, result) => {
          if (err2) return res.status(500).json({ message: 'Server error' });
          saveProfile(result.insertId);
        });
    }
  });
};

module.exports = { getCandidateProfile, upsertCandidateProfile };
