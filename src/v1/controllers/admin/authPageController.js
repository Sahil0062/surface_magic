export const loginPage = (req, res) => {
  res.render("admin/login");
};

export const changePasswordPage = (req, res) => {
  res.render("admin/change_password", {
    activePage: "changePassword",
  });
};
