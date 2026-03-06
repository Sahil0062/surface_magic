import { pool } from "../../config/database.js";

export const getTodayJobs = async (user_id) => {
  const [rows] = await pool.execute(
    `
    SELECT
      j.id,
      u.name AS client_name,
      u.email AS client_email,
      j.title,
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

export const getUpcomingJobs = async (user_id) => {
  const [rows] = await pool.execute(
    `SELECT
        j.id,
        u.name AS client_name,
        j.title,
        j.start_time,
        j.end_time,
        j.status
     FROM jobs j
     JOIN users u ON u.id = j.client_id
     WHERE j.user_id = ?
     AND DATE(FROM_UNIXTIME(j.job_date / 1000)) > CURDATE()
     ORDER BY j.job_date ASC`,
    [user_id],
  );

  return rows;
};

export const getJobDetail = async (jobId, userId) => {
  const [rows] = await pool.execute(
    `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.address,
        j.job_date,
        j.start_time,
        j.end_time,
        j.status,
        j.note,
        j.upload_photo,
        j.client_signature,

        c.name AS client_name,
        c.email AS client_email,
        c.phone AS client_phone

      FROM jobs j
      LEFT JOIN users c ON j.client_id = c.id
      WHERE j.id = ? AND j.user_id = ?
    `,
    [jobId, userId],
  );

  return rows[0];
};

export const clockIn = async (jobId, userId) => {
  await pool.execute(
    `
      UPDATE jobs
      SET 
        clock_in = 1,
        clock_in_time = ?,
        status = 'clocked_in'
      WHERE id = ? AND user_id = ?
    `,
    [Date.now(), jobId, userId],
  );
};

export const markJobDone = async (jobId, note, userId) => {

  const [result] = await pool.execute(
    `
      UPDATE jobs
      SET 
        note = ?,
        status = 'job_done'
      WHERE id = ? AND user_id = ?
    `,
    [note, jobId, userId]
  );

  return result;

};

export const uploadPhoto = async (jobId, photo) => {
  await pool.execute(
    `
      UPDATE jobs
      SET upload_photo = ?
      WHERE id = ?
    `,
    [photo, jobId],
  );
};

export const saveSignature = async (jobId, signature) => {
  await pool.execute(
    `
      UPDATE jobs
      SET client_signature = ?,
          signature_time = ?
      WHERE id = ?
    `,
    [signature, Date.now(), jobId],
  );
};

export const clockOut = async (jobId) => {
  await pool.execute(
    `
      UPDATE jobs
      SET clock_out = 1,
          clock_out_time = ?,
          status = 'completed'
      WHERE id = ?
    `,
    [Date.now(), jobId],
  );
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

export const completeJob = async (jobId, photo, signature, userId) => {

  const [result] = await pool.execute(
    `
    UPDATE jobs
    SET 
      upload_photo = ?,
      client_signature = ?,
      signature_time = ?,
      clock_out = 1,
      clock_out_time = ?,
      status = 'completed'
    WHERE id = ? 
    AND user_id = ?
    `,
    [
      photo,
      signature,
      Date.now(),
      Date.now(),
      jobId,
      userId
    ]
  );

  return result;

};