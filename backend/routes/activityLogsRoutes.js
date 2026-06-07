const express                  = require('express');
const router                   = express.Router();
const ActivityLogsController   = require('../controllers/ActivityLogsController');

router.get('/',    ActivityLogsController.getLogs);
router.post('/',   ActivityLogsController.addLog);
router.delete('/', ActivityLogsController.clearLogs);

module.exports = router;