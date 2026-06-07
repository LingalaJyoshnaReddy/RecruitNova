const express             = require('express');
const router              = express.Router();
const CandidateController = require('../controllers/CandidateController');

router.get('/:user_id',  CandidateController.getCandidateProfile);
router.post('/:user_id', CandidateController.upsertCandidateProfile);

module.exports = router;
