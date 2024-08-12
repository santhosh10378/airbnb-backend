import express from "express";
import {
  addToWishlistController,
  removeFromWishlistController,
  getUserWishlistController,
  isPropertyInWishlistController,
} from "../controllers/wishlist.controllers.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyAuthToken);
router.post("/", addToWishlistController);
router.delete("/:propertyId", removeFromWishlistController);
router.get("/", getUserWishlistController);
router.get("/:propertyId", isPropertyInWishlistController);

export default router;
