const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {algorithm: 'HS512', expiresIn: '30m' });
};

// POST /register
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
  
    try {
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'Email już zajęty' });
  
      // Hash hasła
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Nowy użytkownik
      const user = new User({
        username,
        email,
        password: hashedPassword,
        role
      });
  
      await user.save();
  
      // Tworzenie tokenu JWT
      const token = generateToken(user._id, user.role);
  
      res.status(201).json({
        message: 'Użytkownik zarejestrowany',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Błąd serwera' });
    }
};

// POST /login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Nieprawidłowe dane' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Nieprawidłowe dane' });

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Zalogowano',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /me
const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Brak danych użytkownika' });

  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
