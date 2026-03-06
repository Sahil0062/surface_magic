 import { pool } from "../../config/database.js";

 
 /* -------------------------------------------------------------------------- */
  /*                                LEAVE MANAGEMENT                            */
  /* -------------------------------------------------------------------------- */
  export const getAllLeaves = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `
      SELECT 
        l.id,
        l.user_id,
        u.name AS employee_name,
        u.email AS employee_email,

        FROM_UNIXTIME(l.start_date/1000,'%d %b %Y') AS start_date,
        FROM_UNIXTIME(l.end_date/1000,'%d %b %Y') AS end_date,

        l.total_days,
        l.reason,
        l.status,
        l.created_at

      FROM leaves l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    const [[count]] = await pool.execute(`SELECT COUNT(*) as total FROM leaves`);

    return {
      leaves: rows,
      totalPages: Math.ceil(count.total / limit),
      total: count.total,
    };
  };
  export const getLeaveStats = async () => {
    const [[row]] = await pool.execute(`
      SELECT
        COUNT(*) total,
        SUM(status='pending') pending,
        SUM(status='approved') approved,
        SUM(status='rejected') rejected
      FROM leaves
    `);

    return row;
  };
  export const getLeavesByUser = async (userId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `
      SELECT 
        l.id,
        u.name AS employee_name,
        u.email AS employee_email,
        FROM_UNIXTIME(l.start_date/1000,'%d %b %Y') AS start_date,
        FROM_UNIXTIME(l.end_date/1000,'%d %b %Y') AS end_date,
        l.total_days,
        l.reason,
        l.status
      FROM leaves l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.user_id = ?
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?
    `,
      [userId, limit, offset],
    );

    const [[{ count }]] = await pool.execute(
      `SELECT COUNT(*) as count FROM leaves WHERE user_id=?`,
      [userId],
    );

    return {
      leaves: rows,
      totalPages: Math.ceil(count / limit),
    };
  };
  export const updateLeaveStatus = async (id, status) => {
    await pool.execute(`UPDATE leaves SET status=?, approved_at=? WHERE id=?`, [
      status,
      Date.now(),
      id,
    ]);
  };
  export const getLeaveStatsByUser = async (userId) => {
    const [[row]] = await pool.execute(
      `
      SELECT
        COUNT(*) total,
        SUM(status='pending') pending,
        SUM(status='approved') approved,
        SUM(status='rejected') rejected
      FROM leaves
      WHERE user_id = ?
    `,
      [userId],
    );

    return row;
  };
  export const getLeaveNotifications = async () => {
    const [rows] = await pool.execute(`
      SELECT 
        l.id,
        u.name,
        u.email,
        FROM_UNIXTIME(l.start_date/1000,'%d %b %Y') AS start_date,
        FROM_UNIXTIME(l.end_date/1000,'%d %b %Y') AS end_date,
        l.reason,
        l.status,
        l.created_at
      FROM leaves l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.status = 'pending'
      ORDER BY l.id DESC
      LIMIT 5
    `);

    return rows;
  };
  export const getPendingLeavesModel = async () => {
    const [rows] = await pool.execute(`
      SELECT 
    u.id,
    u.name,
    u.email
  FROM leaves l
  JOIN users u ON u.id = l.user_id
  WHERE l.status='pending'
  ORDER BY l.id DESC
    `);

    return rows;
  };
