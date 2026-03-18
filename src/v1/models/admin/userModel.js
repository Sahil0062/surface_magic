import { pool } from "../../config/database.js";
import { formatUrl } from "../../constants/commonFunctions.js";

const USER_COLUMNS = `
  id,
  name,
  email,
  status,
  profile_image,
  device_type,
  device_token,
  time_zone,
  role,
  created_at,
  updated_at
`;
/* -------------------------------------------------------------------------- */
  /*                                USERS / EMPLOYEES                           */
  /* -------------------------------------------------------------------------- */
  export const getAllUsers = async () => {
    const [rows] = await pool.execute(`
      SELECT id, name, email, profile_image, status
      FROM users
      WHERE role = 0
      AND status != 'deleted'
      ORDER BY id DESC
    `);

    return rows;
  };
  export const getUserById = async (userId) => {
    try {
      if (!userId) return null;

      const [rows] = await pool.execute(
        `SELECT ${USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
        [userId],
      );

      if (!rows.length) return null;

      const user = { ...rows[0] }; // avoid mutation
      user.profile_image = formatUrl(user.profile_image);

      return user;
    } catch (error) {
      console.error("DB:getUserById:", error);
      throw new Error("Failed to fetch user");
    }
  };
  export const createUser = async (data) => {
    try {
      const [result] = await pool.execute(
        `INSERT INTO users
        (name, email, phone, password, profile_image,
         role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.email,
          data.phone || null,
          data.password || null,
          data.profile_image || null,
          data.role,
          data.status,
        ],
      );

      return result.insertId;
    } catch (err) {
      console.error("createUser DB Error:", err);
      throw err;
    }
  };
  export const emailExists = async (email) => {
    try {
      if (!email) return false;

      const [rows] = await pool.execute(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [email],
      );

      return rows.length > 0;
    } catch (error) {
      console.error("DB:emailExists:", error);
      throw new Error("Failed to check email");
    }
  };
  export const updateUserStatus = async (id, status) => {
    await pool.execute("UPDATE users SET status=? WHERE id=?", [status, id]);
  };
  export const deleteUser = async (userId) => {
    const [result] = await pool.execute(
      `UPDATE users SET status = 'deleted' WHERE id = ?`,
      [userId],
    );

    return result.affectedRows;
  };
  export const getUsers = async (page, limit, search) => {

    const offset = (page - 1) * limit;

    const [users] = await pool.execute(`
      SELECT *
      FROM users
      WHERE status != 'deleted'
      AND role = 0
      AND (name LIKE ? OR email LIKE ?)
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `, [`%${search}%`, `%${search}%`, limit, offset]);

    const [[count]] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE status != 'deleted'
      AND role = 0
      AND (name LIKE ? OR email LIKE ?)
    `, [`%${search}%`, `%${search}%`]);

    return {
      users,
      total: count.total
    };
  };


  export const getEmployees = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `
      SELECT id, name, email, profile_image, status
      FROM users
      WHERE role = 0
      AND status != 'deleted'
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    const [[count]] = await pool.execute(`
      SELECT COUNT(*) as total FROM users WHERE role = 0 AND status != 'deleted'
    `);

    return {
      users: rows.map((u) => ({
        ...u,
        profile_image: formatUrl(u.profile_image),
      })),
      total: count.total,
    };
  };
  // export const updateEmployee = async ({ id, name, email, profile_image }) => {
  //   if (profile_image) {
  //     await pool.execute(
  //       "UPDATE users SET name=?, email=?, profile_image=? WHERE id=?",
  //       [name, email, profile_image, id],
  //     );
  //   } else {
  //     await pool.execute("UPDATE users SET name=?, email=? WHERE id=?", [
  //       name,
  //       email,
  //       id,
  //     ]);
  //   }
  // };

  export const updateEmployee = async ({ id, name, email, profile_image, password }) => {

  if (profile_image && password) {

    await pool.execute(
      "UPDATE users SET name=?, email=?, profile_image=?, password=? WHERE id=?",
      [name, email, profile_image, password, id]
    );

  } else if (profile_image) {

    await pool.execute(
      "UPDATE users SET name=?, email=?, profile_image=? WHERE id=?",
      [name, email, profile_image, id]
    );

  } else if (password) {

    await pool.execute(
      "UPDATE users SET name=?, email=?, password=? WHERE id=?",
      [name, email, password, id]
    );

  } else {

    await pool.execute(
      "UPDATE users SET name=?, email=? WHERE id=?",
      [name, email, id]
    );

  }

};
    export const getEmployeess = async () => {
      const [rows] = await pool.execute(
        `SELECT id, name, email 
        FROM users 
        WHERE role = 0 AND status IN ('active', 'logout')
        ORDER BY name`,
      );
      return rows;
    };

