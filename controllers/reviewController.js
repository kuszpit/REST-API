const Review = require('../models/Review');
const Book = require('../models/Book');
const mongoose = require('mongoose');

// GET /api/reviews — wszystkie recenzje
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('book', 'title author');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /api/reviews/:id — pojedyncza recenzja
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('book', 'title author');
    if (!review) return res.status(404).json({ message: 'Nie znaleziono recenzji' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// POST /api/reviews — dodaj recenzję (zalogowany użytkownik)
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
      return res.status(404).json({ message: 'Nie znaleziono książki' });
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

// DELETE /api/reviews/:id — usuń recenzję (admin)
const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Nie znaleziono recenzji' });
    }
    res.json({ message: 'Recenzja usunięta' });
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  deleteReview
};
