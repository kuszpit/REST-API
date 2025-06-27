const express = require('express');
const router = express.Router();

const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/:id', getBookById);
router.put('/:id', protect, admin, updateBook);
router.delete('/:id', protect, admin, deleteBook);
router.post('/', protect, admin, createBook);
router.get('/', getBooks);

module.exports = router;
