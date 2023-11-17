const express = require('express');
const router = express.Router();

const utilsController = require('../controller/utilsController');

router.get('/getSkills', utilsController.getSkills);
router.get('/getLocation', utilsController.getLocation);
router.get('/getDistrict', utilsController.getDistrict);
router.get('/getCity', utilsController.getCity);

module.exports = router;
