import * as jobModel from "../../models/admin/jobModel.js";


export const jobAssignmentPage = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const status = req.query.status || null;
    const employeeId = req.query.employee || null;   // ⭐ ADD THIS
    const search = req.query.search || ""; 

    const result = await jobModel.getAllJobs(page, limit, status, employeeId);

    res.render("admin/job_assignment", {
      jobs: result.jobs,
      currentPage: page,
      totalPages: result.totalPages,
      activePage: "jobs",
      selectedStatus: status || null,
      selectedEmployee: employeeId || null,   // optional but useful
      search  
    });

  } catch (err) {

    console.error("Job page error:", err);

    res.render("admin/job_assignment", {
      jobs: [],
      currentPage: 1,
      totalPages: 1,
      activePage: "jobs",
      selectedStatus: null,
      selectedEmployee: null
    });

  }
};

export const jobDetailPage = (req, res) => {
  res.render("admin/job_detail_view");
};

export const addJob = async (req, res) => {
  try {

    let {
      title,
      description,
      address,
      date,
      user_id,
      client_id,
      start_time,
      end_time,
      latitude,
      longitude
    } = req.body;

    // Convert date + time → epoch
    const startEpoch = (date && start_time)
      ? new Date(`${date}T${start_time}`).getTime()
      : null;

    const endEpoch = (date && end_time)
      ? new Date(`${date}T${end_time}`).getTime()
      : null;

    const jobData = {
      title: title || null,
      description: description || null,
      address: address || null,
      job_date: date ? new Date(date).getTime() : null,
      user_id: user_id || null,
      client_id: client_id || null,
      start_time: startEpoch,
      end_time: endEpoch,
      latitude: latitude || null,
      longitude: longitude || null
    };

    await jobModel.createJob(jobData);

    return res.status(200).json({
      message: "Job created successfully",
      code: 200
    });

  } catch (err) {

    console.error("Add Job Error:", err);

    return res.status(500).json({
      message: err.message,
      code: 500
    });

  }
};

export const updateJobStatus = async (req, res) => {
  try {

    const { job_id, status } = req.body;

    if (!job_id || !status) {
      return res.status(400).json({
        message: "Job ID and status are required",
        code: 400
      });
    }

    await jobModel.updateJobStatus(job_id, status);

    return res.status(200).json({
      message: "Job status updated successfully",
      code: 200
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      message: "Error updating job",
      code: 500
    });

  }
};

export const deleteJob = async (req, res) => {
  try {

    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({
        message: "Job ID required",
        code: 400
      });
    }

    await jobModel.deleteJobById(job_id);

    return res.status(200).json({
      message: "Job deleted successfully",
      code: 200
    });

  } catch (err) {

    console.error("Delete Job Error:", err);

    return res.status(500).json({
      message: "Server error",
      code: 500
    });

  }
};

export const updateJob = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      address,
      date,
      user_id,
      client_id,
      start_time,
      end_time,
      latitude,
      longitude
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Job ID required" });
    }

    // 👉 Convert date + time → epoch
    const startEpoch = (date && start_time)
      ? new Date(`${date}T${start_time}`).getTime()
      : null;

    const endEpoch = (date && end_time)
      ? new Date(`${date}T${end_time}`).getTime()
      : null;

    const jobData = {
      id,
      title: title || null,
      description: description || null,
      address: address || null,
      job_date: date ? new Date(date).getTime() : null,
      user_id: user_id || null,
      client_id: client_id || null,
      start_time: startEpoch,
      end_time: endEpoch,
      latitude: latitude || null,
      longitude: longitude || null
    };

    await jobModel.updateJob(jobData);

    return res.status(200).json({
      message: "Job updated successfully",
      code: 200
    });
    
  } catch (err) {
    console.error("Update Job Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getJobDetailPage = async (req, res) => {
  try {

    const jobId = req.params.id;

    const job = await jobModel.getJobDetailModel(jobId);

    res.render("admin/job_detail_view", {
      job,
      activePage: "jobs"
    });

  } catch (error) {
    console.error(error);
    res.redirect("/admin/jobs");
  }
};