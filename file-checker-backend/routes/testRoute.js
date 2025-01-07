const express = require('express');
const router = express.Router();
require('dotenv').config();

const isLocal = process.env.NODE_ENV === 'local';
const pool = isLocal ? require('../mockDb') : new (require('pg').Pool)({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database connected: ${result.rows[0].now}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    res.status(500).send('Error connecting to the database');
  }
});

module.exports = router;