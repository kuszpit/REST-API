require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors()); 

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI).then(() => {
      app.listen(5000, () => console.log('Serwer działa...'));
    });
}

module.exports = app;
