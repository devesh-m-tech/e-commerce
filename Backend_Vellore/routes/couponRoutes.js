import express from "express";
import {
  getActiveCoupons,
  applyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { isAdminAuth } from "../middelware/isAdminAuth.js";

const router = express.Router();

// ── Public Storefront Endpoints ──
router.get("/active", getActiveCoupons);
router.post("/apply", applyCoupon);

// ── Admin Management Endpoints ──
router.get("/all", isAdminAuth, getAllCoupons);
router.post("/create", isAdminAuth, createCoupon);
router.put("/update/:id", isAdminAuth, updateCoupon);
router.delete("/delete/:id", isAdminAuth, deleteCoupon);

export default router;
