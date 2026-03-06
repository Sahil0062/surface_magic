import { pool } from "../../config/database.js";
import { formatUrl } from "../../constants/commonFunctions.js";

/* -------------------------------------------------------------------------- */
/*                                   CONST                                    */
/* -------------------------------------------------------------------------- */

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


export const getUserById = async (userId) => {
  try {
    if (!userId) return null;

    const [rows] = await pool.execute(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (!rows.length) return null;

    const user = { ...rows[0] };
    user.profile_image = formatUrl(user.profile_image);

    return user;
  } catch (error) {
    console.error("DB:getUserById", error);
    throw new Error("Failed to fetch user");
  }
};





export const updateUserProfile = async ({ userId, name, profile_image }) => {
  const [result] = await pool.execute(
    `UPDATE users
     SET name = ?, profile_image = ?
     WHERE id = ?`,
    [name, profile_image ?? null, userId]
  );

  return result.affectedRows;
};

export const getUserDetail = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT ${USER_COLUMNS}
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) return null;

  const user = { ...rows[0] };
  user.profile_image = formatUrl(user.profile_image);

  return user;
};



