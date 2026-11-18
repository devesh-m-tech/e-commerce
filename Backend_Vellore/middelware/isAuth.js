import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";

// Authentication Middleware
export const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id).select("-password");

    // If not found in User collection, check Admin collection (e.g. Admin browsing storefront)
    if (!req.user) {
      const admin = await Admin.findById(decoded._id).select("-password");
      if (admin) {
        req.user = admin;
        req.user.role = admin.role || "admin";
        req.user.isAdmin = true;
      }
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not found or unauthorized" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Admin Role Check Middleware
// export const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     return next();
//   }
//  else {
//   return res.status(403).json({ message: "Access denied. Admins only." });
//  }
// };
