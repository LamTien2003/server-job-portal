const express = require('express');
const router = express.Router();

const utilsController = require('../controller/utilsController');

router.get('/getSkills', utilsController.getSkills);

module.exports = router;
