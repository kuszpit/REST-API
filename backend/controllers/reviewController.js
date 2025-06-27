const Review = require('../models/Review');
const User = require('../models/User');
const Book = require('../models/Book');
const mongoose = require('mongoose');

// GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('book', 'title author');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /api/reviews/book/:id
const getReviewsByBook = async (req, res) => {
  const bookId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Nieprawidłowy identyfikator książki' });
  }

  try {
    const reviews = await Review.find({ book: bookId })
      .populate('user', 'username') 
      .populate('book', 'title author') 
      .exec();

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /api/reviews/:id
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('book', 'title author');
    if (!review) return res.status(404).json({ message: 'Recenzja nie istnieje' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// POST /api/reviews
const createReview = async (req, res) => {
  const { bookId, content, rating } = req.body;

  if (!bookId || !content || !rating) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Nieprawidłowy identyfikator książki' });
  }

  try {
    const bookExists = await Book.findById(bookId);

    if (!bookExists) {
      return res.status(404).json({ message: 'Książka nie istnieje' });
    }

    const review = new Review({
      book: bookId,
      user: req.user._id,
      content,
      rating
    });

    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Nie udało się dodać recenzji' });
  }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Recenzja nie istnieje' });
    }
    res.json({ message: 'Recenzja usunięta' });
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

module.exports = {
  getReviews,
  getReviewsByBook,
  getReviewById,
  createReview,
  deleteReview
};
