export const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    profile_image: user.profile_image,
    device_type: user.device_type,
    device_token: user.device_token,
    time_zone: user.time_zone,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};
