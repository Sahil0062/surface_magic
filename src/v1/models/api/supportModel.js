import { pool } from "../../config/database.js";

export const createMessage = async ({ user_id, name, email, message }) => {
  const sql = `
    INSERT INTO support_messages
    (user_id, name, email, message)
    VALUES (?, ?, ?, ?)
  `;

  return pool.execute(sql, [user_id, name, email, message]);
};