const express                  = require('express');
const router                   = express.Router();
const NotificationController   = require('../controllers/NotificationController');

router.get('/:user_id',          NotificationController.getNotifications);
router.get('/:user_id/unread',   NotificationController.getUnreadCount);
router.put('/:user_id/read',     NotificationController.markAsRead);
router.post('/',                 NotificationController.createNotification);

module.exports = router;
