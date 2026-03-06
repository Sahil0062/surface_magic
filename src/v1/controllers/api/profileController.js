import * as userModel from "../../models/api/userModel.js";
import { updateProfileSchema } from "../../validations/api/authValidation.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const updateProfile = async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) return errorResponse(res, error.message, 400);

    const userId = req.user.id;

    const profileImage = req.file ? req.file.filename : null;

    await userModel.updateUserProfile({
      userId,
      name: value.name,
      profile_image: profileImage,
    });

    const updatedUser = await userModel.getUserById(userId);

    return successResponse(res, "Profile updated successfully", updatedUser, 200);
  } catch (err) {
    console.error("Update profile error:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = await userModel.getUserDetail(req.user.id);

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "User profile", user, 200);
  } catch (err) {
    console.error("Profile error:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

export const userDetail = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!userId) return errorResponse(res, "Invalid user ID", 400);

    const user = await userModel.getUserDetail(userId);

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "User detail", user, 200);
  } catch (err) {
    console.error("User detail error:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};