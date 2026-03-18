import { pool } from "../../config/database.js";

export const emailExists = async (email) => {
  try {
    if (!email) return false;

    const [rows] = await pool.execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    return rows.length > 0;
  } catch (error) {
    console.error("DB:emailExists", error);
    throw new Error("Failed to check email");
  }
};

export const createUser = async ({
  name,
  email,
  password,
  profile_image = null,
  device_token = null,
  device_type = null,
  time_zone = null,
  role = 0,
  status = "active",
}) => {
  const [result] = await pool.execute(
    `INSERT INTO users
      (name, email, password, profile_image, device_token, device_type, time_zone, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      password,
      profile_image,
      device_token,
      device_type,
      time_zone,
      role,
      status,
    ]
  );

  return result.insertId;
};

export const getActiveUserByEmail = async (email) => {
  try {
    if (!email) return null;

    const [rows] = await pool.execute(
      `SELECT *
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("DB:getActiveUserByEmail", error);
    throw new Error("Failed to fetch user");
  }
};

// export const updateUserLogin = async ({
//   userId,
//   token,
//   device_type,
//   device_token,
//   time_zone
// }) => {
//   try {
//     if (!userId) return;

//     await pool.execute(
//       `UPDATE users
//        SET access_token = ?, device_type = ?, device_token = ?,time_zone = ?, status = 'active'
//        WHERE id = ?`,
//       [token, device_type ?? null, device_token ?? null,time_zone ?? null, userId]
//     );
//   } catch (error) {
//     console.error("DB:updateUserLogin", error);
//     throw new Error("Failed to update login info");
//   }
// };

export const updateUserLogin = async ({
  userId,
  token,
  device_type,
  device_token,
  time_zone
}) => {
  try {
    if (!userId) return;

    await pool.execute(
      `UPDATE users
       SET access_token = ?, device_type = ?, device_token = ?, time_zone = ?
       WHERE id = ?`,
      [token, device_type ?? null, device_token ?? null, time_zone ?? null, userId]
    );
  } catch (error) {
    console.error("DB:updateUserLogin", error);
    throw new Error("Failed to update login info");
  }
};

export const logoutUser = async (userId) => {
  await pool.execute(
    `UPDATE users
     SET status = 'logout', access_token = NULL
     WHERE id = ?`,
    [userId]
  );
};

export const deleteUserAccount = async (userId) => {
  await pool.execute(
    `UPDATE users
     SET status = 'deleted', access_token = NULL
     WHERE id = ?`,
    [userId]
  );
};