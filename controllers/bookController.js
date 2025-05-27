const Book = require('../models/Book');

// GET /api/books?author=XYZ&page=2&limit=5&sort=title
const getBooks = async (req, res) => {
  const { author, sort, page = 1, limit = 10 } = req.query;
  if (isNaN(limit) || limit < 1) return res.status(400).json({ message: 'Nieprawidłowy limit' });

  const filter = {};
  if (author) {
    filter.author = { $regex: author, $options: 'i' }; // nieczułe na wielkość liter
  }

  const sortBy = sort || 'createdAt'; // domyślnie sortuj po dacie dodania

  try {
    const books = await Book.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Book.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      books
    });
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};


const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Nie znaleziono książki' });
    res.json(book);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// POST /api/books — dodaj nową książkę (tylko admin)
const createBook = async (req, res) => {
  const { title, author, description, year } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: 'Tytuł i autor są wymagane' });
  }

  try {
    const newBook = new Book({ title, author, description, year });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(500).json({ message: 'Nie udało się dodać książki' });
  }
};

// PUT /api/books/:id — edytuj książkę (tylko admin)
const updateBook = async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBook) return res.status(404).json({ message: 'Książka nie znaleziona' });

    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: 'Nie udało się zaktualizować książki' });
  }
};

// DELETE /api/books/:id — usuń książkę (tylko admin)
const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Książka nie znaleziona' });
    res.json({ message: 'Książka została usunięta' });
  } catch (err) {
    res.status(500).json({ message: 'Nie udało się usunąć książki' });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
