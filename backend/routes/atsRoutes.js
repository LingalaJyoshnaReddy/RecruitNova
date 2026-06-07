const express        = require('express');
const router         = express.Router();
const ATSController  = require('../controllers/ATSController');

router.get('/all',              ATSController.getAllATSResults);
router.get('/:application_id',  ATSController.getATSResult);
router.post('/process/:application_id', ATSController.processATS);

module.exports = router;
