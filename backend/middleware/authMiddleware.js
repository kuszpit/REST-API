const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: process.env.ALGORITHM });
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(404).json({ message: 'Użytkownik nie istnieje' });
      }

      next();

    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Nieautoryzowany token' });
    }
  } else {
    return res.status(401).json({ message: 'Brak tokena' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Brak uprawnień' });
  }
};

module.exports = { protect, admin };
