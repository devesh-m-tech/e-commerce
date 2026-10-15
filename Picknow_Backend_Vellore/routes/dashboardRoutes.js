import express from "express";
import {
  getIncomeStats,
  getAdminDashboardSummary,
  getComprehensiveReports,
} from "../controllers/dashboard.js";
import { isAdminAuth, isAdmin } from "../middelware/isAdminAuth.js";

const router = express.Router();

// Income statistics route - protected for admin only
router.get("/income-stats", isAdminAuth, isAdmin, getIncomeStats);

// Admin dashboard summary (total orders, today's sales, pending exchanges, low stock alerts)
router.get("/summary", isAdminAuth, isAdmin, getAdminDashboardSummary);

// Comprehensive reports (daily, weekly, monthly, yearly, product sales, stock, payments, exchanges)
router.get("/reports", isAdminAuth, isAdmin, getComprehensiveReports);

export default router;
