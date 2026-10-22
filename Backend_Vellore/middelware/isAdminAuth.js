import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

// Authentication Middleware
export const isAdminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Admin.findById(decoded._id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Admin not found or unauthorized" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Admin & Staff Role Check Middleware
export const isAdmin = (req, res, next) => {
  const allowedRoles = ["admin", "super_admin", "sales_staff", "inventory_staff", "exchange_staff"];
  if (req.user && allowedRoles.includes(req.user.role) && req.user.status !== "inactive") {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Insufficient permissions." });
  }
};
