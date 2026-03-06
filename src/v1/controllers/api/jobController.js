import * as jobModel from "../../models/api/jobModel.js";

export const fetchTodayJobs = async (req, res) => {
  try {
    const user_id = req.user.id; // from auth middleware

    const jobs = await jobModel.getTodayJobs(user_id);

    return res.status(200).json({
      code: 200,
      Message: "Today Jobs",
      total_jobs: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const fetchUpcomingJobs = async (req, res) => {
  try {
    const user_id = req.user.id;

    const jobs = await jobModel.getUpcomingJobs(user_id);

    return res.status(200).json({
      code: 200,
      Message: "Upcoming Jobs",
      total_jobs: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const getJobDetail = async (req, res) => {
  try {

    const { jobId } = req.params;
    const userId = req.user.id;

    const job = await jobModel.getJobDetail(jobId, userId);

    if (!job) {
      return res.status(404).json({
        code: 404,
        Message: "Job not found or not assigned to this user",
      });
    }

    return res.status(200).json({
      code: 200,
      Message: "Job details fetched successfully",
      data: job,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      code: 500,
      Message: "Server error",
    });

  }
};

export const clockIn = async (req, res) => {
  try {

    const { job_id } = req.body;
    const userId = req.user.id;

    await jobModel.clockIn(job_id, userId);

    return res.status(200).json({
      code: 200,
      Message: "Clocked in successfully",
    });

  } catch (err) {

    return res.status(500).json({
      code: 500,
      Message: "Clock in failed",
    });

  }
};

// export const markJobDone = async (req, res) => {
//   try {

//     const { job_id, note } = req.body;
//     const userId = req.user.id;

//     if (!job_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Job ID is required"
//       });
//     }

//     const result = await jobModel.markJobDone(job_id, note, userId);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Job not found or not assigned to you"
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Job marked as done"
//     });

//   } catch (err) {

//     console.error(err);

//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });

//   }
// };

export const markJobDone = async (req, res) => {
  try {

    const { job_id, note } = req.body;
    const userId = req.user.id;

    if (!job_id) {
      return res.status(400).json({
        code: 400,
        Message: "Job ID is required",
      });
    }

    const result = await jobModel.markJobDone(job_id, note, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        Message: "Job not found or not assigned to you",
      });
    }

    return res.status(200).json({
      code: 200,
      Message: "Job marked as done",
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      code: 500,
      Message: "Server error",
    });

  }
};

// export const getMyJobs = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const jobs = await jobModel.getEmployeeJobs(userId);

//     res.json({
//       success: true,
//       data: jobs,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

export const getMyJobs = async (req, res) => {
  try {

    const userId = req.user.id;

    const jobs = await jobModel.getEmployeeJobs(userId);

    return res.status(200).json({
      code: 200,
      Message: "Employee jobs fetched successfully",
      total_jobs: jobs.length,
      data: jobs,
    });

  } catch (err) {

    return res.status(500).json({
      code: 500,
      Message: "Server error",
    });

  }
};
export const completeJob = async (req, res) => {
  try {

    const { job_id, signature } = req.body;
    const userId = req.user.id;

    const photo = req.file ? req.file.filename : null;

    if (!job_id) {
      return res.status(400).json({
        code: 400,
        Message: "Job ID is required",
      });
    }

    const result = await jobModel.completeJob(
      job_id,
      photo,
      signature,
      userId
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        Message: "Job not found or not assigned to you",
      });
    }

    return res.status(200).json({
      code: 200,
      Message: "Job completed successfully",
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      code: 500,
      Message: "Server error",
    });

  }
};
// export const completeJob = async (req, res) => {
//   try {

//     const { job_id, signature } = req.body;
//     const userId = req.user.id;

//     const photo = req.file ? req.file.filename : null;

//     if (!job_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Job ID is required"
//       });
//     }

//     const result = await jobModel.completeJob(
//       job_id,
//       photo,
//       signature,
//       userId
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Job not found or not assigned to you"
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Job completed successfully"
//     });

//   } catch (err) {

//     console.error(err);

//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });

//   }
// };