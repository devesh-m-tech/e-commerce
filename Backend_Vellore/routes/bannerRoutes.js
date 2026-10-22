import express from "express";
import {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
} from "../controllers/bannerController.js";
import { isAdminAuth } from "../middelware/isAdminAuth.js";
import { uploadBannerImage } from "../middelware/bannerMulter.js";

const router = express.Router();

// Multer error handling wrapper
const uploadMiddleware = (req, res, next) => {
  uploadBannerImage.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ── Public Routes (Storefront) ──
router.get("/", getActiveBanners);
router.get("/active", getActiveBanners);
router.get("/detail/:id", getBannerById);

// ── Admin Routes ──
router.get("/admin/all", isAdminAuth, getAllBanners);
router.post("/admin/create", isAdminAuth, uploadMiddleware, createBanner);
router.put("/admin/update/:id", isAdminAuth, uploadMiddleware, updateBanner);
router.delete("/admin/delete/:id", isAdminAuth, deleteBanner);
router.patch("/admin/status/:id", isAdminAuth, toggleBannerStatus);
router.put("/admin/reorder", isAdminAuth, reorderBanners);

export default router;
