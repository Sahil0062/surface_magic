import express from "express";
import { adminAuth } from "../../middlewares/userAuthMiddleware.js";
const router = express.Router();


/* ================= DASHBOARD ================= */

import {
  dashboardPage,
  getPendingLeaves
} from "../../controllers/admin/dashboardController.js";

//* ================= AUTH CONTROLLER ================= */

import {
  // adminSignup,
  adminLogin,
  changeAdminPassword,
  loginPage,
  changePasswordPage,
  logout
} from "../../controllers/admin/adminAuthController.js";


/* ================= EMPLOYEES ================= */

import {
  userManagementPage,
  addEmployee,
  toggleUserStatus,
  updateEmployee,
  deleteEmployee,
  employeeList,
  getEmployeeJobsPage,
  renderUserManagementView
} from "../../controllers/admin/employeeController.js";

/* ================= CLIENTS ================= */

import {
  clientManagementPage,
  addClient,
  updateClient,
  deleteClient,
  clientList
} from "../../controllers/admin/clientController.js";

/* ================= JOBS ================= */

import {
  jobAssignmentPage,
  jobDetailPage,
  addJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getJobDetailPage
} from "../../controllers/admin/jobController.js";

/* ================= LEAVES ================= */

import {
  leaveManagementPage,
  approveLeave,
  rejectLeave,
  adminApplyLeave
} from "../../controllers/admin/leaveController.js";

/* ================= PROFILE ================= */

import {
  profilePage,
  updateProfile,
  getAdminProfile
} from "../../controllers/admin/profileController.js";

/* ================= OTHER PAGES ================= */

import {
  privacyPage,
  termsPage,
  invoicePage
} from "../../controllers/admin/staticPageController.js";



/* ================= MIDDLEWARE ================= */

import { upload } from "../../../services/storage/uploadMiddleware.js";

import {
  authenticateUser,
  authenticateAdmin,
} from "../../middlewares/userAuthMiddleware.js";

import {
  clientSchema,
  employeeSchema,
  updateEmployeeSchema,
} from "../../validations/admin/clientValidation.js";

import { validate } from "../../middlewares/validate.js";



/* ================= AUTH ROUTES ================= */

router.get("/login", loginPage);
router.post("/login", adminLogin);
router.post("/logout", authenticateAdmin, logout);

// router.post("/signup", upload.single("profile_image"), adminSignup);

router.get("/change-password", changePasswordPage);
router.post("/change-password", authenticateAdmin, changeAdminPassword);


/* ================= DASHBOARD ================= */

router.get("/dashboard", dashboardPage,adminAuth);
router.get("/pending-leaves", getPendingLeaves);



/* ================= PROFILE ================= */

router.get("/profile", authenticateAdmin, profilePage);

router.post(
  "/update-profile",
  authenticateAdmin,
  upload.single("profile_image"),
  updateProfile
);

router.get("/profile-data", authenticateAdmin, getAdminProfile);

/* ================= USERS / EMPLOYEES ================= */

router.get("/user-management", userManagementPage,adminAuth);

router.get("/employees", employeeList);

router.post(
  "/add-employee",
  upload.single("profile_image"),
  validate(employeeSchema),
  addEmployee
);

router.put(
  "/user/edit/:id",
  upload.single("profile_image"),
  validate(updateEmployeeSchema),
  updateEmployee
);

router.get("/userManagementView", renderUserManagementView);

router.post("/user/delete/:id", deleteEmployee);

router.post("/user-status/:id", toggleUserStatus);

router.get("/employee-jobs/:id", getEmployeeJobsPage);



/* ================= CLIENTS ================= */

router.get("/client", clientManagementPage,adminAuth);

router.get("/clients", clientList);

router.post("/add-client", validate(clientSchema), addClient);

router.put("/client/edit/:id", validate(clientSchema), updateClient);

router.delete("/client/delete/:id", deleteClient);



/* ================= JOBS ================= */

router.get("/job-assignment", jobAssignmentPage,adminAuth);
router.get("/job-detail", jobDetailPage);

router.post("/create-job", addJob);
router.post("/update-job", updateJob);
router.post("/update-job-status", updateJobStatus);
router.post("/delete-job", deleteJob);

router.get("/job-detail/:id", getJobDetailPage);



/* ================= LEAVES ================= */

router.get("/leave-management", leaveManagementPage,adminAuth);
router.get("/leave-management/:userId", leaveManagementPage);

router.post("/leave/:id/approve", approveLeave);
router.post("/leave/:id/reject", rejectLeave);

router.post("/apply-leave", adminApplyLeave);



/* ================= OTHER PAGES ================= */

router.get("/privacy", privacyPage);
router.get("/terms", termsPage);
router.get("/invoice", invoicePage);



export default router;