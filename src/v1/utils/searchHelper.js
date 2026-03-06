export const buildSearchQuery = (search, fields = []) => {

  if (!search || fields.length === 0) {
    return { where: "", params: [] };
  }

  const conditions = fields.map(field => `${field} LIKE ?`).join(" OR ");
  const params = fields.map(() => `%${search}%`);

  return {
    where: ` AND (${conditions})`,
    params
  };

};