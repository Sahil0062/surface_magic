import { pool } from "../../config/database.js";

// export const getTodayJobs = async (user_id) => {
//   const [rows] = await pool.execute(
//     `
//     SELECT
//       j.id,
//       u.name AS client_name,
//       u.email AS client_email,
//       j.title,
//       j.job_date,
//       j.start_time,
//       j.end_time,
//       j.status
//     FROM jobs j
//     JOIN users u ON u.id = j.client_id
//     WHERE j.user_id = ?
//     AND DATE(FROM_UNIXTIME(j.job_date / 1000)) = CURDATE()
//     ORDER BY j.start_time ASC
//     `,
//     [user_id],
//   );

//   return rows;
// };

export const getTodayJobs = async (user_id) => {
  const [rows] = await pool.execute(
    `
    SELECT
      j.id,
      u.name AS client_name,
      u.email AS client_email,
      u.phone AS client_phone,          -- ✅ added from users table
      j.title,
      j.description,                   -- ✅ added from jobs table
      j.address,                       -- ✅ added
      j.latitude,                      -- ✅ added
      j.longitude,                     -- ✅ added
      j.job_date,
      j.start_time,
      j.end_time,
      j.status
    FROM jobs j
    JOIN users u ON u.id = j.client_id
    WHERE j.user_id = ?
    AND DATE(FROM_UNIXTIME(j.job_date / 1000)) = CURDATE()
    ORDER BY j.start_time ASC
    `,
    [user_id],
  );

  return rows;
};

export const getJobDetail = async (jobId, userId) => {

  const [rows] = await pool.execute(
    `
      SELECT *
      FROM jobs
      WHERE id = ?
      AND user_id = ?
      LIMIT 1
    `,
    [jobId, userId]
  );

  return rows[0] || null;
};

export const getEmployeeJobs = async (userId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [rows] = await pool.execute(
    `
      SELECT *
      FROM jobs
      WHERE user_id = ?
      AND job_date BETWEEN ? AND ?
      ORDER BY start_time ASC
    `,
    [userId, todayStart.getTime(), todayEnd.getTime()],
  );

  return rows;
};

export const updateJob = async (data) => {

  const fields = [];
  const values = [];

  if (data.clock_in) {
    fields.push("clock_in = 1");
    fields.push("clock_in_time = ?");
    fields.push("status = 'clocked_in'");
    values.push(Date.now());
  }

  if (data.job_done) {
    fields.push("job_done = 1");
    fields.push("status = 'job_done'");
  }

  if (data.note) {
    fields.push("note = ?");
    values.push(data.note);
  }

  if (data.photos) {
    fields.push("upload_photo = ?");
    values.push(JSON.stringify(data.photos));
  }

  // ✅ Signature upload
  if (data.signature) {
    fields.push("client_signature = ?");
    fields.push("signature_time = ?");
    fields.push("signature_type = 1"); // <-- added here
    values.push(data.signature, Date.now());
  }

  if (data.clock_out) {
    fields.push("clock_out = 1");
    fields.push("clock_out_time = ?");
    fields.push("status = 'completed'");
    values.push(Date.now());
  }

  const query = `
    UPDATE jobs
    SET ${fields.join(", ")}
    WHERE id = ? AND user_id = ?
  `;

  values.push(data.job_id, data.userId);

  const [result] = await pool.execute(query, values);

  return result;
};

export const getUpcomingJobs = async (user_id) => {

  const [rows] = await pool.execute(
    `SELECT
        j.id,
        u.name AS client_name,
        j.title,
        j.job_date,
        j.start_time,
        j.end_time,
        j.status,
        j.signature_type
     FROM jobs j
     JOIN users u ON u.id = j.client_id
     WHERE j.user_id = ?
     AND DATE(FROM_UNIXTIME(j.job_date / 1000)) >= CURDATE()
     AND j.status != 'completed'
     ORDER BY j.job_date ASC`,
    [user_id]
  );

  return rows;
};

export const getCompletedJobs = async (user_id) => {

  const [rows] = await pool.execute(
    `SELECT
        j.id,
        u.name AS client_name,
        j.title,
        j.job_date,
        j.start_time,
        j.end_time,
        j.status,
        j.signature_type
     FROM jobs j
     JOIN users u ON u.id = j.client_id
     WHERE j.user_id = ?
     AND j.status = 'completed'
     ORDER BY j.job_date DESC`,
    [user_id]
  );

  return rows;
};

export const getCustomerCompletedJobs = async (user_id, client_id) => {

  const [rows] = await pool.execute(
    `
    SELECT
        j.id,
        u.name AS client_name,
        j.title,
        j.job_date,
        j.start_time,
        j.end_time,
        j.status
    FROM jobs j
    JOIN users u ON u.id = j.client_id
    WHERE j.user_id = ?
    AND j.client_id = ?
    AND j.status = 'completed'
    ORDER BY j.job_date DESC
    `,
    [user_id, client_id]
  );

  return rows;
};