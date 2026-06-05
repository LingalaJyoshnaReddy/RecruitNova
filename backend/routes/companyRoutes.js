const express           = require('express');
const router            = express.Router();
const CompanyController = require('../controllers/CompanyController');

router.get('/',              CompanyController.getAllCompanies);
router.get('/:id',           CompanyController.getCompany);
router.post('/',             CompanyController.addCompany);
router.put('/:id',           CompanyController.updateCompany);
router.delete('/:id',        CompanyController.deleteCompany);
router.put('/:id/verify',    CompanyController.verifyCompany);

module.exports = router;
