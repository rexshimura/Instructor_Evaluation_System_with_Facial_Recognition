// This file is a template for the actual db/pool.js file.
// NOTE: This is for those who cloned this system
// COPY this or rename file to db/pool.js and fill in your local credentials.

// server/db/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'YOUR_DATABASE_USER', // <-- FILL THIS IN
  host: 'YOUR_DATABASE_HOST', // <-- FILL THIS IN (e.g., 'localhost')
  database: 'YOUR_DATABASE_NAME', // <-- FILL THIS IN
  password: 'YOUR_DATABASE_PASSWORD', // <-- FILL THIS IN
  port: 5432,
});

export default pool;