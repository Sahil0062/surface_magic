import express from "express";

import { signin, logout, deleteAccount } from "../../controllers/api/authController.js";

import { updateProfile, userProfile, userDetail } from "../../controllers/api/profileController.js";

import { sendSupportMessage } from "../../controllers/api/supportController.js";

import { applyLeave, getMyLeaves } from "../../controllers/api/leaveController.js";

import {
 fetchTodayJobs,
 fetchUpcomingJobs,
 getJobDetail,
 clockIn,
 markJobDone,
//  uploadPhoto,
//  saveSignature,
//  clockOut,
 getMyJobs,
 completeJob
} from "../../controllers/api/jobController.js"
import { signinSchema } from "../../validations/api/authValidation.js";
import { supportSchema } from "../../validations/api/authValidation.js";
import { validate } from "../../middlewares/validate.js";
import { authenticateUser } from "../../middlewares/userAuthMiddleware.js";
import { upload } from "../../../services/storage/uploadMiddleware.js";

const router = express.Router();

/* ================= JOB ACTIONS ================= */

router.get("/my-jobs", authenticateUser, getMyJobs);
router.get("/job-detail/:jobId", authenticateUser, getJobDetail);

router.post("/clock-in", authenticateUser, clockIn);
router.post("/job-done", authenticateUser, markJobDone);
// router.post("/upload-photo", authenticateUser, uploadPhoto);
// router.post("/save-signature", authenticateUser, saveSignature);
// router.post("/clock-out", authenticateUser, clockOut);
router.post( "/complete-job",  authenticateUser,  upload.single("photo"),  completeJob);


router.get("/today-jobs", authenticateUser, fetchTodayJobs);
router.get("/upcoming-jobs", authenticateUser, fetchUpcomingJobs);

/* ================= AUTH ================= */

router.post("/signin", validate(signinSchema), signin);
router.post("/logout", authenticateUser, logout);
router.delete("/delete-account", authenticateUser, deleteAccount);

/* ================= PROFILE ================= */

router.get("/userProfile", authenticateUser, userProfile);

router.put(
  "/profile",
  authenticateUser,
  upload.single("profile_image"),
  updateProfile
);

/* ================= USER ================= */

router.get("/detail/:id", authenticateUser, userDetail);

/* ================= SUPPORT ================= */

router.post(
  "/support",
  authenticateUser,
  validate(supportSchema),
  sendSupportMessage
);

/* ================= LEAVES ================= */

router.post("/apply", authenticateUser, applyLeave);
router.get("/leaves", authenticateUser, getMyLeaves);



export default router;