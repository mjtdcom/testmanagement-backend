require('dotenv').config();
const PORT = process.env.PORT || 3000;
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();


app.use(express.json());
app.use(express.static('public'));

// Path to database
const dbPath = path.join(__dirname, 'database.json');

// Read database
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Save to database
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

// Get all tests
app.get('/tests', (req, res) => res.json(readDB().tests));

// Add new test
app.post('/tests', (req, res) => {
  const db = readDB();
  const newTest = req.body;
  newTest.id = db.tests.length + 1;
  db.tests.push(newTest);
  writeDB(db);
  res.status(201).json(newTest);
});

// Delete a test
app.delete('/tests/:id', (req, res) => {
  const db = readDB();
  db.tests = db.tests.filter(test => test.id !== parseInt(req.params.id));
  writeDB(db);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));