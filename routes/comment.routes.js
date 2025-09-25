const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');

// GET /comment -> all users with status = 2
router.get('/', commentController.getPendingPartners);

// POST /comment/:id -> update status + comment (id = email)
router.post('/:id', commentController.updatePartnerStatus);

module.exports = router;
