const express = require("express");
const router = express.Router();
const leadController = require("../controllers/lead.controller");

// GET /lead
router.get("/", leadController.getLeads);

module.exports = router;
