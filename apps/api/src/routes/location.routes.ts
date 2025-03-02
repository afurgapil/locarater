import { Router } from "express";
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  addReview,
  getReviews,
} from "../controllers/location.controller";
import { authenticateToken, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getLocations);
router.get("/:id", getLocationById);
router.get("/:id/reviews", getReviews);

// Protected routes - requires authentication
router.post("/", authenticateToken, createLocation);
router.put("/:id", authenticateToken, updateLocation);
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["ADMIN", "BUSINESS_OWNER"]),
  deleteLocation
);
router.post("/:id/reviews", authenticateToken, addReview);

export default router;
