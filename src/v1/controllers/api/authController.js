import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authModel from "../../models/api/authModel.js";
import { signinSchema } from "../../validations/api/authValidation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { sanitizeUser } from "../../utils/userSanitizer.js";
import { formatUrl } from "../../constants/commonFunctions.js";

export const signin = async (req, res) => {
  try {
    const { error, value } = signinSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return errorResponse(res, message);
    }

    const user = await authModel.getActiveUserByEmail(value.email);

    if (!user) return errorResponse(res, "Invalid email or password");
    if (user.status === "blocked")
      return errorResponse(res, "Your account is blocked. Contact admin.");
    if (user.status === "deleted")
      return errorResponse(res, "Your account has been deleted.");

    const isMatch = await bcrypt.compare(value.password, user.password || "");
    if (!isMatch) return errorResponse(res, "Invalid email or password");

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRY || "7d",
    });

    await authModel.updateUserLogin({
      userId: user.id,
      token,
      device_type: value.device_type ?? null,
      device_token: value.device_token ?? null,
      time_zone: value.time_zone ?? null,
      status: "active",
    });

    user.status = "active";

    user.profile_image = formatUrl(user.profile_image);
    user.device_type = value.device_type ?? null;
    user.device_token = value.device_token ?? null;
    user.time_zone = value.time_zone ?? null;

    const safeUser = sanitizeUser(user);
    safeUser.token = token;

    return successResponse(res, "Login successful", safeUser);
  } catch (err) {
    console.error("Signin error:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "Token missing",
      });
    }

    await authModel.logoutUser(req.user.id, token);

    return res.status(200).json({
      code: 200,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);

    return res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await authModel.deleteUserAccount(req.user.id);

    return res.status(200).json({
      code: 200,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error("Delete account error:", err);

    return res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};
