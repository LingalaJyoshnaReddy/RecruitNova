const express    = require('express');
const router     = express.Router();
const RolesController = require('../controllers/RolesController');

router.get('/',     RolesController.getAllRoles);
router.post('/',    RolesController.addRole);
router.put('/:id',  RolesController.updateRole);
router.delete('/:id', RolesController.deleteRole);

module.exports = router;
