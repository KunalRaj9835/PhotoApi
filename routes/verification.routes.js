const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

// GET /verification
router.get('/', verificationController.getPendingVerifications);

module.exports = router;
