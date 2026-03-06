import { pool } from "../../config/database.js";

export const createLeave = async ({
  user_id,
  startEpoch,
  endEpoch,
  total_days,
  reason,
  status,
  applied_by_admin = 0,
}) => {
  await pool.execute(
    `INSERT INTO leaves
     (user_id, start_date, end_date, total_days, reason, status, applied_by_admin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, startEpoch, endEpoch, total_days, reason, status, applied_by_admin]
  );
};

export const getLeavesByUser = async (user_id) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        approved_at,
        created_at
     FROM leaves
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [user_id]
  );

  return rows;
};