import express from "express";
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
} from "../controllers/favorite.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateToken, addFavorite);
router.delete("/:locationId", authenticateToken, removeFavorite);
router.get("/:userId", getUserFavorites);

export default router;
