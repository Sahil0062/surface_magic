import * as userAuthModel from "../../v1/models/api/userModel.js";
import fs from "node:fs";
import path from "node:path";

export const formatUrl = (fileName) => {
  if (!fileName || fileName === "null") return null;

  const BASE_URL = process.env.BASE_URL || "http://localhost:3556";

  // if already full URL
  if (fileName.startsWith("http://") || fileName.startsWith("https://"))
    return fileName;

  // remove /uploads/ if already saved wrongly
  const cleanName = fileName.replace(/^\/?uploads\//, "");

  return `${BASE_URL}/uploads/${cleanName}`;
};
