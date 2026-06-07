const db = require('../config/db');

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
    if (err) {
      console.error('getCandidateProfile error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) return res.status(404).json({ message: 'Profile not found' });
    const profile = results[0];
    db.query('SELECT * FROM education_details WHERE candidate_id = ?', [profile.id], (err2, edu) => {
      if (err2) return res.status(500).json({ message: 'Server error' });
      profile.education = edu;
      profile.skills    = profile.skills ? profile.skills.split(',') : [];
      if (profile.dob) {
  const d = new Date(profile.dob);
  profile.dob = d.toISOString().substring(0, 10);
}
      return res.status(200).json(profile);
    });
  });
};

const upsertCandidateProfile = (req, res) => {
  const { user_id } = req.params;
  const { dob, gender, address, linkedin, github, portfolio, summary, skills, education } = req.body;

  // Fix date format — MySQL needs YYYY-MM-DD not ISO string
  const cleanDob = dob ? dob.toString().substring(0, 10) : null;

  console.log('Saving profile user_id:', user_id, 'dob:', cleanDob, 'skills:', skills);

  db.query('SELECT id FROM candidates WHERE user_id = ?', [user_id], (err, results) => {
    if (err) {
      console.error('SELECT error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length > 0) {
      const candidate_id = results[0].id;
      db.query(
        'UPDATE candidates SET dob=?, gender=?, address=?, linkedin=?, github=?, portfolio=?, summary=? WHERE id=?',
        [cleanDob, gender || null, address || null, linkedin || null,
         github || null, portfolio || null, summary || null, candidate_id],
        (err2) => {
          if (err2) {
            console.error('UPDATE error:', err2);
            return res.status(500).json({ message: 'Server error updating profile' });
          }
          saveSkillsAndEducation(candidate_id, skills, education, res);
        }
      );
    } else {
      db.query(
        'INSERT INTO candidates (user_id, dob, gender, address, linkedin, github, portfolio, summary) VALUES (?,?,?,?,?,?,?,?)',
        [user_id, cleanDob, gender || null, address || null,
         linkedin || null, github || null, portfolio || null, summary || null],
        (err2, result) => {
          if (err2) {
            console.error('INSERT error:', err2);
            return res.status(500).json({ message: 'Server error creating profile' });
          }
          saveSkillsAndEducation(result.insertId, skills, education, res);
        }
      );
    }
  });
};

const saveSkillsAndEducation = (candidate_id, skills, education, res) => {
  db.query('DELETE FROM candidate_skills WHERE candidate_id = ?', [candidate_id], (err) => {
    if (err) {
      console.error('DELETE skills error:', err);
      return res.status(500).json({ message: 'Server error deleting skills' });
    }

    const insertSkills = () => {
      if (skills && skills.length > 0) {
        const skillValues = skills
          .map(s => s.trim())
          .filter(s => s !== '')
          .map(s => [candidate_id, s]);

        if (skillValues.length > 0) {
          db.query(
            'INSERT INTO candidate_skills (candidate_id, skill) VALUES ?',
            [skillValues],
            (err2) => {
              if (err2) {
                console.error('INSERT skills error:', err2);
                return res.status(500).json({ message: 'Server error inserting skills' });
              }
              saveEducation(candidate_id, education, res);
            }
          );
        } else {
          saveEducation(candidate_id, education, res);
        }
      } else {
        saveEducation(candidate_id, education, res);
      }
    };

    insertSkills();
  });
};

const saveEducation = (candidate_id, education, res) => {
  db.query('DELETE FROM education_details WHERE candidate_id = ?', [candidate_id], (err) => {
    if (err) {
      console.error('DELETE education error:', err);
      return res.status(500).json({ message: 'Server error deleting education' });
    }

    if (education && education.length > 0) {
      const validEdu = education.filter(e => e.degree || e.institution || e.branch);

      if (validEdu.length > 0) {
        const eduValues = validEdu.map(e => [
          candidate_id,
          e.degree      || null,
          e.branch      || null,
          e.institution || null,
          e.cgpa        ? parseFloat(e.cgpa) : null,
          e.start_year  ? parseInt(e.start_year) : null,
          e.end_year    ? parseInt(e.end_year)   : null
        ]);

        db.query(
          'INSERT INTO education_details (candidate_id, degree, branch, institution, cgpa, start_year, end_year) VALUES ?',
          [eduValues],
          (err2) => {
            if (err2) {
              console.error('INSERT education error:', err2);
              return res.status(500).json({ message: 'Server error inserting education' });
            }
            console.log('Profile saved successfully!');
            return res.status(200).json({ message: 'Profile saved successfully', candidate_id });
          }
        );
      } else {
        return res.status(200).json({ message: 'Profile saved successfully', candidate_id });
      }
    } else {
      return res.status(200).json({ message: 'Profile saved successfully', candidate_id });
    }
  });
};

module.exports = { getCandidateProfile, upsertCandidateProfile };