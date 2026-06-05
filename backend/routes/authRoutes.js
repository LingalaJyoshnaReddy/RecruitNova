const express        = require('express');
const router         = express.Router();
const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middleware/AuthMiddleware');

router.post('/register',         AuthController.register);
router.post('/login',            AuthController.login);
router.post('/forgot-password',  AuthController.forgotPassword);
router.post('/reset-password',   AuthController.resetPassword);
router.post('/change-password',  verifyToken, AuthController.changePassword);
router.put('/profile/:id',       verifyToken, AuthController.updateProfile);

module.exports = router;
