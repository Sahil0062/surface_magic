import * as adminModel from "../../models/admin/adminModel.js";

export const profilePage = async (req, res) => {
  try {
    const id = req.user.id;   // from auth middleware

    const admin = await adminModel.getAdminById(id);

    res.render("admin/profile", {
      admin,
      activePage: "profile"
    });

  } catch (err) {
    console.error("Profile page error:", err);

    res.render("admin/profile", {
      admin: null,
      activePage: "profile"
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.user.id; // from JWT middleware

    const { name, email } = req.body;

    let profile_image = null;

    if (req.file) {
      profile_image = req.file.filename;
    }

    await adminModel.updateAdminProfile({
      id,
      name,
      email,
      profile_image
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {

    const adminId = req.user.id;   // ✅ FROM JWT

    const admin = await adminModel.getAdminById(adminId);

    if (!admin) {
      return res.json({
        success: false,
        message: "Admin not found"
      });
    }

    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};