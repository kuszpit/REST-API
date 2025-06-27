const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: String,
  description: String,
  publishedYear: Number,
  genre: String,
  averageRating: {
    type: Number,
    default: 0
  }                              
});

module.exports = mongoose.model('Book', BookSchema);
