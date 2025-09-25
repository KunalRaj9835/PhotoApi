const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

// Add new review
router.post("/add", reviewController.addReview);

// Edit review
router.put("/edit/:id", reviewController.editReview);

// Delete review
router.delete("/delete/:id", reviewController.deleteReview);

module.exports = router;
