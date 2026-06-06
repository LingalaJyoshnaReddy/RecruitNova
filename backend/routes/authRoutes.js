const express        = require('express');
const router         = express.Router();
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

router.post('/register',        AuthController.register);
router.post('/login',           AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password',  AuthController.resetPassword);
router.post('/change-password', AuthMiddleware.verifyToken, AuthController.changePassword);
router.put('/profile/:id',      AuthMiddleware.verifyToken, AuthController.updateProfile);

router.get('/users',           AuthController.getAllUsers);
router.put('/users/:id/role',  AuthController.updateUserRole);
router.delete('/users/:id',    AuthController.deleteUser);
module.exports = router;

