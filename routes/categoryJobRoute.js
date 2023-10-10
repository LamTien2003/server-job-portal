const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const categoryJobController = require('../controller/categoryJobController');

router.post(
    '/',
    authMiddleware.protectLogin,
    authMiddleware.restrictTo('admin'),
    categoryJobController.createCategoryJob,
);
router.get('/', categoryJobController.getAllCategoryJob);

module.exports = router;
