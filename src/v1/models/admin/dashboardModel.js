
import { pool } from "../../config/database.js";
/* -------------------------------------------------------------------------- */
  /*                                DASHBOARD                                   */
  /* -------------------------------------------------------------------------- */
  export const getRecentActivities = async () => {
    const [rows] = await pool.execute(`
      SELECT 
          j.id,
          j.status,
          j.job_date,
          j.start_time,
          j.end_time,
          e.name AS employee_name,
          e.profile_image AS employee_image,
          c.name AS client_name
      FROM jobs j
      LEFT JOIN users e ON j.user_id = e.id
      LEFT JOIN users c ON j.client_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 10
    `);

    return rows;
  };
  export const getDashboardData = async () => {

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const startEpoch = todayStart.getTime();
    const endEpoch = todayEnd.getTime();

    const [[activeJobs]] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM jobs
      WHERE status IN ('assigned','clocked_in','in_progress')
      AND job_date BETWEEN ? AND ?
    `, [startEpoch, endEpoch]);

    const [[pendingLeaves]] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM leaves
      WHERE status = 'pending'
    `);

    const [[completedToday]] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM jobs
      WHERE status = 'completed'
      AND job_date BETWEEN ? AND ?
    `, [startEpoch, endEpoch]);

    const [[clockedIn]] = await pool.execute(`
      SELECT COUNT(DISTINCT user_id) as total
      FROM jobs
      WHERE clock_in_time BETWEEN ? AND ?
    `, [startEpoch, endEpoch]);

    const [recentJobs] = await pool.execute(`
  SELECT 
    j.*,
    u.name AS emp_name,
    u.email AS emp_email,
    u.profile_image AS emp_image,
    c.name AS client_name,
    c.email AS client_email,

    CASE
      WHEN j.end_time < ?
          AND j.status NOT IN ('completed','job_done')
      THEN 'failed'
      ELSE j.status
    END AS display_status

  FROM jobs j
  LEFT JOIN users u ON j.user_id = u.id
  LEFT JOIN users c ON j.client_id = c.id

  WHERE j.job_date BETWEEN ? AND ?
  AND j.status != 'deleted'

  ORDER BY j.start_time ASC
  `, [Date.now(), startEpoch, endEpoch]);

    return {
      activeJobs: activeJobs.total,
      pendingLeaves: pendingLeaves.total,
      completedToday: completedToday.total,
      clockedIn: clockedIn.total,
      recentJobs
    };
  };
