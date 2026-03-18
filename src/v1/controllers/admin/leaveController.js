import * as leaveModel from "../../models/admin/leaveModel.js";
import * as userModel from "../../models/admin/userModel.js";
import * as userModels from "../../models/api/userModel.js";

export const leaveManagementPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const userId = req.params.userId || null;
    const status = req.query.status || null; // ✅ NEW

    let result;
    let stats;
    let selectedEmployee = null;

    if (userId) {
      result = await leaveModel.getLeavesByUser(userId, page, limit);

      stats = await leaveModel.getLeaveStatsByUser(userId);

      selectedEmployee = await userModel.getUserById(userId);
    } else {
      result = await leaveModel.getAllLeaves(page, limit, status); // ✅ UPDATED

      stats = await leaveModel.getLeaveStats();
    }

    const employees = await userModel.getEmployeess();

    res.render("admin/leave_management", {
      leaves: result.leaves || [],
      stats: stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
      employees,
      currentPage: page,
      totalPages: result.totalPages || 1,
      selectedUser: userId,
      selectedEmployee,
      success: req.query.success || null,
      activePage: "leave",
      status,
    });
  } catch (err) {
    console.error("Leave Management Error:", err);
    res.render("admin/leave_management", {
      leaves: [],
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
      employees: [],
      currentPage: 1,
      totalPages: 1,
      selectedUser: null,
      selectedEmployee: null,
      success: null,
    });
  }
};

export const approveLeave = async (req, res) => {
  try {
    await leaveModel.updateLeaveStatus(req.params.id, "approved");

    const status = req.query.status;

    return res.redirect(
      `/admin/leave-management${status ? `?status=${status}` : ""}`
    );

  } catch (err) {
    console.error("Approve Leave Error:", err);
    return res.status(500).send("Server error");
  }
};

export const rejectLeave = async (req, res) => {
  try {
    await leaveModel.updateLeaveStatus(req.params.id, "rejected");

    const status = req.query.status;

    return res.redirect(
      `/admin/leave-management${status ? `?status=${status}` : ""}`
    );

  } catch (err) {
    console.error("Reject Leave Error:", err);
    return res.status(500).send("Server error");
  }
};

export const adminApplyLeave = async (req, res) => {
  try {
    const { user_id, start_date, end_date, reason } = req.body;

    if (!user_id || !start_date || !end_date)
      return res.status(400).json({ message: "All fields required" });

    const startEpoch = new Date(start_date).setHours(0, 0, 0, 0);
    const endEpoch = new Date(end_date).setHours(0, 0, 0, 0);

    if (endEpoch < startEpoch)
      return res.status(400).json({ message: "Invalid dates" });

    const total_days =
      Math.ceil((endEpoch - startEpoch) / (1000 * 60 * 60 * 24)) + 1;

    // ✅ Admin leave auto-approved
    await userModels.createLeave({
      user_id,
      startEpoch,
      endEpoch,
      total_days,
      reason,
      status: "approved",
      applied_by_admin: 1, // optional flag
    });

    return res.status(200).json({
      message: "Emergency leave applied successfully",
      code: 200,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      code: 500,
    });
  }
};
