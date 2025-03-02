import { Router, RequestHandler } from "express";
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} from "../controllers/location.controller";

const router = Router();

router.post("/", createLocation as RequestHandler);
router.get("/", getLocations as RequestHandler);
router.get("/:id", getLocationById as RequestHandler);
router.put("/:id", updateLocation as RequestHandler);
router.delete("/:id", deleteLocation as RequestHandler);

export default router;
