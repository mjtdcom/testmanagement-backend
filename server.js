const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const dbPath = path.join(__dirname, 'database.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { tests: [], users: [] }; // Initialize with empty arrays if file doesn't exist
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};

// Login endpoint
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

// Get all tests
app.get('/tests', (req, res) => {
  const db = readDB();
  const username = req.headers['x-username'];
  const userRole = req.headers['x-role'];

  if (userRole === 'admin') {
    return res.json(db.tests);
  }
  
  const userTests = db.tests.filter(test => test.reportedBy === username);
  res.json(userTests);
});

// Get single test by ID
app.get('/tests/:id', (req, res) => {
  const db = readDB();
  const test = db.tests.find(t => t.id === parseInt(req.params.id));
  const username = req.headers['x-username'];
  const userRole = req.headers['x-role'];

  if (!test) {
    return res.status(404).json({ error: 'Test not found' });
  }

  if (userRole !== 'admin' && test.reportedBy !== username) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(test);
});

// Create new test
app.post('/tests', (req, res) => {
  const db = readDB();
  const newTest = {
    ...req.body,
    id: db.tests.length + 1,
    reportedBy: req.headers['x-username'],
    status: 'pending',
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.tests.push(newTest);
  writeDB(db);
  res.status(201).json(newTest);
});

// Update test status (approve/reject)
app.patch('/tests/:id/status', (req, res) => {
  const db = readDB();
  const userRole = req.headers['x-role'];
  const { status, comment } = req.body;
  
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const testId = parseInt(req.params.id);
  const testIndex = db.tests.findIndex(test => test.id === testId);
  
  if (testIndex === -1) {
    return res.status(404).json({ error: 'Test not found' });
  }

  // Update test status and add action log
  db.tests[testIndex].status = status;
  db.tests[testIndex].updatedAt = new Date().toISOString();
  db.tests[testIndex].actions.push({
    action: status,
    by: req.headers['x-username'],
    comment: comment || '',
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json(db.tests[testIndex]);
});

// Delete test (admin only)
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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
