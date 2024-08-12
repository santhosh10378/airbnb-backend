import express from "express";
import {
  signUpController,
  signInController,
  signOutController,
  profileController,
} from "../controllers/auth.controllers.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.post("/sign-out", signOutController);
router.get("/profile", verifyAuthToken, profileController);

export default router;
