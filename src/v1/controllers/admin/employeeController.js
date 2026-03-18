import bcrypt from "bcrypt";
import * as userModel from "../../models/admin/userModel.js";
import * as jobModel from "../../models/admin/jobModel.js";
import { SALT_ROUNDS } from "../../constants/authConstant.js";
import { sanitizeUser } from "../../utils/userSanitizer.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const userManagementPage = async (req, res) => {
  try {
    const BASE_URL = process.env.BASE_URL;

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || "";

    const { users, total } = await userModel.getUsers(page, limit, search);

    const usersWithImage = users.map((user) => ({
      ...user,
      profile_image: user.profile_image
        ? BASE_URL +
          "/uploads/" +
          user.profile_image.replace(/^\/?uploads\//, "")
        : null,
    }));

    if (req.xhr) {
  return res.render("admin/user_management", {
    users: usersWithImage,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    activePage: "users",
    search,
    layout: false
  });
}

    res.render("admin/user_management", {
      users: usersWithImage,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      activePage: "users",
      search,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading users");
  }
};

export const renderUserManagementView = (req, res) => {
  res.render("admin/userManagementView", {
    activePage: "user-management"
  });
};

export const addEmployee = async (req, res) => {
  try {
    const { name, email, password } =
      req.body;

    if (!name || !email || !password)
      return errorResponse(res, "Name, email, password required");

    const emailExists = await userModel.emailExists(email);
    if (emailExists) return errorResponse(res, "Email already exists");

    const profile_image = req.file ? `/uploads/${req.file.filename}` : null;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      profile_image,
      role: 0,
      status: "inactive",
    });

    const user = await userModel.getUserById(userId);

return res.status(200).json({
  message: "Employee added",
  code: 200,
  data: sanitizeUser(user)
});

} catch (err) {
    console.error(err);
    return errorResponse(res, "Server error", 500);
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    console.log("Status update:", req.params.id, req.body.status);

    await userModel.updateUserStatus(req.params.id, req.body.status);

return res.status(200).json({
  message: "Status updated",
  code: 200
});

} catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEmployee = async (req, res) => {
  try {

    const id = req.params.id;
    const { name, email, password } = req.body;

    const image = req.file ? req.file.filename : null;

    let updateData = {
      id,
      name,
      email,
      profile_image: image
    };

    // ✅ Only update password if admin entered one
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const result = await userModel.updateEmployee(updateData);

    console.log("SQL Result:", result);

    return res.status(200).json({
      message: "Employee updated successfully",
      code: 200
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      message: "Error updating employee",
      code: 500
    });

  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const userId = req.params.id;

    await userModel.deleteUser(userId);

return res.status(200).json({
  message: "Employee deleted",
  code: 200
});

} catch (err) {
    console.error(err);
    return errorResponse(res, "Delete failed", 500);
  }
};

export const employeeList = async (req, res) => {
  try {
    const employees = await userModel.getEmployeess();
return res.status(200).json({
  message: "Employee list",
  code: 200,
  data: employees
});

} catch (err) {
    console.error(err);
return res.status(500).json({
  message: "Server error",
  code: 500
});  }
};

export const getEmployeeJobsPage = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const jobs = await jobModel.getJobsByEmployee(employeeId);

    res.render("admin/job_assignment", {
      jobs,
      activePage: "jobs",
    });
  } catch (error) {
    console.error("Employee jobs error:", error);
    res.redirect("/admin/user-management");
  }
};
