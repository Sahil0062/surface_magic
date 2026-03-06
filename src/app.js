import express from "express";
import cors from "cors";
import path from "path";
import userRoutes from "./v1/routes/api/userRoutes.js";
import adminRoutes from "./v1/routes/admin/adminRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.set("view engine", "ejs");
app.set("views", path.resolve("src/v1/views"));


app.get("/", (req, res) => {
  res.send("SURFACE MAGIC API RUNNING 🚀");
});


app.use("/api/v1/users", userRoutes);
app.use("/admin", adminRoutes);

export default app;
