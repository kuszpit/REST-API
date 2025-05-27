const express = require('express');
const router = express.Router();
const {
  getReviews,
  getReviewById,
  createReview,
  deleteReview
} = require('../controllers/reviewController');

const { protect, admin } = require('../middleware/authMiddleware');

// Każdy może przeglądać i dodawać
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.post('/', protect, createReview); // tylko zalogowany użytkownik

// Tylko admin może usuwać
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
