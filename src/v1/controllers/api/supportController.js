    import * as supportModel from "../../models/api/supportModel.js";
import { supportSchema } from "../../validations/api/authValidation.js";
import { errorResponse } from "../../utils/response.js";
    
export const sendSupportMessage = async (req, res) => {
  try {
    const { error, value } = supportSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message);

    if (!req.user?.id) {
      return errorResponse(res, "Invalid token or user not logged in");
    }

    const userId = req.user.id;   // ONLY from token

    await supportModel.createMessage({
      user_id: userId,
      name: value.name,
      email: value.email,
      message: value.message
    });

   return res.status(200).json({
  code: 200,
  message: "Support message sent successfully"
});

  } catch (err) {
    console.error("Support API error:", err);
    return errorResponse(res, err.sqlMessage || "Internal server error");
  }
};