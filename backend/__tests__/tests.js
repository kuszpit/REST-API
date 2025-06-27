const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
process.env.JWT_SECRET = 'testsecret123';
process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';

let adminToken = '';
let userToken = '';

beforeAll(async () => {
  // Baza testowa
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();

  const registerUser = await request(app).post('/api/users/register').send({
    username: 'User', email: 'user@example.com', password: 'user123'
  });
  userToken = registerUser.body.token;

  const registerRes = await request(app).post('/api/users/register').send({
    username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin'
  });
  adminToken = registerRes.body.token;
  
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User API', () => {
  it('should return user data with valid token', async () => {
    const res = await request(app).get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('user@example.com');
  });

  it('should deny access to user list for normal user', async () => {
    const res = await request(app).get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('should reject access without token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.statusCode).toBe(401);
  });
  
  it('should reject access with invalid token', async () => {
    const res = await request(app).get('/api/users/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toBe(401);
  });
  
});

describe('Book API', () => {
  let bookId;

  it('should allow admin to create a book', async () => {
    const res = await request(app).post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Book', author: 'Test Author' });
    expect(res.statusCode).toBe(201);
    bookId = res.body._id;
  });

  it('should allow anyone to view books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.books)).toBe(true);
  });

  it('should deny book creation by normal user', async () => {
    const res = await request(app).post('/api/books')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'User Book', author: 'User Author' });
    expect(res.statusCode).toBe(403);
  });

  it('should return 400 when creating a book with missing fields', async () => {
    const res = await request(app).post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Incomplete Book' }); // Brak autora
    expect(res.statusCode).toBe(400);
  });
  
  it('should update a book (admin only)', async () => {
    const books = await request(app).get('/api/books');
    const bookId = books.body.books[0]._id;
  
    const res = await request(app).put(`/api/books/${bookId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Title' });
  
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });
  
  it('should not allow user to delete a book', async () => {
    const books = await request(app).get('/api/books');
    const bookId = books.body.books[0]._id;
  
    const res = await request(app).delete(`/api/books/${bookId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
  
});

describe('Review API', () => {
  let reviewId;

  it('should allow anyone to post a review', async () => {
    const books = await request(app).get('/api/books');
    const bookId = books.body.books[0]._id;

    const res = await request(app).post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId: bookId, content: 'Great book!', rating: 5 });
    expect(res.statusCode).toBe(201);
    reviewId = res.body._id;
  });

  it('should allow admin to delete a review', async () => {
    const res = await request(app).delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('should not allow review without content', async () => {
    const books = await request(app).get('/api/books');
    const bookId = books.body.books[0]._id;
  
    const res = await request(app).post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId, rating: 5 }); // Brak content
    expect(res.statusCode).toBe(400);
  });
  
  it('should get all reviews', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
});

describe('Review API with regular user token', () => {
  let reviewId;
  let bookId;

  beforeAll(async () => {
    const books = await request(app).get('/api/books');
    bookId = books.body.books[0]._id;
  });

  it('should allow regular user to post a review', async () => {
    const res = await request(app).post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId, content: 'Nice read!', rating: 4 });
    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe('Nice read!');
    reviewId = res.body._id;
  });

  it('should NOT allow regular user to delete a review', async () => {
    const res = await request(app).delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);  // zakładamy, że endpoint zwraca 403 dla braku uprawnień
  });

  it('should allow regular user to get list of reviews', async () => {
    const res = await request(app).get('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow regular user to get a review by id', async () => {
    const res = await request(app).get(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(reviewId);
  });
});

describe('Book API with regular user token', () => {
  it('should NOT allow regular user to create a book', async () => {
    const res = await request(app).post('/api/books')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Unauthorized Book', author: 'User Author' });
    expect(res.statusCode).toBe(403);
  });

  it('should allow regular user to get books list', async () => {
    const res = await request(app).get('/api/books')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.books)).toBe(true);
  });
});

describe('Additional Review API tests with regular user token', () => {
  let reviewId;
  let bookId;

  beforeAll(async () => {
    // Pobierz książkę
    const books = await request(app).get('/api/books');
    bookId = books.body.books[0]._id;
  });

  it('should fail to create review without content', async () => {
    const res = await request(app).post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId, rating: 4 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Wszystkie pola są wymagane/);
  });

  it('should fail to create review with invalid bookId', async () => {
    const res = await request(app).post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId: '1234', content: 'Test', rating: 3 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Nieprawidłowy identyfikator książki/);
  });

  it('should return 404 for non-existent bookId when creating review', async () => {
    const fakeId = '507f1f77bcf86cd799439011'; // valid ObjectId format, ale brak w DB
    const res = await request(app).post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId: fakeId, content: 'Test', rating: 3 });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Nie znaleziono książki/);
  });

  it('should return 404 for getting review by invalid/non-existent id', async () => {
    const res = await request(app).get('/api/reviews/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Nie znaleziono recenzji/);
  });

  it('should not allow unauthenticated user to create review', async () => {
    const res = await request(app).post('/api/reviews')
      .send({ bookId, content: 'No auth', rating: 2 });
    expect(res.statusCode).toBe(401);
  });

  it('should not allow unauthenticated user to delete review', async () => {
    const res = await request(app).delete(`/api/reviews/${reviewId}`);
    expect(res.statusCode).toBe(401);
  });

  it('should allow admin to delete review even if user token expired', async () => {
    // Załóżmy, że masz adminToken z poprzednich testów
    // Dodaj recenzję do usunięcia
    const createRes = await request(app).post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId, content: 'To be deleted', rating: 5 });
    const idToDelete = createRes.body._id;

    const deleteRes = await request(app).delete(`/api/reviews/${idToDelete}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toMatch(/Recenzja usunięta/);
  });
});
