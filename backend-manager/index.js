const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Personal Notes and Bookmark Manager API');
});

// Middleware: Authenticate JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// In-memory storage
let notes = [];
let noteIdCounter = 1;

// Helper: Validate note
function validateNote(note) {
  if (!note.content || typeof note.content !== 'string') {
    return 'Note content is required.';
  }
  if (note.tags && !Array.isArray(note.tags)) {
    return 'Tags must be an array.';
  }
  return null;
}

// POST /api/notes
app.post('/api/notes', authenticateJWT, (req, res) => {
  const { content, tags, favorite } = req.body;
  const error = validateNote({ content, tags });
  if (error) return res.status(400).json({ error });
  const newNote = {
    id: noteIdCounter++,
    userId: req.user.userId,
    content,
    tags: tags || [],
    favorite: !!favorite,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  notes.push(newNote);
  res.status(201).json(newNote);
});

// GET /api/notes (with optional search/filter)
app.get('/api/notes', authenticateJWT, (req, res) => {
  let { q, tags } = req.query;
  let filtered = notes.filter(note => note.userId === req.user.userId);
  if (q) {
    filtered = filtered.filter(note => note.content.toLowerCase().includes(q.toLowerCase()));
  }
  if (tags) {
    const tagArr = tags.split(',').map(t => t.trim().toLowerCase());
    filtered = filtered.filter(note => note.tags.some(tag => tagArr.includes(tag.toLowerCase())));
  }
  res.json(filtered);
});

// GET /api/notes/:id
app.get('/api/notes/:id', authenticateJWT, (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id) && n.userId === req.user.userId);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  res.json(note);
});

// PUT /api/notes/:id
app.put('/api/notes/:id', authenticateJWT, (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id) && n.userId === req.user.userId);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  const { content, tags, favorite } = req.body;
  const error = validateNote({ content, tags });
  if (error) return res.status(400).json({ error });
  note.content = content;
  note.tags = tags || [];
  if (typeof favorite === 'boolean') note.favorite = favorite;
  note.updatedAt = new Date();
  res.json(note);
});

// DELETE /api/notes/:id
app.delete('/api/notes/:id', authenticateJWT, (req, res) => {
  const idx = notes.findIndex(n => n.id === parseInt(req.params.id) && n.userId === req.user.userId);
  if (idx === -1) return res.status(404).json({ error: 'Note not found.' });
  notes.splice(idx, 1);
  res.status(204).send();
});

// PATCH /api/notes/:id/favorite
app.patch('/api/notes/:id/favorite', authenticateJWT, (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id) && n.userId === req.user.userId);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  note.favorite = !note.favorite;
  note.updatedAt = new Date();
  res.json(note);
});

const axios = require('axios');
const { URL } = require('url');

// In-memory storage for bookmarks
let bookmarks = [];
let bookmarkIdCounter = 1;

// Helper: Validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Helper: Validate bookmark
function validateBookmark(bm) {
  if (!bm.url || typeof bm.url !== 'string' || !isValidUrl(bm.url)) {
    return 'A valid URL is required.';
  }
  if (bm.tags && !Array.isArray(bm.tags)) {
    return 'Tags must be an array.';
  }
  return null;
}

// Helper: Fetch title from URL
async function fetchTitle(url) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const match = response.data.match(/<title>([^<]*)<\/title>/i);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

// POST /api/bookmarks
app.post('/api/bookmarks', authenticateJWT, async (req, res) => {
  const { url, title, description, tags, favorite } = req.body;
  const error = validateBookmark({ url, tags });
  if (error) return res.status(400).json({ error });
  let bookmarkTitle = title;
  if (!bookmarkTitle) {
    bookmarkTitle = await fetchTitle(url);
  }
  const newBookmark = {
    id: bookmarkIdCounter++,
    userId: req.user.userId,
    url,
    title: bookmarkTitle || url,
    description: description || '',
    tags: tags || [],
    favorite: !!favorite,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  bookmarks.push(newBookmark);
  res.status(201).json(newBookmark);
});

// GET /api/bookmarks (with optional search/filter)
app.get('/api/bookmarks', authenticateJWT, (req, res) => {
  let { q, tags } = req.query;
  let filtered = bookmarks.filter(bm => bm.userId === req.user.userId);
  if (q) {
    filtered = filtered.filter(bm =>
      (bm.title && bm.title.toLowerCase().includes(q.toLowerCase())) ||
      (bm.description && bm.description.toLowerCase().includes(q.toLowerCase()))
    );
  }
  if (tags) {
    const tagArr = tags.split(',').map(t => t.trim().toLowerCase());
    filtered = filtered.filter(bm => bm.tags.some(tag => tagArr.includes(tag.toLowerCase())));
  }
  res.json(filtered);
});

// GET /api/bookmarks/:id
app.get('/api/bookmarks/:id', authenticateJWT, (req, res) => {
  const bm = bookmarks.find(b => b.id === parseInt(req.params.id) && b.userId === req.user.userId);
  if (!bm) return res.status(404).json({ error: 'Bookmark not found.' });
  res.json(bm);
});

// PUT /api/bookmarks/:id
app.put('/api/bookmarks/:id', authenticateJWT, async (req, res) => {
  const bm = bookmarks.find(b => b.id === parseInt(req.params.id) && b.userId === req.user.userId);
  if (!bm) return res.status(404).json({ error: 'Bookmark not found.' });
  const { url, title, description, tags, favorite } = req.body;
  const error = validateBookmark({ url, tags });
  if (error) return res.status(400).json({ error });
  let bookmarkTitle = title;
  if (!bookmarkTitle) {
    bookmarkTitle = await fetchTitle(url);
  }
  bm.url = url;
  bm.title = bookmarkTitle || url;
  bm.description = description || '';
  bm.tags = tags || [];
  if (typeof favorite === 'boolean') bm.favorite = favorite;
  bm.updatedAt = new Date();
  res.json(bm);
});

// DELETE /api/bookmarks/:id
app.delete('/api/bookmarks/:id', authenticateJWT, (req, res) => {
  const idx = bookmarks.findIndex(b => b.id === parseInt(req.params.id) && b.userId === req.user.userId);
  if (idx === -1) return res.status(404).json({ error: 'Bookmark not found.' });
  bookmarks.splice(idx, 1);
  res.status(204).send();
});

// PATCH /api/bookmarks/:id/favorite
app.patch('/api/bookmarks/:id/favorite', authenticateJWT, (req, res) => {
  const bm = bookmarks.find(b => b.id === parseInt(req.params.id) && b.userId === req.user.userId);
  if (!bm) return res.status(404).json({ error: 'Bookmark not found.' });
  bm.favorite = !bm.favorite;
  bm.updatedAt = new Date();
  res.json(bm);
});

const JWT_SECRET = 'your_jwt_secret'; // In production, use env variable

// In-memory user storage
let users = [];
let userIdCounter = 1;

// Helper: Validate user
function validateUser(user) {
  if (!user.username || typeof user.username !== 'string') {
    return 'Username is required.';
  }
  if (!user.password || typeof user.password !== 'string' || user.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const error = validateUser({ username, password });
  if (error) return res.status(400).json({ error });
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: userIdCounter++, username, password: hashedPassword };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully.' });
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Invalid username or password.' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid username or password.' });
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 