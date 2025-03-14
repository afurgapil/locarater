import { Router } from "express";
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getLocationByUser,
} from "../controllers/location.controller";
import { authenticateToken, checkRole } from "../middleware/auth.middleware";
import imageUpload from "../utils/imageUpload";
const router = Router();
// Public routes
router.get("/", getLocations);
router.get("/user", authenticateToken, getLocationByUser);
router.get("/:id", getLocationById);

// Protected routes
router.post("/", authenticateToken, imageUpload("locations"), createLocation);
router.put("/:id", authenticateToken, imageUpload("locations"), updateLocation);
router.delete("/:id", authenticateToken, deleteLocation);

export default router;
