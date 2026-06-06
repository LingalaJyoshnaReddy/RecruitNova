const express        = require('express');
const router         = express.Router();
const JobsController = require('../controllers/JobsController');

router.get('/',     JobsController.getAllJobs);
router.get('/:id',  JobsController.getJob);
router.post('/',    JobsController.addJob);
router.put('/:id',  JobsController.updateJob);
router.delete('/:id', JobsController.deleteJob);

module.exports = router;
