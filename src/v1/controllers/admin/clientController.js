import * as clientModel from "../../models/admin/clientModel.js";
import * as userModel from "../../models/admin/userModel.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { sanitizeUser } from "../../utils/userSanitizer.js";

export const clientManagementPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const search = req.query.search || ""; 

    const { clients, totalPages } = await clientModel.getClient(
      page,
      limit,
      search,
    ); 

    res.render("admin/client_management", {
      clients,
      currentPage: page,
      totalPages,
      search, 
      activePage: "client",
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading clients");
  }
};

export const addClient = async (req, res) => {
  try {
    const { name, email, phone, device_type, device_token, time_zone } =
      req.body;

    if (!name || !email || !phone)
      return errorResponse(res, "Name, email and phone are required");

    if (device_type && ![1, 2].includes(device_type))
      return errorResponse(res, "device_type must be 1=apple or 2=android");

    const result = await clientModel.createClient({
      name,
      email,
      phone,
      device_type,
      device_token,
      time_zone,
    });

    if (result?.error) return errorResponse(res, result.error);

    const user = await userModel.getUserById(result.id);

    return successResponse(res, "Client added", sanitizeUser(user));
  } catch (err) {
    console.error("Add Client Error:", err);
    return errorResponse(res, "Server error", 500);
  }
};

export const updateClient = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("ID:", req.params.id);

    const { name, email, phone } = req.body;
    const id = req.params.id;

    const updated = await clientModel.updateClientModel({
      id,
      name,
      email,
      phone,
    });

    if (!updated) {
      return errorResponse(res, "Client not found", 404);
    }

    return successResponse(res, "Client updated successfully");
  } catch (err) {
    console.error("Update Client Error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await clientModel.deleteClientModel(id);

    if (!deleted) {
      return errorResponse(res, "Client not found", 404);
    }

    return successResponse(res, "Client deleted successfully");
  } catch (err) {
    console.error("Delete Client Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

export const clientList = async (req, res) => {
  try {
    const clients = await clientModel.getClientss();
    return successResponse(res, "Client list", clients);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error");
  }
};
