const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Initialize express app first
const app = express();
const PORT = process.env.PORT || 3000;

// Then apply middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Path to database
const dbPath = path.join(__dirname, 'database.json');

// Read database
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Save to database
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

// Add login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({
      username: user.username,
      name: user.name,
      role: user.role
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get all tests (Admins see all, users see only their own)
app.get('/tests', (req, res) => {
  const db = readDB();
  const username = req.headers['x-username']; // Username from request headers
  const userRole = req.headers['x-role']; // Role from request headers

  if (userRole === 'admin') {
    return res.json(db.tests);
  }
  
  const userTests = db.tests.filter(test => test.reportedBy === username);
  res.json(userTests);
});

// Add new test
app.post('/tests', (req, res) => {
  const db = readDB();
  const newTest = req.body;
  newTest.id = db.tests.length + 1;
  newTest.reportedBy = req.headers['x-username']; // Store who reported it
  db.tests.push(newTest);
  writeDB(db);
  res.status(201).json(newTest);
});

// Delete a test (Only Admins can delete)
app.delete('/tests/:id', (req, res) => {
  const db = readDB();
  const userRole = req.headers['x-role'];
  
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.tests = db.tests.filter(test => test.id !== parseInt(req.params.id));
  writeDB(db);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
