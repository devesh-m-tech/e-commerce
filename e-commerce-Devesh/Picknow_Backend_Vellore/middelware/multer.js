import multer from "multer";
import { v4 as uuid } from "uuid";
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const hasS3Config = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_BUCKET_NAME &&
  process.env.AWS_BUCKET_NAME.trim() !== ""
);

// Configure S3 Client if configured
export const s3 = hasS3Config
  ? new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION || "ap-south-1",
    })
  : null;

// Ensure local uploads directory exists
const localUploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

// Storage strategy: S3 if configured, otherwise local disk
const storage = hasS3Config
  ? multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      acl: "public-read",
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const id = uuid();
        const extension = file.originalname.split(".").pop();
        cb(null, `${id}.${extension}`);
      },
    })
  : multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "uploads/");
      },
      filename: function (req, file, cb) {
        const id = uuid();
        const extension = file.originalname.split(".").pop();
        cb(null, `${id}.${extension}`);
      },
    });

// Create multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, WEBP, and MP4 are allowed."));
    }
  },
});

// Middleware for handling file uploads
export const uploadFiles = (req, res, next) => {
  upload.array("pImage", 15)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // If S3, location exists; if disk, file.path exists
        if (file.location) {
          file.path = file.location;
        }
      });
    }
    next();
  });
};

/**
 * Delete images from S3 or local disk
 * @param {string[]} urls Array of URLs/paths to delete
 */
export const deleteImageFromS3 = async (urls) => {
  if (!urls || urls.length === 0) return;

  if (hasS3Config && s3) {
    const objectsToDelete = urls.map((url) => {
      const key = url.split("/").pop();
      return { Key: key };
    });

    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete,
        Quiet: false,
      },
    });

    try {
      const response = await s3.send(command);
      console.log("Successfully deleted objects from S3:", response);
      return response;
    } catch (err) {
      console.error("Error deleting objects from S3:", err);
      throw err;
    }
  } else {
    // Local file deletion fallback
    urls.forEach((url) => {
      try {
        const filename = url.split("/").pop();
        const filePath = path.join(localUploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.warn("Could not delete local file:", e.message);
      }
    });
  }
};

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 10MB" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Maximum is 15 files" });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
};