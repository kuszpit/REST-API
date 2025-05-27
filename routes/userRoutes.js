const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

router.get('/', protect, admin, async (req, res) => {
    try {
      const users = await User.find().select('-password'); // nie pokazujemy haseł
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Błąd serwera' });
    }
  });

module.exports = router;
