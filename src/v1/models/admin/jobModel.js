import { pool } from "../../config/database.js";

  /* -------------------------------------------------------------------------- */
  /*                                JOB MANAGEMENT                              */
  /* -------------------------------------------------------------------------- */
  export const createJob = async (job) => {
    try {
      const {
        title,
        description,
        address,
        job_date,
        user_id,
        client_id,
        start_time,
        end_time,
        latitude,
        longitude,
      } = job;

      // ✅ check employee role
      if (user_id) {
        const [[emp]] = await pool.execute(
          "SELECT id FROM users WHERE id=? AND role=0",
          [user_id],
        );
        if (!emp) throw new Error("Invalid employee id");
      }

      // ✅ check client role
      if (client_id) {
        const [[cli]] = await pool.execute(
          "SELECT id FROM users WHERE id=? AND role=1",
          [client_id],
        );
        if (!cli) throw new Error("Invalid client id");
      }

      // ✅ CHECK EXACT DUPLICATE JOB
      const [duplicate] = await pool.execute(
        `SELECT id FROM jobs
        WHERE user_id = ?
        AND client_id = ?
        AND job_date = ?
        AND title = ?
        AND address = ?
        AND start_time <=> ?
        AND end_time <=> ?
        LIMIT 1`,
        [
          user_id || null,
          client_id || null,
          job_date || null,
          title || null,
          address || null,
          start_time || null,
          end_time || null,
        ],
      );

      if (duplicate.length > 0) {
        throw new Error("Exact same job already assigned");
      }

      // ✅ INSERT JOB
      await pool.execute(
        `INSERT INTO jobs
        (title, description, address, job_date, user_id, client_id, start_time, end_time, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title || null,
          description || null,
          address || null,
          job_date || null,
          user_id || null,
          client_id || null,
          start_time || null,
          end_time || null,
          latitude || null,
          longitude || null,
        ],
      );
    } catch (err) {
      console.error("DB:createJob:", err);
      throw err;
    }
  };
  export const getJobs = async () => {
    const [rows] = await pool.execute(`
      SELECT
        j.id,
        j.title,
        j.description,
        j.job_date,
        j.start_time,
        j.status,

        emp.name  AS emp_name,
        emp.email AS emp_email,

        cli.name  AS client_name,
        cli.email AS client_email

      FROM jobs j
      LEFT JOIN users emp ON emp.id = j.user_id
      LEFT JOIN users cli ON cli.id = j.client_id
      WHERE j.status != 'deleted'   -- ⭐ ADD THIS
      ORDER BY j.id DESC
    `);

    return rows;
  };
  export const getAllJobs = async (page, limit, status = null, employeeId = null) => {

    const offset = (page - 1) * limit;

    let whereClause = "WHERE j.status != 'deleted'";
    let params = [];

    if (status) {
      whereClause += " AND j.status = ?";
      params.push(status);
    }

    if (employeeId) {
      whereClause += " AND j.user_id = ?";
      params.push(employeeId);
    }

    const [jobs] = await pool.execute(
      `
      SELECT 
        j.*, 
        u.name AS emp_name, 
        u.email AS emp_email,
        c.name AS client_name, 
        c.email AS client_email
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      LEFT JOIN users c ON j.client_id = c.id
      ${whereClause}
      ORDER BY j.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM jobs j ${whereClause}`,
      params
    );

    const totalPages = Math.ceil(count[0].total / limit);

    return { jobs, totalPages };
  };

  
  export const updateJob = async (job) => {
    try {
      const {
        id,
        title,
        description,
        address,
        job_date,
        user_id,
        client_id,
        start_time,
        end_time,
        latitude,
        longitude,
      } = job;

      await pool.execute(
        `UPDATE jobs
        SET title=?,
            description=?,
            address=?,
            job_date=?,
            user_id=?,
            client_id=?,
            start_time=?,
            end_time=?,
            latitude=?,
            longitude=?
        WHERE id=?`,
        [
          title,
          description,
          address,
          job_date,
          user_id,
          client_id,
          start_time,
          end_time,
          latitude,
          longitude,
          id,
        ],
      );
    } catch (err) {
      console.error("DB:updateJob:", err);
      throw err;
    }
  };
  export const deleteJobById = async (jobId) => {
    try {
      const [result] = await pool.execute(
        "UPDATE jobs SET status='deleted' WHERE id=?",
        [jobId],
      );

      return result;
    } catch (err) {
      console.error("Model Delete Job Error:", err);
      throw err;
    }
  };
  export const getJobDetailModel = async (jobId) => {

    const [rows] = await pool.execute(
      `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.address,
        j.note,
        j.upload_photo,
        j.client_signature,

        FROM_UNIXTIME(j.job_date/1000,'%d %b %Y') AS job_date,
        FROM_UNIXTIME(j.start_time/1000,'%h:%i %p') AS start_time,
        FROM_UNIXTIME(j.end_time/1000,'%h:%i %p') AS end_time,

        cli.name  AS client_name,
        cli.email AS client_email,
        cli.phone AS client_phone

      FROM jobs j

      LEFT JOIN users cli ON cli.id = j.client_id

      WHERE j.id = ?
      LIMIT 1
      `,
      [jobId]
    );

    return rows[0] || null;
  };
  export const getJobsByEmployee = async (employeeId) => {

    const [rows] = await pool.execute(
      `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.status,

        FROM_UNIXTIME(j.job_date/1000,'%d %b %Y') AS job_date,
        FROM_UNIXTIME(j.start_time/1000,'%h:%i %p') AS start_time,

        emp.name AS emp_name,
        emp.email AS emp_email,

        cli.name AS client_name,
        cli.email AS client_email

      FROM jobs j

      LEFT JOIN users emp ON emp.id = j.user_id
      LEFT JOIN users cli ON cli.id = j.client_id

      WHERE j.user_id = ?

      ORDER BY j.job_date DESC
      `,
      [employeeId]
    );

    return rows;
  };
  export const updateJobStatus = async (job_id, status) => {

    await pool.execute(
      "UPDATE jobs SET status = ? WHERE id = ?",
      [status, job_id]
    );

  };

 
 
 