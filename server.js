
Copy
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Removed duplicate Pool require

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'https://mjtdcom.github.io' // Specific origin for security
}));
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Updated login endpoint (PostgreSQL version)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT username, name, role FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tests (Admins see all, users see only their own)
app.get('/tests', async (req, res) => {
  const username = req.headers['x-username'];
  const userRole = req.headers['x-role'];

  try {
    if (userRole === 'admin') {
      // Admins see all tests
      const result = await pool.query('SELECT * FROM tests');
      return res.json(result.rows);
    } else {
      // Users see only their tests
      const result = await pool.query(
        'SELECT * FROM tests WHERE reported_by = $1',
        [username]
      );
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new test
app.post('/tests', async (req, res) => {
  const { test_name, status } = req.body;
  const reported_by = req.headers['x-username'];

  try {
    // PostgreSQL auto-generates IDs (no need for manual ID assignment)
    const result = await pool.query(
      'INSERT INTO tests (test_name, status, reported_by) VALUES ($1, $2, $3) RETURNING *',
      [test_name, status, reported_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a test (Only Admins can delete)
app.delete('/tests/:id', async (req, res) => {
  const userRole = req.headers['x-role'];
  const testId = req.params.id;

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    await pool.query('DELETE FROM tests WHERE id = $1', [testId]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Connected to PostgreSQL database`);
});
