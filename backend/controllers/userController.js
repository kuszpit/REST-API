const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {algorithm: process.env.ALGORITHM, expiresIn: '30m' });
};

// POST api/users/register
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
  
    try {
      // check if email or username exists
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(409).json({ message: 'Email już zajęty' });

      const usernameExists = await User.findOne({ username });
      if (usernameExists) return res.status(409).json({ message: 'Nazwa użytkownika zajęta'});
      
      //create new user
      const salt = await bcrypt.genSalt(10); 
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        email,
        password: hashedPassword,
        role
      });
  
      await user.save();
  
      // create token JWT
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

// POST api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Nieprawidłowe dane' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Nieprawidłowe dane' });

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

// GET api/users/me
const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Brak danych użytkownika' });

  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
};

const getAll = async (req, res) => {
  try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Błąd serwera' });
    }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAll
};
