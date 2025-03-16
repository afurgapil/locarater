import dotenv from "dotenv";
import path from "path";

const environment = process.env.NODE_ENV || "development";
console.log(`Loading environment: ${environment}`);
const envPath = path.resolve(__dirname, `../.env.${environment}`);
console.log(`Looking for .env file at: ${envPath}`);
dotenv.config({
  path: envPath,
});

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import locationRoutes from "./routes/location.routes";
import authRoutes from "./routes/auth.routes";
import reviewRoutes from "./routes/review.routes";
import userRoutes from "./routes/user.routes";
import statisticsRoutes from "./routes/statistics.routes";
import reviewReportRoutes from "./routes/review-report.routes";
import feedRoutes from "./routes/feed.routes";

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/locations", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/review-reports", reviewReportRoutes);
app.use("/api/feed", feedRoutes);

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/locarater";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error: any) => console.error("MongoDB connection error:", error));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
