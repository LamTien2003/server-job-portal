const express = require('express');
const router = express.Router();

const filesMiddleware = require('../middleware/filesMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controller/authController');

// find all users
router.post(
    '/signup',
    filesMiddleware.uploadMultipleFields([
        { name: 'photo', maxCount: 1 },
        { name: 'coverPhoto', maxCount: 1 },
    ]),
    filesMiddleware.resizePhoto('users'),
    authController.signUp,
);
router.post('/login', authController.login);
router.post('/logout', authMiddleware.protectLogin, authController.logout);
router.get('/refreshToken', authController.refreshToken);

module.exports = router;
