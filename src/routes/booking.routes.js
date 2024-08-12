import express from "express";
import {
  createBookingController,
  getBookingsByPropertyController,
  updateBookingController,
  deleteBookingController,
  getBookingsByHostIdController,
  getBookingsByUserIdController,
} from "../controllers/booking.controllers.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyAuthToken, createBookingController);
router.get("/property/:propertyId", getBookingsByPropertyController);
router.get("/user", verifyAuthToken, getBookingsByUserIdController);
router.get("/host", verifyAuthToken, getBookingsByHostIdController);
router.put("/:id", verifyAuthToken, updateBookingController);
router.delete("/:id", verifyAuthToken, deleteBookingController);

export default router;
