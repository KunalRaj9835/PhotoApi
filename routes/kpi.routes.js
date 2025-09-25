const express = require("express");
const router = express.Router();
const kpiController = require("../controllers/kpi.controller");

// GET /kpi
router.get("/", kpiController.getKPI);

module.exports = router;
