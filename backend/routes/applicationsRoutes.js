const express                 = require('express');
const router                  = express.Router();
const ApplicationsController  = require('../controllers/ApplicationsController');

router.get('/',                          ApplicationsController.getAllApplications);
router.get('/my/:candidate_id',          ApplicationsController.getMyApplications);
router.post('/',                         ApplicationsController.applyJob);
router.put('/:id/status',               ApplicationsController.updateApplicationStatus);
router.delete('/:id',                   ApplicationsController.deleteApplication);

module.exports = router;
