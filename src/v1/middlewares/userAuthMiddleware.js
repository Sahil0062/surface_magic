import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

export const generateUserToken = (payload) => {
  if (!payload) return null;

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 🔥 IMPORTANT: Check token in DB
    const [rows] = await pool.execute(
      "SELECT id,email,status,access_token FROM users WHERE id=?",
      [decoded.id],
    );

    if (!rows.length)
      return res.status(401).json({ message: "User not found" });

    if (rows[0].status === "blocked")
      return res.status(403).json({ message: "Account blocked" });

    // ❌ OLD TOKEN CHECK
    if (!rows[0].access_token || rows[0].access_token !== token) {
      return res.status(401).json({ message: "Session expired. Login again." });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// export const authenticateAdmin = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log("Decoded ID:", decoded.id);

//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    res.status(500).json({ message: "Server error" });
  }
};