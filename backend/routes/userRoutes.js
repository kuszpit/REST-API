const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    getAll
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/', protect, admin, getAll);

module.exports = router;
