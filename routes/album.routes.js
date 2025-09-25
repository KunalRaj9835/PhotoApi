const express = require("express");
const router = express.Router();
const albumController = require("../controllers/album.controller");

// Add new photo
router.post("/add", albumController.addPhoto);

// Edit photo (only index or description)
router.put("/edit/:id", albumController.editPhoto);

// Delete photo
router.delete("/delete/:id", albumController.deletePhoto);

module.exports = router;
