import express from "express";
import {
  createExchangeRequest,
  getUserExchanges,
  trackExchange,
  getAllExchangesAdmin,
  updateExchangeStatusAdmin,
  updateExchangeWorkflowAdmin,
} from "../controllers/exchangeController.js";
import { isAuth } from "../middelware/isAuth.js";
import { isAdminAuth, isAdmin } from "../middelware/isAdminAuth.js";
import { uploadFiles } from "../middelware/multer.js";

const router = express.Router();

// Optional auth middleware for guest checkout / user submissions
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    return isAuth(req, res, next);
  }
  next();
};

// Media upload for exchange photos and video
router.post("/upload", uploadFiles, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided" });
    }
    const fileUrls = req.files.map(f => f.location || `/uploads/${f.filename}`);
    res.status(200).json({ success: true, files: fileUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: "File upload failed: " + err.message });
  }
});

// Customer routes
router.post("/request", optionalAuth, createExchangeRequest);
router.get("/my-exchanges", isAuth, getUserExchanges);
router.get("/track/:orderIdentifier", trackExchange);

// Admin & Staff routes
router.get("/admin/all", isAdminAuth, isAdmin, getAllExchangesAdmin);
router.put("/admin/:id/status", isAdminAuth, isAdmin, updateExchangeStatusAdmin);
router.put("/admin/:id/workflow", isAdminAuth, isAdmin, updateExchangeWorkflowAdmin);

export default router;
