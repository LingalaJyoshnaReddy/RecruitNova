const express            = require('express');
const router             = express.Router();
const ReportsController  = require('../controllers/ReportsController');

router.get('/stats',               ReportsController.getDashboardStats);
router.get('/applications-by-job', ReportsController.getApplicationsByJob);
router.get('/applications-by-company', ReportsController.getApplicationsByCompany);
router.get('/ats-distribution',    ReportsController.getATSScoreDistribution);
router.get('/hiring-funnel',       ReportsController.getHiringFunnel);
router.get('/monthly',             ReportsController.getMonthlyApplications);

module.exports = router;