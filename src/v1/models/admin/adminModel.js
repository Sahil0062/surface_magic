  import { pool } from "../../config/database.js";

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
  /*                               ADMIN AUTH                                   */
  /* -------------------------------------------------------------------------- */
  export const getAdminByEmail = async (email) => {
    const [rows] = await pool.execute(
      `SELECT id, name, email, password, profile_image, status
      FROM admin
      WHERE email = ?
      LIMIT 1`,
      [email],
    );

    return rows[0] || null;
  };
  export const updateAdminStatus = async (id, status) => {
    await pool.execute("UPDATE admin SET status=? WHERE id=?", [status, id]);
  };
  export const createAdmin = async (data) => {
    const { name, email, password, profile_image } = data;

    const [result] = await pool.execute(
      `INSERT INTO admin 
      (name, email, password, profile_image, status) 
      VALUES (?, ?, ?, ?, 1)`,
      [name, email, password, profile_image],
    );

    return result;
  };
    export const getAdminById = async (id) => {
      const [rows] = await pool.execute("SELECT * FROM admin WHERE id=?", [id]);
      return rows[0];
    };
  export const updateAdminPassword = async (id, password) => {
    await pool.execute(
      "UPDATE admin SET password=?, updated_at=NOW() WHERE id=?",
      [password, id],
    );
  };
  export const updateAccessToken = async (id, token) => {
    await pool.execute("UPDATE admin SET access_token=? WHERE id=?", [token, id]);
  };
  export const updateAdminProfile = async ({
    id,
    name,
    email,
    profile_image,
  }) => {
    if (profile_image) {
      await pool.execute(
        `UPDATE admin
        SET name = ?, email = ?, profile_image = ?
        WHERE id = ?`,
        [name, email, profile_image, id],
      );
    } else {
      await pool.execute(
        `UPDATE admin
        SET name = ?, email = ?
        WHERE id = ?`,
        [name, email, id],
      );
    }
  };
  export const getAdminDetail = async (admin_id) => {

    const [rows] = await pool.execute(
      `SELECT 
          id,
          name,
          email,
          profile_image
      FROM admin
      WHERE id = ?`,
      [admin_id]
    );

    return rows[0];
  };



  






 



