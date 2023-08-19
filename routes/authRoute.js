const express = require('express');
const router = express.Router();

const filesMiddleware = require('../middleware/filesMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controller/authController');

// find all users
router.post(
    '/signup',
    filesMiddleware.uploadSinglePhoto('photo'),
    filesMiddleware.resizePhoto('users'),
    authController.signUp,
);
router.post('/login', authController.login);
router.post('/refreshToken', authController.refreshToken);
router.post('/logout', authMiddleware.protectLogin, authController.logout);

module.exports = router;
