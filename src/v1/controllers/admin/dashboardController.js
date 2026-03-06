import * as dashboardModel from "../../models/admin/dashboardModel.js";
import * as leaveModel from "../../models/admin/leaveModel.js";

export const dashboardPage = async (req, res) => {
  try {

    const data = await dashboardModel.getDashboardData();

    res.render("admin/dashboard", {
      ...data,
      activePage: "dashboard"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Dashboard error");
  }
};

export const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await leaveModel.getPendingLeavesModel();

    return res.json({
      success: true,
      count: leaves.length,
      data: leaves,
    });

  } catch (error) {
    console.log("Pending Leave Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};