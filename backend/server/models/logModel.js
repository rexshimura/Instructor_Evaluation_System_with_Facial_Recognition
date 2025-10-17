import pool from '../db/pool.js';

export const getAllLogs = async () => {
  const query = `
    SELECT 
      l.log_id,
      l.log_action,
      l.log_date,
      m.mod_id,
      m.mod_username,
      m.mod_fname,
      m.mod_lname,
      i.ins_id,
      CONCAT(i.ins_fname, ' ', i.ins_lname) AS instructor_name
    FROM log_table l
    LEFT JOIN moderator m ON l.mod_id = m.mod_id
    LEFT JOIN instructor i ON l.ins_id = i.ins_id
    ORDER BY l.log_date DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const createLog = async (mod_id, ins_id, log_action) => {
  const query = `
    INSERT INTO log_table (mod_id, ins_id, log_action, log_date)
    VALUES ($1, $2, $3, NOW())
    RETURNING *;
  `;
  const values = [mod_id, ins_id, log_action];
  const { rows } = await pool.query(query, values);
  return rows[0];
};