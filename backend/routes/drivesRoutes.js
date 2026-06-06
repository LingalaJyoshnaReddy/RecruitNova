const express          = require('express');
const router           = express.Router();
const DrivesController = require('../controllers/DrivesController');

router.get('/',     DrivesController.getAllDrives);
router.get('/:id',  DrivesController.getDrive);
router.post('/',    DrivesController.addDrive);
router.put('/:id',  DrivesController.updateDrive);
router.delete('/:id', DrivesController.deleteDrive);

module.exports = router;
