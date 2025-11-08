import pool from '../db/pool.js';

export const createModerator = async (payload) => {
  const q = `INSERT INTO moderator (mod_username, mod_password, mod_fname, mod_mname, mod_lname, created_by)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`;
  const vals = [payload.mod_username, payload.mod_password, payload.mod_fname, payload.mod_mname, payload.mod_lname, payload.created_by || 'system'];
  const { rows } = await pool.query(q, vals);
  return rows[0];
};

export const getModeratorById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM moderator WHERE mod_id = $1;', [id]);
  return rows[0];
};

export const getAllModerators = async () => {
  const { rows } = await pool.query('SELECT mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by FROM moderator ORDER BY mod_id DESC;');
  return rows;
};

export const updateModerator = async (id, payload) => {
  if (payload.mod_password) {
    const { rows } = await pool.query(
      `UPDATE moderator SET mod_fname=$1, mod_mname=$2, mod_lname=$3, mod_password=$4 WHERE mod_id=$5 RETURNING mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by;`,
      [payload.mod_fname, payload.mod_mname, payload.mod_lname, payload.mod_password, id]
    );
    return rows[0];
  } else {
    const { rows } = await pool.query(
      `UPDATE moderator SET mod_fname=$1, mod_mname=$2, mod_lname=$3 WHERE mod_id=$4 RETURNING mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by;`,
      [payload.mod_fname, payload.mod_mname, payload.mod_lname, id]
    );
    return rows[0];
  }
};

export const deleteModerator = async (id) => {
  await pool.query('DELETE FROM moderator WHERE mod_id = $1;', [id]);
};

// Add this to your moderatorModel.js
export const loginModerator = async (username, password) => {
  const { rows } = await pool.query(
    'SELECT mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by FROM moderator WHERE mod_username=$1 AND mod_password=$2;', 
    [username, password]
  );
  return rows[0];
};
