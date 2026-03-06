export const successResponse = (
  res,
  message = "Success",
  data = null,
  code = 200
) => {
  return res.status(code).json({
    code,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "Error",
  code = 400
) => {
  return res.status(code).json({
    code,
    message,
  });
};
