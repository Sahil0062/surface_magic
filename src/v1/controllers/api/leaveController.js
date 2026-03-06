import * as leaveModel from "../../models/api/leaveModel.js";

export const applyLeave = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { start_date, end_date, reason } = req.body;

    if (!start_date || !end_date)
      return res.status(400).json({ message: "Start and End dates required" }); 

    const startEpoch = new Date(start_date).setHours(0,0,0,0);
    const endEpoch   = new Date(end_date).setHours(0,0,0,0);

    if (endEpoch < startEpoch)
      return res.status(400).json({ message: "End date must be after start date" });

    // 🚫 14 DAY RULE
    const today = new Date();
    today.setHours(0,0,0,0);

    const allowedDate = new Date(today);
    allowedDate.setDate(today.getDate() + 14);

    if (startEpoch < allowedDate.getTime()) {
      return res.status(400).json({
        code: 400,
        message: "Leave must be applied at least 14 days in advance"
      });
    }

    // ✅ Only pending now
    const status = "pending";

    const total_days =
      Math.ceil((endEpoch - startEpoch) / (1000*60*60*24)) + 1;

    await leaveModel.createLeave({
      user_id,
      startEpoch,
      endEpoch,
      total_days,
      reason,
      status
    });

    res.json({ 
      code :200,
      message: "Leave applied successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message:"Server error" });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const user_id = req.user.id;

    const leaves = await leaveModel.getLeavesByUser(user_id);

    res.json({
      code: 200,
      data: leaves,
    });

  } catch (err) {
    console.error("Get leaves error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
