  import { pool } from "../../config/database.js";
  import { buildSearchQuery } from "../../utils/searchHelper.js";


  /* -------------------------------------------------------------------------- */
  /*                                CLIENTS                                     */
  /* -------------------------------------------------------------------------- */
  export const createClient = async ({
    name,
    email,
    phone,
    device_type,
    device_token,
    time_zone,
  }) => {
    try {
      const [exist] = await pool.execute(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [email],
      );

      if (exist.length > 0) {
        return { error: "Email already exists" };
      }

      const [result] = await pool.execute(
        `INSERT INTO users
        (name, email, phone, role, status, device_type, device_token, time_zone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          email,
          phone,
          1, // role = client
          "active",
          device_type || null,
          device_token || null,
          time_zone || null,
        ],
      );

      return { id: result.insertId };
    } catch (err) {
      console.error("DB:createClient:", err);
      throw err;
    }
  };
  export const getClients = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `
      SELECT id, name, email, phone
      FROM users
      WHERE role = 1
        AND status != 'deleted'
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    const [[count]] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM users
      WHERE role = 1
        AND status != 'deleted'
    `);

    return {
      clients: rows,
      total: count.total,
      totalPages: Math.ceil(count.total / limit),
    };
  };
  export const updateClientModel = async ({ id, name, email, phone }) => {
    const [result] = await pool.execute(
      `UPDATE users
      SET name = ?, email = ?, phone = ?
      WHERE id = ? AND role = 1`,
      [name, email, phone, id],
    );

    return result.affectedRows;
  };
  export const deleteClientModel = async (id) => {
    const [result] = await pool.execute(
      `UPDATE users
      SET status = 'deleted'
      WHERE id = ? AND role = 1`,
      [id],
    );

    return result.affectedRows;
  };
  export const getClientss = async () => {
    const [rows] = await pool.execute(
      `SELECT id, name, email 
      FROM users 
      WHERE role = 1 AND status = 'active'
      ORDER BY name`,
    );
    return rows;
  };


export const getClient = async (page = 1, limit = 10, search = "") => {

  const offset = (page - 1) * limit;

  const { where, params } = buildSearchQuery(search, [
    "name",
    "email",
    "phone"
  ]);

  const [rows] = await pool.execute(
    `
    SELECT id,name,email,phone
    FROM users
    WHERE role = 1
    ${where}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  const [countRows] = await pool.execute(
    `
    SELECT COUNT(*) as total
    FROM users
    WHERE role = 1
    ${where}
    `,
    params
  );

  const total = countRows[0].total;
  const totalPages = Math.ceil(total / limit);

  return { clients: rows, totalPages };
};