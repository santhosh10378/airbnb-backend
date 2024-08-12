import express from "express";
import {
  createPropertyController,
  getPropertiesController,
  getSinglePropertyController,
  deletePropertyController,
} from "../controllers/property.controllers.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";
import { multerFileUpload } from "../config/multer.config.js";

const router = express.Router();

router.post(
  "/",
  verifyAuthToken,
  multerFileUpload.array("images"),
  createPropertyController
);
router.get("/", getPropertiesController);
router.get("/:id", getSinglePropertyController);
router.delete("/:id", verifyAuthToken, deletePropertyController);

export default router;
