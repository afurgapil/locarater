import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import locationRoutes from "./routes/location.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/locations", locationRoutes);

const MONGODB_URI = process.env.MONGO || "";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
