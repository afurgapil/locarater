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

const router = Router();
// Public routes
router.get("/", getLocations);
router.get("/user", authenticateToken, getLocationByUser);
router.get("/:id", getLocationById);

// Protected routes
router.post("/", authenticateToken, createLocation);
router.put("/:id", authenticateToken, updateLocation);
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["ADMIN", "BUSINESS_OWNER"]),
  deleteLocation
);

export default router;
