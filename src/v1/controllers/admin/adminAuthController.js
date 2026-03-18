import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as adminModel from "../../models/admin/adminModel.js";
import { formatUrl } from "../../constants/commonFunctions.js";

const SALT_ROUNDS = 10;
// export const adminSignup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const profile_image = req.file ? req.file.filename : null;

//     if (!name || !email || !password)
//       return res.status(400).json({ message: "All fields required" });

//     const exists = await adminModel.getAdminByEmail(email);
//     if (exists)
//       return res.status(400).json({ message: "Email already exists" });

//     const hash = await bcrypt.hash(password, SALT_ROUNDS);

//     const adminId = await adminModel.createAdmin({
//       name,
//       email,
//       password: hash,
//       profile_image,
//     });

//     return res.status(200).json({
//       message: "Admin created",
//       code: 200,
//       adminId,
//       profile_image: formatUrl(profile_image),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    email = email.toLowerCase().trim();

    const admin = await adminModel.getAdminByEmail(email);
    if (!admin)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    await adminModel.updateAccessToken(admin.id, token);
    await adminModel.updateAdminStatus(admin.id, 1);

    admin.profile_image = formatUrl(admin.profile_image);
    delete admin.password;

    return res.status(200).json({
      message: "Login successful",
      code: 200,
      token,
      admin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be 6+ chars" });

    const admin = await adminModel.getAdminById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match)
      return res.status(400).json({ message: "Old password incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);

    await adminModel.updateAdminPassword(adminId, hash);

    return res.status(200).json({
      message: "Password changed successfully",
      code: 200,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginPage = (req, res) => {
  res.render("admin/login");
};

export const changePasswordPage = (req, res) => {
  res.render("admin/change_password", {
    activePage: "changePassword",
  });
};

export const logout = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const adminId = req.user.id;

    await adminModel.logoutAdmin(adminId);

    res.json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};