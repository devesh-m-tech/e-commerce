import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./database/db.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/ProductRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import orderRoutes from "./routes/orderRoute.js";
import comboRoutes from "./routes/comboRoutes.js";
import searchRoutes from "./routes/searchRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js";
import dealsRoutes from "./routes/dealsRoute.js";
import productVariantRoutes from "./routes/productVariant.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bodyParser from 'body-parser';
import blogRoutes from "./routes/blogRoutes.js";
import notificationRoutes from "./routes/notificationRoute.js";
import otpRoutes from "./routes/otpRoutes.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories if they don't exist
const categoryUploadDir = path.join(__dirname, 'uploads', 'category');
const subcategoryUploadDir = path.join(__dirname, 'uploads', 'subcategory');
const exchangeUploadDir = path.join(__dirname, 'uploads', 'exchange');
const bannerUploadDir = path.join(__dirname, 'uploads', 'banners');

if (!fs.existsSync(categoryUploadDir)) {
  fs.mkdirSync(categoryUploadDir, { recursive: true });
}
if (!fs.existsSync(subcategoryUploadDir)) {
  fs.mkdirSync(subcategoryUploadDir, { recursive: true });
}
if (!fs.existsSync(exchangeUploadDir)) {
  fs.mkdirSync(exchangeUploadDir, { recursive: true });
}
if (!fs.existsSync(bannerUploadDir)) {
  fs.mkdirSync(bannerUploadDir, { recursive: true });
}

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan("dev"));

// Enable CORS with proper configuration
// app.use(cors({
//   origin: ["https://test.picknow.in", "https://mern.picknow.in/"], // Shop and admin ports
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   // allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors())

// Middleware to parse JSON requests
app.use(express.json());
// app.use(bodyParser.json());

app.get('/placeholder.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'placeholder.jpg'));
});

// Configure static file serving
// This will serve files from the 'uploads' directory when requested through /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);     // Mount vendor routes under /api/vendor
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api", comboRoutes);
app.use("/api", searchRoutes);
app.use("/api", dealsRoutes);
app.use("/api/dashboard", dashboardRoutes);  // Mount dashboard routes under /api/dashboard
app.use("/api/variant", productVariantRoutes);  // Mount variant routes under /api/variants
app.use("/api/brand", brandRoutes);  // Mount brand routes under /api/brand
app.use("/api/blog", blogRoutes);  // Mount blog routes under /api/blog
app.use("/api/notifications", notificationRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/settings", settingRoutes);

app.get('/getlog', (req, res) => {
  const logPath = path.join(__dirname, 'logs', 'app.log');
  if (fs.existsSync(logPath)) {
    res.sendFile(logPath);
  } else {
    res.send("No logs found.");
  }
});

app.get('/clearlog', (req, res) => {
  const logPath = path.join(__dirname, 'logs', 'app.log');
  fs.writeFile(logPath, '', (err) => {
    res.send("removed successfully");
  });
});

// Start server
app.listen(port, async () => {
  try {
    await connectdb();
    console.log(`Server running  on port ${port}`);
  } catch (error) {
    console.error("Database connection error:", error);
  }
});
