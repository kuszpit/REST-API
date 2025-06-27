const express = require('express');
const router = express.Router();
const {
  getReviews,
  getReviewsByBook,
  getReviewById,
  createReview,
  deleteReview
} = require('../controllers/reviewController');

const { protect, admin } = require('../middleware/authMiddleware');

router.get('/book/:id', getReviewsByBook);
router.get('/:id', getReviewById);
router.delete('/:id', protect, admin, deleteReview);
router.post('/', protect, createReview);
router.get('/', getReviews);

module.exports = router;
