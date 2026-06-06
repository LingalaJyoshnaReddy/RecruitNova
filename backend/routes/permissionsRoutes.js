const express    = require('express');
const router     = express.Router();
const PermissionsController = require('../controllers/PermissionsController');

router.get('/',      PermissionsController.getAllPermissions);
router.post('/',     PermissionsController.upsertPermission);
router.delete('/:id', PermissionsController.deletePermission);

module.exports = router;
