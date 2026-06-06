const express               = require('express');
const router                = express.Router();
const InterviewsController  = require('../controllers/InterviewsController');

router.get('/',                 InterviewsController.getAllInterviews);
router.get('/my/:candidate_id', InterviewsController.getMyInterviews);
router.post('/',                InterviewsController.scheduleInterview);
router.put('/:id',              InterviewsController.updateInterview);
router.delete('/:id',           InterviewsController.deleteInterview);

module.exports = router;