const express           = require('express');
const router            = express.Router();
const multer            = require('multer');
const path              = require('path');
const CompanyController = require('../controllers/CompanyController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/',           CompanyController.getAllCompanies);
router.get('/:id',        CompanyController.getCompany);
router.post('/',          CompanyController.addCompany);
router.put('/:id',        upload.single('logo'), CompanyController.updateCompany);
router.delete('/:id',     CompanyController.deleteCompany);
router.put('/:id/verify', CompanyController.verifyCompany);

module.exports = router;
