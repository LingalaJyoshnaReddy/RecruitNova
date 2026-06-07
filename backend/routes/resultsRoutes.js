const express           = require('express');
const router            = express.Router();
const ResultsController = require('../controllers/ResultsController');

router.get('/',                    ResultsController.getAllResults);
router.get('/my/:candidate_id',    ResultsController.getMyResults);
router.post('/',                   ResultsController.addResult);
router.put('/:id',                 ResultsController.updateResult);

module.exports = router;