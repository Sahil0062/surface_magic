import http from "node:http";
import dotenv from "dotenv";
import app from "./src/app.js";
import { testConnection } from "./src/v1/config/database.js";
import logger from "./src/v1/utils/logger.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
  try {
    await testConnection();
    server.listen(PORT, () => {
      logger.info(`🚀 Server running at ${process.env.BASE_URL}`);
    });
  } catch (err) {
    logger.error("❌ Failed to start server:", err.message);
  }
};

startServer();
