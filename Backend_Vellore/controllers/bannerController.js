import fs from "fs";
import path from "path";
import Banner from "../models/Banner.js";

// Initial seed banners for luxury silk brand
const DEFAULT_BANNERS = [
  {
    title: "Nice Summer Collection",
    subtitle: "A Good Looking, Comfortable Traditional Collection",
    tag: "Handloom Heritage",
    buttonText: "SHOP THE COLLECTION",
    link: "/products",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85",
    order: 1,
    isActive: true,
  },
  {
    title: "Pure Kanchipuram Bridal Silks",
    subtitle: "Timeless 24K Pure Zari Heirlooms Woven for Generations",
    tag: "Muhurtham Exclusive",
    buttonText: "EXPLORE BRIDAL SILKS",
    link: "/products?category=cat_silk_sarees",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85",
    order: 2,
    isActive: true,
  },
  {
    title: "Royal Banarasi & Tussar Weaves",
    subtitle: "Exquisite Handcrafted Drapes for Festive Elegance",
    tag: "Festive Splendour",
    buttonText: "DISCOVER THE WEAVES",
    link: "/products",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85",
    order: 3,
    isActive: true,
  },
];

// Seed default banners helper
const ensureBannersExist = async () => {
  const count = await Banner.countDocuments();
  if (count === 0) {
    await Banner.insertMany(DEFAULT_BANNERS);
  }
};

// 1. Get active banners (Public - for customer store)
export const getActiveBanners = async (req, res) => {
  try {
    await ensureBannersExist();
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error("Error fetching active banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hero banners",
      error: error.message,
    });
  }
};

// 2. Get all banners (Admin - includes inactive ones)
export const getAllBanners = async (req, res) => {
  try {
    await ensureBannersExist();
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error("Error fetching all banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin banners",
      error: error.message,
    });
  }
};

// 3. Get single banner by ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }
    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve banner",
      error: error.message,
    });
  }
};

// 4. Create new banner (Admin)
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, tag, buttonText, link, order, isActive } = req.body;

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    }

    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required (upload a file or provide an imageUrl)",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required",
      });
    }

    const newBanner = new Banner({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      tag: tag ? tag.trim() : "Exclusive Collection",
      buttonText: buttonText ? buttonText.trim() : "SHOP THE COLLECTION",
      link: link ? link.trim() : "/products",
      imageUrl: imageUrl.trim(),
      order: order !== undefined && order !== "" ? Number(order) : 0,
      isActive: isActive === undefined ? true : isActive === "true" || isActive === true,
    });

    const savedBanner = await newBanner.save();

    res.status(201).json({
      success: true,
      message: "Hero banner created successfully",
      banner: savedBanner,
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create hero banner",
      error: error.message,
    });
  }
};

// 5. Update banner (Admin)
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const { title, subtitle, tag, buttonText, link, order, isActive } = req.body;

    if (title !== undefined) banner.title = title.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle.trim();
    if (tag !== undefined) banner.tag = tag.trim();
    if (buttonText !== undefined) banner.buttonText = buttonText.trim();
    if (link !== undefined) banner.link = link.trim();
    if (order !== undefined && order !== "") banner.order = Number(order);
    if (isActive !== undefined) {
      banner.isActive = isActive === "true" || isActive === true;
    }

    // Handle new uploaded image
    if (req.file) {
      const oldImage = banner.imageUrl;
      banner.imageUrl = `/uploads/banners/${req.file.filename}`;

      // Clean up previous local file if applicable
      if (oldImage && oldImage.startsWith("/uploads/banners/")) {
        const oldPath = path.join(process.cwd(), oldImage);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (unlinkErr) {
            console.warn("Failed to delete old banner image file:", unlinkErr);
          }
        }
      }
    } else if (req.body.imageUrl && req.body.imageUrl.trim()) {
      banner.imageUrl = req.body.imageUrl.trim();
    }

    const updatedBanner = await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update banner",
      error: error.message,
    });
  }
};

// 6. Delete banner (Admin)
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Clean up local uploaded file
    if (banner.imageUrl && banner.imageUrl.startsWith("/uploads/banners/")) {
      const filePath = path.join(process.cwd(), banner.imageUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn("Failed to delete banner file:", unlinkErr);
        }
      }
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      error: error.message,
    });
  }
};

// 7. Toggle active status (Admin)
export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      banner,
    });
  } catch (error) {
    console.error("Error toggling banner status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle banner status",
      error: error.message,
    });
  }
};

// 8. Reorder banners (Admin)
export const reorderBanners = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Invalid payload, items array required" });
    }

    const updates = items.map((item) =>
      Banner.findByIdAndUpdate(item.id || item._id, { order: Number(item.order) })
    );
    await Promise.all(updates);

    const updatedList = await Banner.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Banners reordered successfully",
      banners: updatedList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reorder banners",
      error: error.message,
    });
  }
};
