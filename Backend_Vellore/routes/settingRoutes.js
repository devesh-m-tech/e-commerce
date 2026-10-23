import express from "express";
import {
  getSettings,
  getPublicSettings,
  updateSettings,
  resetSettings
} from "../controllers/settingController.js";
import { isAdminAuth, isAdmin } from "../middelware/isAdminAuth.js";
import { uploadBannerImage } from "../middelware/bannerMulter.js";

const router = express.Router();

// Public route for storefront to read necessary rules (free shipping threshold, store hours, etc.)
router.get("/public", getPublicSettings);

// Admin route to read full configuration
router.get("/", isAdminAuth, getSettings);

// Admin routes to update or reset configuration
router.put("/", isAdminAuth, isAdmin, updateSettings);
router.post("/reset", isAdminAuth, isAdmin, resetSettings);

// Admin route to upload hero background image file
router.post(
  "/upload-hero",
  isAdminAuth,
  uploadBannerImage.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file provided" });
      }
      const imageUrl = `/uploads/banners/${req.file.filename}`;
      return res.status(200).json({
        success: true,
        message: "Hero background image uploaded successfully",
        imageUrl
      });
    } catch (error) {
      console.error("Error uploading hero image:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
