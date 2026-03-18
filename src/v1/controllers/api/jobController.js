import * as jobModel from "../../models/api/jobModel.js";
import { formatUrl } from "../../constants/commonFunctions.js";

export const fetchTodayJobs = async (req, res) => {
  try {
    const user_id = req.user.id;

    const jobs = await jobModel.getTodayJobs(user_id);

    return res.status(200).json({
      code: 200,
      message: "Today Jobs",
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
      message: "Upcoming Jobs",
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
        message: "Job not found or not assigned to this user",
      });
    }

    // FORMAT PHOTOS
    if (job.upload_photo) {
      try {
        const photos = JSON.parse(job.upload_photo);
        job.upload_photo = photos.map(photo => formatUrl(photo));
      } catch {
        job.upload_photo = [];
      }
    }

    // FORMAT SIGNATURE
    if (job.client_signature) {
      job.client_signature = formatUrl(job.client_signature);
    }

    return res.status(200).json({
      code: 200,
      message: "Job details fetched successfully",
      data: job,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      code: 500,
      message: "Server error",
    });

  }
};

export const getMyJobs = async (req, res) => {
  try {

    const userId = req.user.id;

    const jobs = await jobModel.getEmployeeJobs(userId);

    jobs.forEach(job => {

      if (job.upload_photo) {
        const photos = JSON.parse(job.upload_photo);
        job.upload_photo = photos.map(photo => formatUrl(photo));
      }

      if (job.client_signature) {
        job.client_signature = formatUrl(job.client_signature);
      }

    });

    return res.status(200).json({
      code: 200,
      message: "Employee jobs fetched successfully",
      total_jobs: jobs.length,
      data: jobs,
    });

  } catch (err) {

    return res.status(500).json({
      code: 500,
      message: "Server error",
    });

  }
};

export const updateJob = async (req, res) => {
  try {

    const userId = req.user.id;

    const {
      job_id,
      clock_in,
      job_done,
      note,
      clock_out
    } = req.body;

    if (!job_id) {
      return res.status(400).json({
        code: 400,
        message: "Job ID is required"
      });
    }

    // get current job
    const job = await jobModel.getJobDetail(job_id, userId);

    if (!job) {
      return res.status(404).json({
        code: 404,
        message: "Job not found"
      });
    }

    // 🔹 STEP VALIDATION

    if (clock_in && job.status !== "assigned") {
      return res.status(400).json({
        code: 400,
        message: "You cannot clock in at this stage"
      });
    }

    if (job_done && job.status !== "clocked_in") {
      return res.status(400).json({
        code: 400,
        message: "You must clock in before marking job done"
      });
    }

    if (clock_out && job.status !== "job_done") {
      return res.status(400).json({
        code: 400,
        message: "Job must be marked done before completion"
      });
    }

    const photos = req.files?.photos
      ? req.files.photos.map(file => file.filename)
      : null;

    const signature = req.files?.signature
      ? req.files.signature[0].filename
      : null;

    const signature_type = signature ? 1 : 0;

    const result = await jobModel.updateJob({
  job_id,
  userId,
  clock_in,
  job_done,
  note,
  clock_out,
  photos,
  signature,
  signature_type

});

// get updated job
const updatedJob = await jobModel.getJobDetail(job_id, userId);

// format photos
if (updatedJob.upload_photo) {
  try {
    const photos = JSON.parse(updatedJob.upload_photo);
    updatedJob.upload_photo = photos.map(photo => formatUrl(photo));
  } catch {
    updatedJob.upload_photo = [];
  }
}

// format signature
if (updatedJob.client_signature) {
  updatedJob.client_signature = formatUrl(updatedJob.client_signature);
}

return res.status(200).json({
  code: 200,
  message: "Job updated successfully",
  data: updatedJob
});

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      code: 500,
      message: "Server error"
    });

  }
};  

export const fetchJobs = async (req, res) => {
  try {

    const user_id = req.user.id;
    const type = req.query.type; // upcoming or completed

    let jobs;

    if (type === "completed") {
      jobs = await jobModel.getCompletedJobs(user_id);
    } else {
      jobs = await jobModel.getUpcomingJobs(user_id);
    }

    // ✅ get totals
    const completedJobs = await jobModel.getCompletedJobs(user_id);
    const upcomingJobs = await jobModel.getUpcomingJobs(user_id);

    return res.status(200).json({
      code: 200,
      message: `${type || "Upcoming"} Jobs`,
      total_completed_jobs: completedJobs.length,
      total_upcoming_jobs: upcomingJobs.length,
      data: jobs
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      code: 500,
      message: "Server error"
    });

  }
};

export const fetchCustomerCompletedJobs = async (req, res) => {
  try {

    const user_id = req.user.id;
    const client_id = req.query.client_id;   // same style as type

    if (!client_id) {
      return res.status(400).json({
        code: 400,
        message: "Client ID is required"
      });
    }

    const jobs = await jobModel.getCustomerCompletedJobs(user_id, client_id);

    return res.status(200).json({
      code: 200,
      message: "Customer completed jobs",
      total_jobs: jobs.length,
      data: jobs
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      code: 500,
      message: "Server error"
    });

  }
};
