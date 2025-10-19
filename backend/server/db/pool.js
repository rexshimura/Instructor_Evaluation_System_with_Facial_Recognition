// server/db/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'IHC',
  password: '123',
  port: 5432,
});

export default pool;
