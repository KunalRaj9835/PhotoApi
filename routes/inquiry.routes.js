const express = require("express");
const router = express.Router();
const inquiryController = require("../controllers/inquiry.controller");

// POST /inquiry
router.post("/", inquiryController.createInquiry);

module.exports = router;
