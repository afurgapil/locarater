import { Router } from "express";
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getLocationByUser,
  updateLocationImageFromReview,
} from "../controllers/location.controller";
import { authenticateToken, checkRole } from "../middleware/auth.middleware";
import imageUpload from "../utils/imageUpload";

const router = Router();

router.get("/", getLocations);
router.get("/user", authenticateToken, getLocationByUser);
router.get("/:id", getLocationById);

// @ts-ignore
router.post("/", authenticateToken, imageUpload("locations"), createLocation);
// @ts-ignore
router.put("/:id", authenticateToken, imageUpload("locations"), updateLocation);
router.delete("/:id", authenticateToken, deleteLocation);

router.put(
  "/:locationId/image-from-review",
  authenticateToken,
  checkRole(["ADMIN"]),
  updateLocationImageFromReview
);
export default router;
