export const privacyPage = (req, res) => {
  res.render("admin/privacy_policy");
};

export const termsPage = (req, res) => {
  res.render("admin/terms");
};

export const invoicePage = (req, res) => {
  res.render("admin/invoice", {
    activePage: "invoice"
  });
};
