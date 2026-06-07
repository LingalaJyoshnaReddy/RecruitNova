const express          = require('express');
const router           = express.Router();
const multer           = require('multer');
const path             = require('path');
const ResumeController = require('../controllers/ResumeController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/resumes/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files allowed'));
  }
});

router.get('/:user_id',  ResumeController.getResumes);
router.post('/upload',   upload.single('resume'), ResumeController.uploadResume);
router.delete('/:id',    ResumeController.deleteResume);

module.exports = router;
