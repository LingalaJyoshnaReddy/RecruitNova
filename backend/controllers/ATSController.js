const db       = require('../config/db');
const pdfParse = require('pdf-parse');
const fs       = require('fs');
const path     = require('path');

const processATS = async (req, res) => {
  const { application_id } = req.params;

  try {
    // get application details — no join with candidates table
    const [apps] = await db.promise().query(`
      SELECT a.*, 
        j.title as job_title,
        u.id as candidate_user_id
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      WHERE a.id = ?`, [application_id]);

    if (apps.length === 0) return res.status(404).json({ message: 'Application not found' });
    const app = apps[0];

    // get job skills
    const [jobSkills] = await db.promise().query(
      'SELECT skill FROM job_skills WHERE job_id = ?', [app.job_id]);

    // get candidate profile (may not exist)
    const [candidateRows] = await db.promise().query(
      'SELECT id FROM candidates WHERE user_id = ?', [app.candidate_user_id]);

    let candidateSkills = [];
    let education       = [];
    let rawText         = '';
    let resumeId        = null;

    if (candidateRows.length > 0) {
      const candidate_id = candidateRows[0].id;

      // get skills
      const [skills] = await db.promise().query(
        'SELECT skill FROM candidate_skills WHERE candidate_id = ?', [candidate_id]);
      candidateSkills = skills.map(s => s.skill.toLowerCase());

      // get education
      const [edu] = await db.promise().query(
        'SELECT * FROM education_details WHERE candidate_id = ?', [candidate_id]);
      education = edu;

      // get active resume
      const [resumes] = await db.promise().query(
        'SELECT * FROM resumes WHERE candidate_id = ? AND is_active = 1 ORDER BY uploaded_at DESC LIMIT 1',
        [candidate_id]);

      if (resumes.length > 0) {
        resumeId = resumes[0].id;
        const filepath = path.join(__dirname, '../uploads/', resumes[0].filepath);
        if (fs.existsSync(filepath)) {
          try {
            const dataBuffer = fs.readFileSync(filepath);
            const pdfData    = await pdfParse(dataBuffer);
            rawText          = pdfData.text;
          } catch (e) { rawText = ''; }
        }
      }
    }

    // SKILL MATCHING (50%)
    const requiredSkills = jobSkills.map(s => s.skill.toLowerCase());
    const textLower      = rawText.toLowerCase();

    let matchedCount  = 0;
    const skillMatchRows = [];

    for (const skill of requiredSkills) {
      const matched = candidateSkills.includes(skill) || textLower.includes(skill);
      if (matched) matchedCount++;
      skillMatchRows.push([application_id, skill, matched ? 1 : 0]);
    }

    const skillScore = requiredSkills.length > 0
      ? (matchedCount / requiredSkills.length) * 100 : 50;

    // EXPERIENCE MATCHING (30%)
    const expKeywords  = ['year', 'years', 'experience', 'worked', 'internship', 'project'];
    const hasExp       = expKeywords.some(k => textLower.includes(k));
    const experienceScore = hasExp ? 80 : 50;

    // EDUCATION MATCHING (20%)
    let educationScore = 60;
    if (education.length > 0 && education[0].cgpa) {
      const cgpa = parseFloat(education[0].cgpa);
      if (cgpa >= 8.0)      educationScore = 100;
      else if (cgpa >= 7.0) educationScore = 80;
      else if (cgpa >= 6.0) educationScore = 60;
      else                   educationScore = 40;
    }

    // TOTAL ATS SCORE
    const totalScore = Math.round(
      (skillScore * 0.5) + (experienceScore * 0.3) + (educationScore * 0.2)
    );

    // AUTO SHORTLISTING DECISION
    let decision;
    if (totalScore >= 80)      decision = 'shortlisted';
    else if (totalScore >= 60) decision = 'hold';
    else                       decision = 'rejected';

    // save ats_resumes if resume exists
    if (resumeId) {
      await db.promise().query(`
        INSERT INTO ats_resumes
          (application_id, resume_id, parsed_skills, parsed_experience, raw_text)
        VALUES (?,?,?,?,?)
        ON DUPLICATE KEY UPDATE
          parsed_skills=VALUES(parsed_skills),
          raw_text=VALUES(raw_text)`,
        [application_id, resumeId,
         candidateSkills.join(','), hasExp ? 1 : 0,
         rawText.substring(0, 5000)]);
    }

    // save skill matches
    if (skillMatchRows.length > 0) {
      await db.promise().query(
        'DELETE FROM ats_skill_match WHERE application_id = ?', [application_id]);
      await db.promise().query(
        'INSERT INTO ats_skill_match (application_id, required_skill, matched) VALUES ?',
        [skillMatchRows]);
    }

    // save ats_results
    await db.promise().query(`
      INSERT INTO ats_results
        (application_id, skill_score, experience_score, education_score, total_score, decision)
      VALUES (?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        skill_score=VALUES(skill_score),
        experience_score=VALUES(experience_score),
        education_score=VALUES(education_score),
        total_score=VALUES(total_score),
        decision=VALUES(decision)`,
      [application_id, skillScore, experienceScore,
       educationScore, totalScore, decision]);

    // update application ats_score and status
    const newStatus = decision === 'shortlisted' ? 'shortlisted' :
                      decision === 'rejected'    ? 'rejected'    : 'under_review';
    await db.promise().query(
      'UPDATE applications SET ats_score=?, status=? WHERE id=?',
      [totalScore, newStatus, application_id]);

    // send notification to candidate
    await db.promise().query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)',
      [app.candidate_user_id,
       'ATS Score Updated',
       `Your application for ${app.job_title} has been processed. Score: ${totalScore}%. Decision: ${decision}`,
       'application']);

    return res.status(200).json({
      message: 'ATS processed successfully',
      totalScore, skillScore, experienceScore,
      educationScore, decision,
      matchedSkills: matchedCount,
      totalSkills:   requiredSkills.length
    });

  } catch (e) {
    console.error('ATS Error:', e);
    return res.status(500).json({ message: 'ATS processing failed', error: e.message });
  }
};

// Get ATS results for an application
const getATSResult = (req, res) => {
  const { application_id } = req.params;
  const query = `
    SELECT ar.*,
      GROUP_CONCAT(CASE WHEN sm.matched=1 THEN sm.required_skill END) as matched_skills,
      GROUP_CONCAT(CASE WHEN sm.matched=0 THEN sm.required_skill END) as missing_skills
    FROM ats_results ar
    LEFT JOIN ats_skill_match sm ON sm.application_id = ar.application_id
    WHERE ar.application_id = ?
    GROUP BY ar.id`;
  db.query(query, [application_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'ATS result not found' });
    return res.status(200).json(results[0]);
  });
};

// Get all ATS results
const getAllATSResults = (req, res) => {
  const query = `
    SELECT ar.*,
      u.full_name as candidate_name,
      j.title     as job_title,
      c.name      as company_name
    FROM ats_results ar
    JOIN applications a ON ar.application_id = a.id
    JOIN users      u  ON a.candidate_id     = u.id
    JOIN jobs       j  ON a.job_id           = j.id
    JOIN companies  c  ON j.company_id       = c.id
    ORDER BY ar.total_score DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    return res.status(200).json(results);
  });
};

module.exports = { processATS, getATSResult, getAllATSResults };